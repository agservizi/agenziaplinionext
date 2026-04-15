import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { createInpostShipment, getMissingInpostConfig } from "@/lib/inpost-shipment";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import { resolveShippingPrice } from "@/lib/shipping-pricing-engine";
import { notifyClientAreaEvent } from "@/lib/area-client-notifications";

export const runtime = "nodejs";

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

async function ensureClientAreaShipmentsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_shipments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      tracking_code VARCHAR(64) NOT NULL DEFAULT '',
      parcel_id VARCHAR(64) NOT NULL DEFAULT '',
      shipment_number_from VARCHAR(32) NOT NULL DEFAULT '',
      shipment_number_to VARCHAR(32) NOT NULL DEFAULT '',
      label_pdf_base64 LONGTEXT NULL,
      brt_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_shipments_tracking (tracking_code)
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

function requireString(value: unknown) {
  return String(value || "").trim();
}

function requirePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getInpostValidationMessage(destinationCountry: string) {
  if (destinationCountry !== "IT") {
    return "InPost e disponibile in questo flusso solo per destinazioni italiane (IT).";
  }
  return "";
}

export async function POST(request: Request) {
  const missing = getMissingInpostConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      {
        message: `Configurazione InPost incompleta: ${missing.join(", ")}.`,
      },
      { status: 503 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato" }, { status: 503 });
  }

  const body = await request.json();
  const stripeSessionId = requireString(body?.stripeSessionId);
  const payload = {
    customerName: requireString(body?.customerName),
    email: requireString(body?.email).toLowerCase(),
    phone: requireString(body?.phone),
    billingType: requireString(body?.billingType || "privato"),
    billingCompanyName: requireString(body?.billingCompanyName),
    billingVatNumber: requireString(body?.billingVatNumber).toUpperCase(),
    billingTaxCode: requireString(body?.billingTaxCode).toUpperCase(),
    billingRecipientCode: requireString(body?.billingRecipientCode).toUpperCase(),
    billingCertifiedEmail: requireString(body?.billingCertifiedEmail).toLowerCase(),
    billingAddress: requireString(body?.billingAddress),
    billingZIPCode: requireString(body?.billingZIPCode),
    billingCity: requireString(body?.billingCity),
    billingProvince: requireString(body?.billingProvince).toUpperCase(),
    pickupAddress: requireString(body?.pickupAddress),
    pickupZIPCode: requireString(body?.pickupZIPCode),
    pickupCity: requireString(body?.pickupCity),
    pickupProvince: requireString(body?.pickupProvince).toUpperCase(),
    destinationCompanyName: requireString(body?.destinationCompanyName),
    destinationAddress: requireString(body?.destinationAddress),
    destinationZIPCode: requireString(body?.destinationZIPCode),
    destinationCity: requireString(body?.destinationCity),
    destinationProvince: requireString(body?.destinationProvince).toUpperCase(),
    destinationCountry: requireString(body?.destinationCountry || "IT").toUpperCase(),
    pudoId: requireString(body?.pudoId),
    parcelCount: requirePositiveNumber(body?.parcelCount),
    parcelLengthCM: requirePositiveNumber(body?.parcelLengthCM),
    parcelHeightCM: requirePositiveNumber(body?.parcelHeightCM),
    parcelDepthCM: requirePositiveNumber(body?.parcelDepthCM),
    weightKG: requirePositiveNumber(body?.weightKG),
    notes: requireString(body?.notes),
    serviceCode: requireString(body?.serviceCode || "ritiro-nazionale"),
    carrierProvider: "inpost" as const,
    inpostPackageSize: requireString(body?.inpostPackageSize).toLowerCase(),
  };

  const volumeCM3 =
    payload.parcelLengthCM * payload.parcelHeightCM * payload.parcelDepthCM * payload.parcelCount;
  const volumeM3 = Number((volumeCM3 / 1_000_000).toFixed(4));
  const volumetricWeightKG = Number((volumeCM3 / 4000).toFixed(2));

  if (
    !stripeSessionId ||
    !payload.customerName ||
    !payload.email.includes("@") ||
    !payload.phone ||
    !payload.pickupAddress ||
    !payload.pickupZIPCode ||
    !payload.pickupCity ||
    !payload.pickupProvince ||
    !payload.destinationCompanyName ||
    !payload.destinationAddress ||
    !payload.destinationZIPCode ||
    !payload.destinationCity ||
    !payload.destinationProvince ||
    !payload.parcelCount ||
    !payload.parcelLengthCM ||
    !payload.parcelHeightCM ||
    !payload.parcelDepthCM ||
    !payload.weightKG
  ) {
    return NextResponse.json(
      { message: "Pagamento o dati spedizione mancanti. Completa prima il checkout Stripe." },
      { status: 400 },
    );
  }

  const inpostValidationError = getInpostValidationMessage(payload.destinationCountry);
  if (inpostValidationError) {
    return NextResponse.json({ message: inpostValidationError }, { status: 400 });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaShipmentsTable();
    await ensureClientAreaPaymentsTable();
    await ensureClientAreaInvoicesTable();

    const pool = getPool();
    const taxableWeightKG = Math.max(payload.weightKG, volumetricWeightKG);
    const expectedPrice = await resolveShippingPrice(
      taxableWeightKG,
      volumeM3,
      payload.destinationCountry,
      {
        strict: true,
        carrierProvider: payload.carrierProvider,
        packageSize: payload.inpostPackageSize,
      },
    );
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
      stripeSession.amountTotal !== expectedPrice.amountCents
    ) {
      return NextResponse.json(
        {
          message:
            "Il pagamento Stripe non corrisponde all'importo atteso. La spedizione e stata bloccata.",
        },
        { status: 409 },
      );
    }

    const [requestResult] = await pool.execute(
      `INSERT INTO client_area_requests
        (area, service_type, customer_name, email, phone, notes, details_json, status)
       VALUES ('spedizioni', ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        payload.serviceCode,
        payload.customerName,
        payload.email,
        payload.phone,
        payload.notes,
        JSON.stringify({
          carrierProvider: payload.carrierProvider,
          pickupAddress: payload.pickupAddress,
          pickupZIPCode: payload.pickupZIPCode,
          pickupCity: payload.pickupCity,
          pickupProvince: payload.pickupProvince,
          destinationCompanyName: payload.destinationCompanyName,
          destinationAddress: payload.destinationAddress,
          destinationZIPCode: payload.destinationZIPCode,
          destinationCity: payload.destinationCity,
          destinationProvince: payload.destinationProvince,
          destinationCountry: payload.destinationCountry,
          pudoId: payload.pudoId,
          parcelCount: payload.parcelCount,
          parcelLengthCM: payload.parcelLengthCM,
          parcelHeightCM: payload.parcelHeightCM,
          parcelDepthCM: payload.parcelDepthCM,
          volumeM3,
          volumetricWeightKG,
          weightKG: payload.weightKG,
          billingType: payload.billingType,
          billingCompanyName: payload.billingCompanyName,
          billingVatNumber: payload.billingVatNumber,
          billingTaxCode: payload.billingTaxCode,
          billingRecipientCode: payload.billingRecipientCode,
          billingCertifiedEmail: payload.billingCertifiedEmail,
          billingAddress: payload.billingAddress,
          billingZIPCode: payload.billingZIPCode,
          billingCity: payload.billingCity,
          billingProvince: payload.billingProvince,
        }),
      ],
    );

    const requestId = Number((requestResult as { insertId?: number })?.insertId || 0);
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
        expectedPrice.label,
        JSON.stringify(stripeSession),
      ],
    );
    const paymentId = Number((paymentResult as { insertId?: number })?.insertId || 0);
    const result = await createInpostShipment({
      ...payload,
    });

    const [shipmentResult] = await pool.execute(
      `INSERT INTO client_area_shipments
        (request_id, tracking_code, parcel_id, shipment_number_from, shipment_number_to, label_pdf_base64, brt_response_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId || null,
        result.trackingCode,
        result.parcelId,
        result.shipmentId,
        result.shipmentId,
        result.labelPdfBase64 || null,
        JSON.stringify({
          provider: "inpost",
          shipment: result.response,
          pointId: result.pointId,
        }),
      ],
    );
    const shipmentId = Number((shipmentResult as { insertId?: number })?.insertId || 0);

    await pool.execute(
      `UPDATE client_area_payments
       SET shipment_id = ?, stripe_response_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_session_id = ?`,
      [shipmentId || (paymentId || null), JSON.stringify(stripeSession), stripeSession.id],
    );

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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId || null,
        paymentId || null,
        shipmentId || null,
        invoiceProvider,
        stripeSession.invoiceId || "",
        invoiceStatus,
        stripeSession.invoicePdf || stripeSession.hostedInvoiceUrl || null,
        JSON.stringify({
          billingType: payload.billingType,
          billingCompanyName: payload.billingCompanyName,
          billingVatNumber: payload.billingVatNumber,
          billingTaxCode: payload.billingTaxCode,
          billingRecipientCode: payload.billingRecipientCode,
          billingCertifiedEmail: payload.billingCertifiedEmail,
          billingAddress: payload.billingAddress,
          billingZIPCode: payload.billingZIPCode,
          billingCity: payload.billingCity,
          billingProvince: payload.billingProvince,
          customerName: payload.customerName,
          email: payload.email,
        }),
        JSON.stringify({
          stripeSession,
          shipmentProvider: "inpost",
          providerReady: Boolean(invoiceProvider && invoiceProvider !== "pending"),
        }),
      ],
    );

    if (requestId) {
      await pool.execute(
        `UPDATE client_area_requests
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        ["submitted_to_inpost", requestId],
      );
    }

    void notifyClientAreaEvent({
      area: "spedizioni",
      title: "Spedizione InPost creata",
      customerName: payload.customerName,
      customerEmail: payload.email,
      customerPhone: payload.phone,
      details: {
        tracking: result.trackingCode,
        parcelId: result.parcelId,
        corriere: "InPost",
        importo: `${(stripeSession.amountTotal / 100).toFixed(2)} ${String(stripeSession.currency || "eur").toUpperCase()}`,
      },
    });

    return NextResponse.json(
      {
        provider: "inpost",
        message: "Spedizione InPost creata correttamente.",
        trackingCode: result.trackingCode,
        parcelId: result.parcelId,
        shipmentNumberFrom: result.shipmentId,
        shipmentNumberTo: result.shipmentId,
        labelPdfBase64: result.labelPdfBase64,
        volumetricWeightKG,
        volumeM3,
        payment: {
          amountCents: stripeSession.amountTotal,
          currency: stripeSession.currency,
          sessionId: stripeSession.id,
          priceLabel: expectedPrice.label,
          invoicePdf: stripeSession.invoicePdf,
          hostedInvoiceUrl: stripeSession.hostedInvoiceUrl,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante la creazione della spedizione InPost.";
    const isShippingLimitExceeded =
      message.includes("non consente spedizioni con peso/volume") ||
      message.includes("non consente spedizioni con peso superiore");
    return NextResponse.json(
      {
        message,
        errorCode: isShippingLimitExceeded ? "SHIPPING_LIMIT_EXCEEDED" : undefined,
      },
      { status: isShippingLimitExceeded ? 409 : 502 },
    );
  }
}
