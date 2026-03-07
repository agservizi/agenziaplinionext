import crypto from "crypto";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import { resolveDatabaseVisuraPrice } from "@/lib/visure-pricing-engine";
import {
  createOpenApiVisuraRequest,
  getOpenApiVisureCatalog,
  supportedVisuraServices,
  type SupportedVisuraService,
} from "@/lib/openapi-visure";
import { notifyClientAreaEvent } from "@/lib/area-client-notifications";

export const runtime = "nodejs";

const VISURE_MAGIC_LINK_SECRET = String(
  process.env.VISURE_MAGIC_LINK_SECRET ||
    process.env.CAF_PATRONATO_MAGIC_LINK_SECRET ||
    process.env.ADMIN_PORTAL_SESSION_SECRET ||
    process.env.CLIENT_PORTAL_SESSION_SECRET ||
    "ag-visure-magic-link",
).trim();
const VISURE_MAGIC_LINK_TTL_HOURS = Number(process.env.VISURE_MAGIC_LINK_TTL_HOURS || 240);
const VISURE_OPERATOR_EMAIL = String(
  process.env.VISURE_OPERATOR_EMAIL || process.env.RESEND_TO || "ag.servizi16@gmail.com",
).trim();

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureClientAreaRequestsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      area VARCHAR(40) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      notes TEXT DEFAULT '',
      details_json JSON NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_requests_area (area),
      KEY idx_client_area_requests_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaVisureRequestsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_visure_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT '',
      provider_service VARCHAR(191) NOT NULL DEFAULT '',
      provider_request_id VARCHAR(191) NOT NULL DEFAULT '',
      provider_status VARCHAR(80) NOT NULL DEFAULT '',
      document_url TEXT NULL,
      provider_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_visure_requests_request (request_id),
      KEY idx_client_area_visure_requests_provider_status (provider_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaVisureMagicLinksTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_visure_magic_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_visure_magic_request (request_id),
      UNIQUE KEY uq_client_area_visure_magic_token (token_hash)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaPaymentsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      shipment_id INT NULL,
      stripe_session_id VARCHAR(191) NOT NULL,
      amount_cents INT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'eur',
      payment_status VARCHAR(40) NOT NULL DEFAULT '',
      checkout_status VARCHAR(40) NOT NULL DEFAULT '',
      price_label VARCHAR(191) NOT NULL DEFAULT '',
      stripe_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_area_payments_session (stripe_session_id),
      KEY idx_client_area_payments_request (request_id),
      KEY idx_client_area_payments_shipment (shipment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaInvoicesTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      payment_id INT NULL,
      shipment_id INT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT 'pending',
      provider_document_id VARCHAR(191) NOT NULL DEFAULT '',
      status VARCHAR(60) NOT NULL DEFAULT 'pending_provider_config',
      invoice_pdf_url TEXT NULL,
      billing_json JSON NULL,
      provider_payload_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_invoices_request (request_id),
      KEY idx_client_area_invoices_payment (payment_id),
      KEY idx_client_area_invoices_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function normalizeObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function hashVisureMagicToken(token: string) {
  return crypto.createHash("sha256").update(`${VISURE_MAGIC_LINK_SECRET}:${token}`).digest("hex");
}

function buildVisureMagicLink(token: string) {
  const siteUrl =
    String(process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "") || "https://agenziaplinio.it";
  return `${siteUrl}/evadi-pratica/visure?token=${encodeURIComponent(token)}`;
}

async function createVisureMagicLink(requestId: number) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashVisureMagicToken(rawToken);
  const expiresAt = new Date(Date.now() + VISURE_MAGIC_LINK_TTL_HOURS * 60 * 60 * 1000);
  const pool = getPool();

  await pool.execute(
    `INSERT INTO client_area_visure_magic_links (request_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [requestId, tokenHash, expiresAt],
  );

  return {
    rawToken,
    link: buildVisureMagicLink(rawToken),
    expiresAt,
  };
}

function isManualVisuraFallbackError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("credito") ||
    normalized.includes("credit") ||
    normalized.includes("saldo") ||
    normalized.includes("token insuff") ||
    normalized.includes("insufficient") ||
    normalized.includes("fondi")
  );
}

async function sendVisuraMagicLinkEmail(input: {
  requestId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceLabel: string;
  amountCents: number;
  currency: string;
  fallbackReason: string;
  magicLink: string;
  expiresAt: Date;
}) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM || "").trim();
  const to = VISURE_OPERATOR_EMAIL;
  if (!apiKey || !from || !to) return { sent: false, reason: "not_configured" as const };

  const expiresLabel = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(input.expiresAt);
  const totalLabel = `${(input.amountCents / 100).toFixed(2).replace(".", ",")} ${input.currency.toUpperCase()}`;
  const subject = `Visura in evasione manuale #${input.requestId}`;

  const text = [
    `Richiesta visura #${input.requestId}`,
    `Cliente: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    `Telefono: ${input.customerPhone || "Non indicato"}`,
    `Servizio: ${input.serviceLabel}`,
    `Importo pagato: ${totalLabel}`,
    `Motivo fallback: ${input.fallbackReason}`,
    `Scadenza link: ${expiresLabel}`,
    "",
    `Apri pratica: ${input.magicLink}`,
  ].join("\n");

  const html = `
    <div style="background:#eef4f8;padding:28px;font-family:Helvetica,Arial,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #dbe4ea;border-radius:22px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f172a,#11324d);padding:24px 28px;">
          <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Visure manuali</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">Richiesta da prendere in carico</h1>
          <p style="margin:8px 0 0;color:#dbeafe;font-size:14px;">Pagamento confermato, ma il provider non ha credito sufficiente per evadere automaticamente.</p>
        </div>
        <div style="padding:28px;">
          <div style="border:1px solid #e2e8f0;border-radius:16px;padding:18px;background:#f8fafc;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#64748b;width:180px;">Pratica</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">#${input.requestId}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Cliente</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${input.customerName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${input.customerEmail}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Telefono</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${input.customerPhone || "Non indicato"}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Servizio</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${input.serviceLabel}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Importo pagato</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${totalLabel}</td></tr>
            </table>
          </div>
          <div style="margin-top:18px;border-left:4px solid #f59e0b;background:#fff7ed;padding:14px 16px;border-radius:12px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#9a3412;">Motivo della presa in carico manuale</p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#7c2d12;">${input.fallbackReason}</p>
          </div>
          <div style="margin-top:24px;">
            <a href="${input.magicLink}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:14px;font-weight:700;">
              Apri pratica con magic link
            </a>
          </div>
          <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#475569;">
            Il link resta valido fino al <strong>${expiresLabel}</strong>. Aprendo la pratica puoi completare l'evasione manuale e allegare il documento da rendere disponibile al cliente.
          </p>
        </div>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.customerEmail,
      subject,
      text,
      html,
    }),
  });

  return { sent: response.ok, reason: response.ok ? ("sent" as const) : ("http_error" as const) };
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = String(body?.action || "request").trim();

  if (action === "catalog") {
    try {
      const catalog = await getOpenApiVisureCatalog();
      return NextResponse.json(catalog, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        {
          sandbox: false,
          services: [],
          message:
            error instanceof Error
              ? error.message
              : "Catalogo OpenAPI visure non disponibile.",
        },
        { status: 502 },
      );
    }
  }

  const serviceType = String(body?.serviceType || "").trim();
  const customerName = String(body?.customerName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();
  const notes = String(body?.notes || "").trim();
  const stripeSessionId = String(body?.stripeSessionId || "").trim();
  const resolvedServiceHash = String(body?.resolvedServiceHash || "").trim();
  const resolvedServiceLabel = String(body?.resolvedServiceLabel || "").trim();
  const formData = normalizeObject(body?.formData);

  if (!serviceType || !customerName || !email || !email.includes("@")) {
    return NextResponse.json(
      { message: "Compila almeno nome, email e tipologia di visura." },
      { status: 400 },
    );
  }

  if (!supportedVisuraServices.includes(serviceType as SupportedVisuraService)) {
    return NextResponse.json({ message: "Tipologia visura non valida." }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  if (!stripeSessionId) {
    return NextResponse.json(
      { message: "Pagamento non trovato. Completa prima il checkout Stripe." },
      { status: 400 },
    );
  }

  try {
    const price = await resolveDatabaseVisuraPrice(serviceType as SupportedVisuraService);
    const stripeSession = await getStripeCheckoutSession(stripeSessionId);
    const paymentCompleted =
      stripeSession.status === "complete" && stripeSession.paymentStatus === "paid";

    if (!paymentCompleted) {
      return NextResponse.json(
        { message: "Il pagamento Stripe non risulta completato." },
        { status: 402 },
      );
    }

    if (
      stripeSession.currency.toLowerCase() !== "eur" ||
      stripeSession.amountTotal !== price.amountCents
    ) {
      return NextResponse.json(
        {
          message:
            "Il pagamento Stripe non corrisponde all'importo atteso. La richiesta è stata bloccata.",
        },
        { status: 409 },
      );
    }

    let manualFulfillment = false;
    let fallbackReason = "";
    let providerResult;
    try {
      providerResult = await createOpenApiVisuraRequest({
        serviceType: serviceType as SupportedVisuraService,
        customerName,
        email,
        phone,
        notes,
        formData,
        resolvedServiceHash,
        resolvedServiceLabel,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Richiesta visura OpenAPI non riuscita.";
      if (!isManualVisuraFallbackError(message)) {
        throw error;
      }

      manualFulfillment = true;
      fallbackReason = message;
      providerResult = {
        provider: "AG SERVIZI Backoffice",
        providerService: resolvedServiceLabel || serviceType,
        status: "awaiting_manual_fulfillment",
        providerRequestId: "",
        message:
          "Pagamento confermato. La pratica e stata presa in carico manualmente: il documento verra caricato nello storico appena evaso dal backoffice.",
        documentUrl: "",
        documentBase64: "",
        summary: {
          presaInCarico: "manuale backoffice",
          disponibilitaDocumento: "appena completato",
        },
        raw: {
          fallbackMode: "manual_fulfillment",
          fallbackReason: message,
        },
      };
    }

    let requestId = 0;
    let paymentId = 0;

    if (hasDatabaseConfig()) {
      await ensureClientAreaRequestsTable();
      await ensureClientAreaVisureRequestsTable();
      await ensureClientAreaVisureMagicLinksTable();
      await ensureClientAreaPaymentsTable();
      await ensureClientAreaInvoicesTable();
      const pool = getPool();
      const [requestResult] = await pool.execute(
        `INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES ('visure', ?, ?, ?, ?, ?, ?, ?)`,
        [
          serviceType,
          customerName,
          email,
          phone,
          notes,
          JSON.stringify({
            ...formData,
            provider: providerResult.provider,
            providerService: providerResult.providerService,
            providerRequestId: providerResult.providerRequestId,
            providerStatus: providerResult.status,
            providerSummary: providerResult.summary,
          }),
          providerResult.status === "completed" ? "completed" : "processing",
        ],
      );

      requestId = Number((requestResult as any)?.insertId || 0);

      const [paymentResult] = await pool.execute(
        `INSERT INTO client_area_payments
          (request_id, stripe_session_id, amount_cents, currency, payment_status, checkout_status, price_label, stripe_response_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          request_id = VALUES(request_id),
          amount_cents = VALUES(amount_cents),
          currency = VALUES(currency),
          payment_status = VALUES(payment_status),
          checkout_status = VALUES(checkout_status),
          price_label = VALUES(price_label),
          stripe_response_json = VALUES(stripe_response_json),
          updated_at = CURRENT_TIMESTAMP`,
        [
          requestId || null,
          stripeSession.id,
          stripeSession.amountTotal,
          stripeSession.currency,
          stripeSession.paymentStatus,
          stripeSession.status,
          price.label,
          JSON.stringify(stripeSession),
        ],
      );

      paymentId = Number((paymentResult as any)?.insertId || 0);

      await pool.execute(
        `INSERT INTO client_area_visure_requests
          (request_id, provider, provider_service, provider_request_id, provider_status, document_url, provider_response_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId || null,
          providerResult.provider,
          providerResult.providerService,
          providerResult.providerRequestId,
          providerResult.status,
          providerResult.documentUrl || null,
          JSON.stringify(providerResult.raw),
        ],
      );

      if (manualFulfillment && requestId > 0) {
        const magicLink = await createVisureMagicLink(requestId);
        await sendVisuraMagicLinkEmail({
          requestId,
          customerName,
          customerEmail: email,
          customerPhone: phone,
          serviceLabel: providerResult.providerService,
          amountCents: stripeSession.amountTotal,
          currency: stripeSession.currency,
          fallbackReason,
          magicLink: magicLink.link,
          expiresAt: magicLink.expiresAt,
        });
      }

      const invoiceProvider = process.env.INVOICE_PROVIDER || "pending";
      const invoiceStatus =
        invoiceProvider === "acube_stripe"
          ? "managed_in_stripe_acube"
          : invoiceProvider
            ? "pending_provider_issue"
            : "pending_provider_config";

      await pool.execute(
        `INSERT INTO client_area_invoices
          (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)`,
        [
          requestId || null,
          paymentId || null,
          invoiceProvider,
          stripeSession.invoiceId || "",
          invoiceStatus,
          stripeSession.invoicePdf || stripeSession.hostedInvoiceUrl || null,
          JSON.stringify({
            customerName,
            email,
            phone,
          }),
          JSON.stringify({
            stripeSession,
            visuraService: serviceType,
            nextStep:
              invoiceProvider === "acube_stripe"
                ? "La gestione fiscale prosegue nell'app A-Cube dentro Stripe"
                : "Documento fiscale in attesa di gestione",
          }),
        ],
      );
    }

    void notifyClientAreaEvent({
      area: "visure",
      title: "Nuova visura creata",
      customerName,
      customerEmail: email,
      customerPhone: phone,
      details: {
        servizio: serviceType,
          provider: providerResult.provider,
          providerRequestId: providerResult.providerRequestId,
          statoProvider: providerResult.status,
          presaInCaricoManuale: manualFulfillment ? "si" : "no",
          importo: `${(stripeSession.amountTotal / 100).toFixed(2)} ${String(stripeSession.currency || "eur").toUpperCase()}`,
        },
      });

    return NextResponse.json(
      {
        message: providerResult.message,
        requestId,
        provider: providerResult.provider,
        providerService: providerResult.providerService,
        providerStatus: providerResult.status,
        providerRequestId: providerResult.providerRequestId,
        documentUrl: providerResult.documentUrl,
        documentBase64: providerResult.documentBase64,
        summary: providerResult.summary,
        payment: {
          amountCents: stripeSession.amountTotal,
          currency: stripeSession.currency,
          sessionId: stripeSession.id,
          priceLabel: price.label,
          invoicePdf: stripeSession.invoicePdf,
          hostedInvoiceUrl: stripeSession.hostedInvoiceUrl,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Richiesta visura OpenAPI non riuscita.",
      },
      { status: 502 },
    );
  }
}
