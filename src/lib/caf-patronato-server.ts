import crypto from "crypto";
import path from "path";
import { mkdir, writeFile, stat, readFile, rename } from "fs/promises";
import { Resend } from "resend";
import { getPool } from "@/lib/db";
import {
  getCafPatronatoService,
  getCafPatronatoScopeLabel,
  type CafPatronatoScope,
} from "@/lib/caf-patronato-catalog";
import {
  deleteDatabaseCafPatronatoPricingRule,
  ensureCafPatronatoPricingRulesTable,
  listDatabaseCafPatronatoPricingRules,
  resolveDatabaseCafPatronatoPrice,
  upsertDatabaseCafPatronatoPricingRule,
  type CafPatronatoPricingRule,
} from "@/lib/caf-patronato-pricing-engine";
import { SITE_URL } from "@/lib/seo";
import { getStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";

const OPERATOR_EMAIL = String(
  process.env.CAF_PATRONATO_OPERATOR_EMAIL || "vincenzo@studioschettino.com",
).trim();
const MAGIC_LINK_SECRET = String(
  process.env.CAF_PATRONATO_MAGIC_LINK_SECRET ||
    process.env.ADMIN_PORTAL_SESSION_SECRET ||
    process.env.CLIENT_PORTAL_SESSION_SECRET ||
    "ag-caf-patronato-magic-link",
).trim();
const MAGIC_LINK_TTL_HOURS = Number(process.env.CAF_PATRONATO_MAGIC_LINK_TTL_HOURS || 240);
const MAGIC_LINK_TTL_DAYS = Math.max(1, Math.round(MAGIC_LINK_TTL_HOURS / 24));
const FILE_LINK_SECRET = String(
  process.env.CAF_PATRONATO_FILE_LINK_SECRET ||
    process.env.CAF_PATRONATO_MAGIC_LINK_SECRET ||
    process.env.ADMIN_PORTAL_SESSION_SECRET ||
    "ag-caf-patronato-file-link",
).trim();
const FILE_LINK_TTL_HOURS = Number(process.env.CAF_PATRONATO_FILE_LINK_TTL_HOURS || 48);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type CafPatronatoRequestInput = {
  customerName: string;
  email: string;
  phone: string;
  scope: CafPatronatoScope;
  serviceType: string;
  urgency: string;
  preferredContactMethod: string;
  preferredContactDate: string;
  documentSummary: string;
  notes: string;
  files: File[];
};

type PendingStoredFile = {
  originalName: string;
  storedName: string;
  absolutePath: string;
  mimeType: string;
  sizeBytes: number;
};

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export function isCafPatronatoDatabaseConfigured() {
  return hasDatabaseConfig();
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

async function ensureCafPatronatoRequestsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_caf_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      service_scope VARCHAR(40) NOT NULL,
      service_label VARCHAR(191) NOT NULL,
      category_label VARCHAR(191) NOT NULL,
      preferred_contact_method VARCHAR(80) NOT NULL DEFAULT '',
      preferred_contact_date DATE NULL,
      urgency VARCHAR(191) NOT NULL DEFAULT '',
      document_summary TEXT NULL,
      intake_status VARCHAR(40) NOT NULL DEFAULT 'awaiting_review',
      operator_email VARCHAR(191) NOT NULL DEFAULT '',
      operator_email_status VARCHAR(40) NOT NULL DEFAULT 'pending',
      operator_email_sent_at DATETIME NULL,
      magic_link_expires_at DATETIME NULL,
      operator_notes TEXT NULL,
      resolved_at DATETIME NULL,
      intake_payload_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_area_caf_request (request_id),
      KEY idx_client_area_caf_status (intake_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureCafPatronatoFilesTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_caf_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      source_role VARCHAR(32) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      public_url TEXT NOT NULL,
      mime_type VARCHAR(191) NOT NULL DEFAULT '',
      size_bytes BIGINT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_caf_files_request (request_id),
      KEY idx_client_area_caf_files_role (source_role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureCafPatronatoMagicLinksTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_caf_magic_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_caf_magic_request (request_id),
      UNIQUE KEY uq_client_area_caf_magic_token (token_hash)
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

async function ensureCafPatronatoCheckoutDraftsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_caf_checkout_drafts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      draft_token VARCHAR(64) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      amount_cents INT NOT NULL DEFAULT 0,
      price_label VARCHAR(191) NOT NULL DEFAULT '',
      draft_json JSON NOT NULL,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_area_caf_checkout_draft_token (draft_token),
      KEY idx_client_area_caf_checkout_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function ensureCafPatronatoTables() {
  if (!hasDatabaseConfig()) {
    throw new Error("Database non configurato");
  }

  await ensureClientAreaRequestsTable();
  await ensureCafPatronatoRequestsTable();
  await ensureCafPatronatoFilesTable();
  await ensureCafPatronatoMagicLinksTable();
  await ensureClientAreaPaymentsTable();
  await ensureClientAreaInvoicesTable();
  await ensureCafPatronatoCheckoutDraftsTable();
  await ensureCafPatronatoPricingRulesTable();
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function persistFile(file: File, requestId: number, sourceRole: "customer" | "operator") {
  if (!file || file.size <= 0) return null;

  const extension = path.extname(file.name || "").slice(0, 16);
  const storedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const relativeDir = path.join("storage", "caf-patronato", sourceRole);
  const absoluteDir = path.join(process.cwd(), relativeDir);
  const absolutePath = path.join(absoluteDir, storedName);

  await mkdir(absoluteDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_area_caf_files
      (request_id, source_role, original_name, stored_name, public_url, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      requestId,
      sourceRole,
      sanitizeFilename(file.name || "documento"),
      storedName,
      "",
      String(file.type || "application/octet-stream"),
      Number(file.size || 0),
    ],
  );

  return {
    requestId,
    sourceRole,
    originalName: sanitizeFilename(file.name || "documento"),
    storedName,
    mimeType: String(file.type || "application/octet-stream"),
    sizeBytes: Number(file.size || 0),
  };
}

async function persistExistingStoredFile({
  requestId,
  sourceRole,
  originalName,
  storedName,
  mimeType,
  sizeBytes,
}: {
  requestId: number;
  sourceRole: "customer" | "operator";
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_area_caf_files
      (request_id, source_role, original_name, stored_name, public_url, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      requestId,
      sourceRole,
      sanitizeFilename(originalName || "documento"),
      storedName,
      "",
      mimeType || "application/octet-stream",
      Number(sizeBytes || 0),
    ],
  );
}

async function persistPendingCheckoutFiles(files: File[], draftToken: string) {
  const savedFiles: PendingStoredFile[] = [];
  const safeToken = draftToken.replace(/[^a-zA-Z0-9_-]/g, "");
  const absoluteDir = path.join(process.cwd(), "storage", "caf-patronato", "pending", safeToken);
  await mkdir(absoluteDir, { recursive: true });

  for (const file of normalizeFiles(files)) {
    const extension = path.extname(file.name || "").slice(0, 16);
    const storedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    const absolutePath = path.join(absoluteDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, buffer);

    savedFiles.push({
      originalName: sanitizeFilename(file.name || "documento"),
      storedName,
      absolutePath,
      mimeType: String(file.type || "application/octet-stream"),
      sizeBytes: Number(file.size || 0),
    });
  }

  return savedFiles;
}

function hashMagicToken(token: string) {
  return crypto.createHash("sha256").update(`${MAGIC_LINK_SECRET}:${token}`).digest("hex");
}

function buildMagicLink(token: string) {
  return new URL(`/evadi-pratica/caf-patronato?token=${token}`, SITE_URL).toString();
}

function resolveDownloadBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : SITE_URL);
  return String(base || SITE_URL).replace(/\/$/, "");
}

function createSignedFileToken(fileId: number) {
  const payload = Buffer.from(
    JSON.stringify({
      fileId,
      exp: Date.now() + FILE_LINK_TTL_HOURS * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", FILE_LINK_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifySignedFileToken(token: string) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", FILE_LINK_SECRET)
    .update(payload)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.exp || Number(parsed.exp) < Date.now()) return null;
    const fileId = Number(parsed.fileId || 0);
    if (!fileId) return null;
    return { fileId };
  } catch {
    return null;
  }
}

function buildSignedDownloadUrl(fileId: number) {
  const token = createSignedFileToken(fileId);
  return `${resolveDownloadBaseUrl()}/scarica-pratica/caf-patronato?token=${encodeURIComponent(token)}`;
}

async function createMagicLinkForRequest(requestId: number) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashMagicToken(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_HOURS * 60 * 60 * 1000);
  const pool = getPool();

  await pool.execute(
    "INSERT INTO client_area_caf_magic_links (request_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [requestId, tokenHash, expiresAt],
  );

  return {
    rawToken,
    expiresAt,
    link: buildMagicLink(rawToken),
  };
}

async function sendOperatorEmail({
  requestId,
  customerName,
  email,
  phone,
  scope,
  serviceLabel,
  categoryLabel,
  notes,
  magicLink,
  filesCount,
}: {
  requestId: number;
  customerName: string;
  email: string;
  phone: string;
  scope: CafPatronatoScope;
  serviceLabel: string;
  categoryLabel: string;
  notes: string;
  magicLink: string;
  filesCount: number;
}) {
  if (!resend || !process.env.RESEND_FROM) {
    return { sent: false, status: "not_configured" };
  }

  const scopeLabel = getCafPatronatoScopeLabel(scope);
  const subject = `Nuova pratica ${scopeLabel} - ${serviceLabel}`;
  const html = `
    <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:24px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">Nuova pratica CAF / Patronato</h1>
          <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">Richiesta #${requestId} pronta da prendere in carico</p>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748b;width:180px;">Cliente</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Telefono</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${phone || "Non indicato"}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Ambito</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${scopeLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Categoria</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${categoryLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Servizio</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${serviceLabel}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b;">Allegati cliente</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${filesCount}</td></tr>
          </table>
          ${
            notes
              ? `<div style="margin:18px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                  <p style="margin:0;color:#0f172a;font-size:14px;white-space:pre-line;">${notes}</p>
                </div>`
              : ""
          }
          <a href="${magicLink}" style="display:inline-block;margin-top:10px;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 18px;border-radius:999px;font-weight:700;">
            Apri la pratica e carica il documento evaso
          </a>
          <p style="margin:14px 0 0;color:#64748b;font-size:12px;">Il link porta direttamente alla presa in carico della pratica e resta valido per ${MAGIC_LINK_TTL_DAYS} giorni.</p>
        </div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: OPERATOR_EMAIL,
    replyTo: email,
    subject,
    text: [
      `Richiesta #${requestId}`,
      `Cliente: ${customerName}`,
      `Email: ${email}`,
      `Telefono: ${phone || "Non indicato"}`,
      `Ambito: ${scopeLabel}`,
      `Categoria: ${categoryLabel}`,
      `Servizio: ${serviceLabel}`,
      `Allegati cliente: ${filesCount}`,
      "",
      notes ? `Note cliente:\n${notes}` : "Nessuna nota cliente",
      "",
      `Apri la pratica: ${magicLink}`,
    ].join("\n"),
    html,
  });

  return { sent: true, status: "sent" };
}

async function sendCustomerResolvedEmail({
  requestId,
  customerName,
  email,
  scope,
  serviceLabel,
  paymentAmountCents,
  paymentCurrency,
  priceLabel,
  operatorNotes,
  resolvedFiles,
}: {
  requestId: number;
  customerName: string;
  email: string;
  scope: CafPatronatoScope;
  serviceLabel: string;
  paymentAmountCents: number;
  paymentCurrency: string;
  priceLabel: string;
  operatorNotes: string;
  resolvedFiles: Array<{
    originalName: string;
    downloadUrl: string;
  }>;
}) {
  if (!resend || !process.env.RESEND_FROM || !email) {
    return { sent: false, status: "not_configured" };
  }

  const scopeLabel = getCafPatronatoScopeLabel(scope);
  const formattedAmount =
    paymentAmountCents > 0
      ? `${(paymentAmountCents / 100).toFixed(2).replace(".", ",")} ${String(
          paymentCurrency || "EUR",
        ).toUpperCase()}`
      : "";
  const filesHtml = resolvedFiles.length
    ? resolvedFiles
        .map(
          (file) =>
            `<a href="${file.downloadUrl}" style="display:block;margin-top:8px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;color:#0f172a;text-decoration:none;font-weight:600;">${file.originalName}</a>`,
        )
        .join("")
    : `<p style="margin:12px 0 0;color:#334155;font-size:14px;">La pratica è stata aggiornata. Se il file finale non è allegato, troverai comunque l’esito nello storico del tuo portale.</p>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: `La tua pratica ${scopeLabel} è pronta`,
    html: `
      <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">La tua pratica è stata aggiornata</h1>
            <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">Pratica #${requestId} · ${serviceLabel}</p>
          </div>
          <div style="padding:24px;">
            <p style="margin:0;color:#0f172a;font-size:15px;">Ciao ${customerName}, il team ha lavorato la tua pratica ${scopeLabel}. Qui sotto trovi i link protetti per scaricare i documenti disponibili.</p>
            ${
              formattedAmount
                ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                    <p style="margin:0;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Importo pratica</p>
                    <p style="margin:8px 0 0;color:#0f172a;font-size:16px;font-weight:700;">${formattedAmount}</p>
                    <p style="margin:6px 0 0;color:#475569;font-size:13px;">${priceLabel || serviceLabel}</p>
                  </div>`
                : ""
            }
            ${operatorNotes ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;"><p style="margin:0;color:#0f172a;font-size:14px;white-space:pre-line;">${operatorNotes}</p></div>` : ""}
            <div style="margin-top:18px;">${filesHtml}</div>
            <p style="margin:18px 0 0;color:#64748b;font-size:12px;">I link sono protetti e hanno una scadenza temporale. Se ti servono di nuovo, li ritrovi anche nello storico pratiche dell’area clienti.</p>
          </div>
        </div>
      </div>
    `,
    text: [
      `Ciao ${customerName},`,
      `la tua pratica ${scopeLabel} è stata aggiornata.`,
      `Servizio: ${serviceLabel}`,
      formattedAmount ? `Importo pratica: ${formattedAmount}` : "",
      priceLabel ? `Tariffa: ${priceLabel}` : "",
      operatorNotes ? "" : "",
      operatorNotes ? `Nota del team:\n${operatorNotes}` : "",
      "",
      ...(resolvedFiles.length
        ? resolvedFiles.map((file) => `${file.originalName}: ${file.downloadUrl}`)
        : ["Controlla lo storico pratiche dell’area clienti per il riepilogo aggiornato."]),
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return { sent: true, status: "sent" };
}

function normalizeFiles(files: File[]) {
  return files.filter(
    (file): file is File => Boolean(file) && typeof file.arrayBuffer === "function" && file.size > 0,
  );
}

export async function createCafPatronatoRequest(input: CafPatronatoRequestInput) {
  const service = getCafPatronatoService(input.serviceType);
  if (!service || service.scope !== input.scope) {
    throw new Error("Servizio CAF o Patronato non valido.");
  }

  await ensureCafPatronatoTables();
  const pool = getPool();

  const details = {
    scope: input.scope,
    scopeLabel: getCafPatronatoScopeLabel(input.scope),
    serviceLabel: service.label,
    categoryLabel: service.categoryTitle,
    urgency: input.urgency,
    preferredContactMethod: input.preferredContactMethod,
    preferredContactDate: input.preferredContactDate,
    documentSummary: input.documentSummary,
    customerUploadCount: normalizeFiles(input.files).length,
  };

  const [requestResult] = await pool.execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES ('caf-patronato', ?, ?, ?, ?, ?, ?, 'new')`,
    [
      input.serviceType,
      input.customerName,
      input.email,
      input.phone,
      input.notes,
      JSON.stringify(details),
    ],
  );

  const requestId = Number((requestResult as { insertId?: number }).insertId || 0);
  if (!requestId) {
    throw new Error("Impossibile registrare la pratica.");
  }

  await pool.execute(
    `INSERT INTO client_area_caf_requests
      (request_id, service_scope, service_label, category_label, preferred_contact_method, preferred_contact_date,
       urgency, document_summary, intake_status, operator_email, intake_payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_review', ?, ?)`,
    [
      requestId,
      input.scope,
      service.label,
      service.categoryTitle,
      input.preferredContactMethod,
      input.preferredContactDate || null,
      input.urgency,
      input.documentSummary,
      OPERATOR_EMAIL,
      JSON.stringify({
        submittedAt: new Date().toISOString(),
        notes: input.notes,
        serviceDescription: service.description,
      }),
    ],
  );

  const customerFiles = [];
  for (const file of normalizeFiles(input.files)) {
    const saved = await persistFile(file, requestId, "customer");
    if (saved) customerFiles.push(saved);
  }

  const magicLinkData = await createMagicLinkForRequest(requestId);
  const emailResult = await sendOperatorEmail({
    requestId,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    scope: input.scope,
    serviceLabel: service.label,
    categoryLabel: service.categoryTitle,
    notes: input.notes,
    magicLink: magicLinkData.link,
    filesCount: customerFiles.length,
  }).catch(() => ({ sent: false, status: "send_failed" as const }));

  await pool.execute(
    `UPDATE client_area_caf_requests
     SET operator_email_status = ?,
         operator_email_sent_at = ?,
         magic_link_expires_at = ?
     WHERE request_id = ?`,
    [
      emailResult.status,
      emailResult.sent ? new Date() : null,
      magicLinkData.expiresAt,
      requestId,
    ],
  );

  return {
    requestId,
    serviceLabel: service.label,
    emailStatus: emailResult.status,
    customerFilesCount: customerFiles.length,
  };
}

export async function createCafPatronatoCheckoutDraft(input: CafPatronatoRequestInput) {
  const servicePrice = await resolveDatabaseCafPatronatoPrice(input.serviceType);
  if (!servicePrice || servicePrice.service.scope !== input.scope) {
    throw new Error("Servizio CAF o Patronato non valido.");
  }

  await ensureCafPatronatoTables();

  const draftToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 6);
  const pendingFiles = await persistPendingCheckoutFiles(input.files, draftToken);
  const pool = getPool();

  await pool.execute(
    `INSERT INTO client_area_caf_checkout_drafts
      (draft_token, service_type, customer_name, email, amount_cents, price_label, draft_json, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      draftToken,
      input.serviceType,
      input.customerName,
      input.email,
      servicePrice.amountCents,
      servicePrice.label,
      JSON.stringify({
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        scope: input.scope,
        serviceType: input.serviceType,
        urgency: input.urgency,
        preferredContactMethod: input.preferredContactMethod,
        preferredContactDate: input.preferredContactDate,
        documentSummary: input.documentSummary,
        notes: input.notes,
        pendingFiles,
      }),
      expiresAt,
    ],
  );

  return {
    draftToken,
    expiresAt,
    amountCents: servicePrice.amountCents,
    priceLabel: servicePrice.label,
    serviceLabel: servicePrice.service.label,
  };
}

export async function finalizeCafPatronatoCheckout({
  draftToken,
  stripeSessionId,
}: {
  draftToken: string;
  stripeSessionId: string;
}) {
  if (!isStripeConfigured()) {
    throw new Error("Stripe non configurato.");
  }

  await ensureCafPatronatoTables();
  const pool = getPool();
  const [draftRows] = await pool.query(
    `SELECT id, service_type, customer_name, email, amount_cents, price_label, draft_json, expires_at, consumed_at
     FROM client_area_caf_checkout_drafts
     WHERE draft_token = ?
     LIMIT 1`,
    [draftToken],
  );

  const draftRow = Array.isArray(draftRows) ? (draftRows as any[])[0] : null;
  if (!draftRow) {
    throw new Error("Dati pratica non trovati. Riprova dal modulo CAF/Patronato.");
  }
  if (draftRow.consumed_at) {
    throw new Error("Questa pratica è già stata finalizzata.");
  }
  if (!draftRow.expires_at || new Date(draftRow.expires_at).getTime() < Date.now()) {
    throw new Error("La sessione della pratica è scaduta. Riprova dal modulo.");
  }

  const stripeSession = await getStripeCheckoutSession(stripeSessionId);
  const paymentCompleted =
    stripeSession.status === "complete" && stripeSession.paymentStatus === "paid";
  if (!paymentCompleted) {
    throw new Error("Il pagamento Stripe non risulta completato.");
  }

  const expectedAmount = Number(draftRow.amount_cents || 0);
  if (
    stripeSession.currency.toLowerCase() !== "eur" ||
    stripeSession.amountTotal !== expectedAmount
  ) {
    throw new Error("Il pagamento non corrisponde all'importo atteso. La pratica è stata bloccata.");
  }

  const draft = (() => {
    try {
      return draftRow.draft_json ? JSON.parse(draftRow.draft_json) : {};
    } catch {
      return {};
    }
  })() as {
    customerName: string;
    email: string;
    phone: string;
    scope: CafPatronatoScope;
    serviceType: string;
    urgency: string;
    preferredContactMethod: string;
    preferredContactDate: string;
    documentSummary: string;
    notes: string;
    pendingFiles: PendingStoredFile[];
  };

  const service = getCafPatronatoService(String(draft.serviceType || draftRow.service_type || ""));
  if (!service) {
    throw new Error("Servizio pratica non riconosciuto.");
  }

  const details = {
    scope: draft.scope,
    scopeLabel: getCafPatronatoScopeLabel(draft.scope),
    serviceLabel: service.label,
    categoryLabel: service.categoryTitle,
    urgency: draft.urgency,
    preferredContactMethod: draft.preferredContactMethod,
    preferredContactDate: draft.preferredContactDate,
    documentSummary: draft.documentSummary,
    customerUploadCount: Array.isArray(draft.pendingFiles) ? draft.pendingFiles.length : 0,
    paymentRequired: true,
  };

  const [requestResult] = await pool.execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES ('caf-patronato', ?, ?, ?, ?, ?, ?, 'new')`,
    [
      draft.serviceType,
      draft.customerName,
      draft.email,
      draft.phone,
      draft.notes,
      JSON.stringify(details),
    ],
  );
  const requestId = Number((requestResult as { insertId?: number }).insertId || 0);
  if (!requestId) {
    throw new Error("Impossibile registrare la pratica.");
  }

  await pool.execute(
    `INSERT INTO client_area_caf_requests
      (request_id, service_scope, service_label, category_label, preferred_contact_method, preferred_contact_date,
       urgency, document_summary, intake_status, operator_email, intake_payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'awaiting_review', ?, ?)`,
    [
      requestId,
      draft.scope,
      service.label,
      service.categoryTitle,
      draft.preferredContactMethod,
      draft.preferredContactDate || null,
      draft.urgency,
      draft.documentSummary,
      OPERATOR_EMAIL,
      JSON.stringify({
        submittedAt: new Date().toISOString(),
        notes: draft.notes,
        serviceDescription: service.description,
        payment: {
          amountCents: expectedAmount,
          priceLabel: String(draftRow.price_label || ""),
          stripeSessionId: stripeSession.id,
        },
      }),
    ],
  );

  const customerFiles = [];
  for (const pendingFile of Array.isArray(draft.pendingFiles) ? draft.pendingFiles : []) {
    const destinationDir = path.join(process.cwd(), "storage", "caf-patronato", "customer");
    await mkdir(destinationDir, { recursive: true });
    const destinationPath = path.join(destinationDir, pendingFile.storedName);
    try {
      await rename(pendingFile.absolutePath, destinationPath);
    } catch {
      // ignore and let DB still point to stored file name if move failed
    }
    await persistExistingStoredFile({
      requestId,
      sourceRole: "customer",
      originalName: pendingFile.originalName,
      storedName: pendingFile.storedName,
      mimeType: pendingFile.mimeType,
      sizeBytes: pendingFile.sizeBytes,
    });
    customerFiles.push(pendingFile);
  }

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
      requestId,
      stripeSession.id,
      stripeSession.amountTotal,
      stripeSession.currency,
      stripeSession.paymentStatus,
      stripeSession.status,
      String(draftRow.price_label || ""),
      JSON.stringify(stripeSession),
    ],
  );
  const paymentId = Number((paymentResult as { insertId?: number }).insertId || 0);

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
      requestId,
      paymentId || null,
      invoiceProvider,
      stripeSession.invoiceId || "",
      invoiceStatus,
      stripeSession.invoicePdf || stripeSession.hostedInvoiceUrl || null,
      JSON.stringify({
        customerName: draft.customerName,
        email: draft.email,
        phone: draft.phone,
      }),
      JSON.stringify({
        stripeSession,
        cafPatronatoService: draft.serviceType,
      }),
    ],
  );

  const magicLinkData = await createMagicLinkForRequest(requestId);
  const emailResult = await sendOperatorEmail({
    requestId,
    customerName: draft.customerName,
    email: draft.email,
    phone: draft.phone,
    scope: draft.scope,
    serviceLabel: service.label,
    categoryLabel: service.categoryTitle,
    notes: draft.notes,
    magicLink: magicLinkData.link,
    filesCount: customerFiles.length,
  }).catch(() => ({ sent: false, status: "send_failed" as const }));

  await pool.execute(
    `UPDATE client_area_caf_requests
     SET operator_email_status = ?,
         operator_email_sent_at = ?,
         magic_link_expires_at = ?
     WHERE request_id = ?`,
    [
      emailResult.status,
      emailResult.sent ? new Date() : null,
      magicLinkData.expiresAt,
      requestId,
    ],
  );

  await pool.execute(
    `UPDATE client_area_caf_checkout_drafts
     SET consumed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [draftRow.id],
  );

  return {
    requestId,
    serviceLabel: service.label,
    payment: {
      amountCents: stripeSession.amountTotal,
      currency: stripeSession.currency,
      sessionId: stripeSession.id,
      priceLabel: String(draftRow.price_label || ""),
      invoicePdf: stripeSession.invoicePdf,
      hostedInvoiceUrl: stripeSession.hostedInvoiceUrl,
    },
  };
}

async function getFilesMap(requestIds: number[]) {
  if (!requestIds.length) return new Map<number, any[]>();
  const pool = getPool();
  const placeholders = requestIds.map(() => "?").join(", ");
  const [rows] = await pool.query(
    `SELECT
       id,
       request_id,
       source_role,
       original_name,
       stored_name,
       public_url,
       mime_type,
       size_bytes,
       created_at
     FROM client_area_caf_files
     WHERE request_id IN (${placeholders})
     ORDER BY created_at ASC`,
    requestIds,
  );

  const map = new Map<number, any[]>();
  for (const row of Array.isArray(rows) ? (rows as any[]) : []) {
    const requestId = Number(row.request_id || 0);
    if (!map.has(requestId)) {
      map.set(requestId, []);
    }
    map.get(requestId)?.push({
      fileId: Number(row.id || 0),
      sourceRole: String(row.source_role || ""),
      originalName: String(row.original_name || ""),
      storedName: String(row.stored_name || ""),
      publicUrl: String(row.public_url || ""),
      downloadUrl: buildSignedDownloadUrl(Number(row.id || 0)),
      mimeType: String(row.mime_type || ""),
      sizeBytes: Number(row.size_bytes || 0),
      createdAt: row.created_at,
    });
  }

  return map;
}

function mapRequestRow(row: any, filesMap: Map<number, any[]>) {
  const requestId = Number(row.request_id || row.id || 0);
  const files = filesMap.get(requestId) || [];

  return {
    requestId,
    customerName: String(row.customer_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    notes: String(row.notes || ""),
    serviceType: String(row.service_type || ""),
    serviceScope: String(row.service_scope || ""),
    serviceLabel: String(row.service_label || ""),
    categoryLabel: String(row.category_label || ""),
    preferredContactMethod: String(row.preferred_contact_method || ""),
    preferredContactDate: row.preferred_contact_date || null,
    urgency: String(row.urgency || ""),
    documentSummary: String(row.document_summary || ""),
    status: String(row.status || row.intake_status || ""),
    intakeStatus: String(row.intake_status || ""),
    operatorEmail: String(row.operator_email || ""),
    operatorEmailStatus: String(row.operator_email_status || ""),
    operatorEmailSentAt: row.operator_email_sent_at || null,
    magicLinkExpiresAt: row.magic_link_expires_at || null,
    operatorNotes: String(row.operator_notes || ""),
    resolvedAt: row.resolved_at || null,
    paymentAmountCents: Number(row.payment_amount_cents || 0),
    paymentCurrency: String(row.payment_currency || "eur"),
    priceLabel: String(row.price_label || ""),
    paymentStatus: String(row.payment_status || ""),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerFiles: files.filter((file) => file.sourceRole === "customer"),
    resolvedFiles: files.filter((file) => file.sourceRole === "operator"),
  };
}

export async function listCafPatronatoHistory() {
  await ensureCafPatronatoTables();
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT
       r.id AS request_id,
       r.customer_name,
       r.email,
       r.phone,
       r.notes,
       r.service_type,
       r.status,
       r.created_at,
       r.updated_at,
       c.service_scope,
       c.service_label,
       c.category_label,
       c.preferred_contact_method,
       c.preferred_contact_date,
       c.urgency,
       c.document_summary,
       c.intake_status,
       c.operator_email,
       c.operator_email_status,
       c.operator_email_sent_at,
       c.magic_link_expires_at,
       c.operator_notes,
       c.resolved_at,
       (
         SELECT p.amount_cents
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_amount_cents,
       (
         SELECT p.currency
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_currency,
       (
         SELECT p.price_label
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS price_label,
       (
         SELECT p.payment_status
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_status
     FROM client_area_requests r
     INNER JOIN client_area_caf_requests c ON c.request_id = r.id
     WHERE r.area = 'caf-patronato'
     ORDER BY r.created_at DESC
     LIMIT 100`,
  );

  const requestIds = Array.isArray(rows) ? (rows as any[]).map((row) => Number(row.request_id || 0)) : [];
  const filesMap = await getFilesMap(requestIds);

  return Array.isArray(rows) ? (rows as any[]).map((row) => mapRequestRow(row, filesMap)) : [];
}

export async function listAdminCafPatronatoRequests() {
  return listCafPatronatoHistory();
}

export async function listAdminCafPatronatoPricingRules() {
  return listDatabaseCafPatronatoPricingRules();
}

export async function saveAdminCafPatronatoPricingRule(
  rule: Omit<CafPatronatoPricingRule, "id"> & { id?: number },
) {
  return upsertDatabaseCafPatronatoPricingRule(rule);
}

export async function removeAdminCafPatronatoPricingRule(id: number) {
  await deleteDatabaseCafPatronatoPricingRule(id);
}

export async function listPublicCafPatronatoPricingRules() {
  const rules = await listDatabaseCafPatronatoPricingRules();
  return rules.filter((rule) => rule.active);
}

async function findMagicLinkRecord(token: string) {
  if (!token) return null;
  await ensureCafPatronatoTables();

  const pool = getPool();
  const tokenHash = hashMagicToken(token);
  const [rows] = await pool.query(
    `SELECT
       m.request_id,
       m.expires_at,
       m.consumed_at
     FROM client_area_caf_magic_links m
     WHERE m.token_hash = ?
     ORDER BY m.id DESC
     LIMIT 1`,
    [tokenHash],
  );

  const row = Array.isArray(rows) ? (rows as any[])[0] : null;
  if (!row) return null;

  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    return { status: "expired", requestId: Number(row.request_id || 0) };
  }
  if (row.consumed_at) {
    return { status: "consumed", requestId: Number(row.request_id || 0) };
  }

  return {
    status: "valid",
    requestId: Number(row.request_id || 0),
  };
}

export async function getCafPatronatoMagicLinkRequest(token: string) {
  const link = await findMagicLinkRecord(token);
  if (!link) {
    throw new Error("Link pratica non valido.");
  }
  if (link.status === "expired") {
    throw new Error("Il link pratica è scaduto.");
  }
  if (link.status === "consumed") {
    throw new Error("Questa pratica è già stata evasa con questo link.");
  }

  const items = await listCafPatronatoHistory();
  const request = items.find((item) => item.requestId === link.requestId);
  if (!request) {
    throw new Error("Pratica non trovata.");
  }

  return request;
}

export async function completeCafPatronatoMagicLink({
  token,
  operatorNotes,
  status,
  files,
}: {
  token: string;
  operatorNotes: string;
  status: string;
  files: File[];
}) {
  const link = await findMagicLinkRecord(token);
  if (!link) {
    throw new Error("Link pratica non valido.");
  }
  if (link.status === "expired") {
    throw new Error("Il link pratica è scaduto.");
  }
  if (link.status === "consumed") {
    throw new Error("Il link pratica è già stato usato.");
  }

  await ensureCafPatronatoTables();
  const pool = getPool();

  const normalizedStatus =
    status === "completed" || status === "processing" || status === "waiting-documents"
      ? status
      : "completed";

  const resolvedFiles = [];
  for (const file of normalizeFiles(files)) {
    const saved = await persistFile(file, link.requestId, "operator");
    if (saved) resolvedFiles.push(saved);
  }

  const [requestRows] = await pool.query(
    `SELECT
       r.customer_name,
       r.email,
       c.service_scope,
       c.service_label
     FROM client_area_requests r
     INNER JOIN client_area_caf_requests c ON c.request_id = r.id
     WHERE r.id = ?
     LIMIT 1`,
    [link.requestId],
  );
  const requestRow = Array.isArray(requestRows) ? (requestRows as any[])[0] : null;

  await pool.execute(
    `UPDATE client_area_requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [normalizedStatus, link.requestId],
  );

  await pool.execute(
    `UPDATE client_area_caf_requests
     SET intake_status = ?,
         operator_notes = ?,
         resolved_at = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?`,
    [
      normalizedStatus,
      operatorNotes,
      normalizedStatus === "completed" ? new Date() : null,
      link.requestId,
    ],
  );

  await pool.execute(
    `UPDATE client_area_caf_magic_links
     SET consumed_at = CURRENT_TIMESTAMP
     WHERE token_hash = ?`,
    [hashMagicToken(token)],
  );

  if (requestRow && normalizedStatus === "completed") {
    const filesMap = await getFilesMap([link.requestId]);
    const allFiles = filesMap.get(link.requestId) || [];
    const downloadFiles = allFiles
      .filter((file) => file.sourceRole === "operator")
      .map((file) => ({
        originalName: String(file.originalName || "documento"),
        downloadUrl: String(file.downloadUrl || ""),
      }))
      .filter((file) => file.downloadUrl);

    const [paymentRows] = await pool.query(
      `SELECT amount_cents, currency, price_label
       FROM client_area_payments
       WHERE request_id = ?
       ORDER BY updated_at DESC, id DESC
       LIMIT 1`,
      [link.requestId],
    );
    const paymentRow = Array.isArray(paymentRows) ? (paymentRows as any[])[0] : null;

    await sendCustomerResolvedEmail({
      requestId: link.requestId,
      customerName: String(requestRow.customer_name || ""),
      email: String(requestRow.email || ""),
      scope: String(requestRow.service_scope || "caf") === "patronato" ? "patronato" : "caf",
      serviceLabel: String(requestRow.service_label || ""),
      paymentAmountCents: Number(paymentRow?.amount_cents || 0),
      paymentCurrency: String(paymentRow?.currency || "eur"),
      priceLabel: String(paymentRow?.price_label || ""),
      operatorNotes,
      resolvedFiles: downloadFiles,
    }).catch(() => null);
  }

  return {
    requestId: link.requestId,
    status: normalizedStatus,
    resolvedFilesCount: resolvedFiles.length,
  };
}

export async function updateAdminCafPatronatoStatus({
  requestId,
  status,
  operatorNotes,
}: {
  requestId: number;
  status: string;
  operatorNotes: string;
}) {
  await ensureCafPatronatoTables();
  const normalizedStatus =
    status === "completed" || status === "processing" || status === "waiting-documents"
      ? status
      : "awaiting_review";
  const pool = getPool();

  await pool.execute(
    `UPDATE client_area_requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND area = 'caf-patronato'`,
    [normalizedStatus, requestId],
  );

  await pool.execute(
    `UPDATE client_area_caf_requests
     SET intake_status = ?,
         operator_notes = ?,
         resolved_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
         updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?`,
    [normalizedStatus, operatorNotes, normalizedStatus, requestId],
  );
}

export async function resolveCafPatronatoFileDownload(token: string) {
  const verified = verifySignedFileToken(token);
  if (!verified) {
    throw new Error("Link file non valido o scaduto.");
  }

  await ensureCafPatronatoTables();
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT
       id,
       request_id,
       source_role,
       original_name,
       stored_name,
       public_url,
       mime_type
     FROM client_area_caf_files
     WHERE id = ?
     LIMIT 1`,
    [verified.fileId],
  );

  const row = Array.isArray(rows) ? (rows as any[])[0] : null;
  if (!row) {
    throw new Error("File non trovato.");
  }

  const sourceRole = String(row.source_role || "customer");
  const storedName = String(row.stored_name || "");
  const privatePath = path.join(process.cwd(), "storage", "caf-patronato", sourceRole, storedName);
  let absolutePath = privatePath;

  try {
    await stat(privatePath);
  } catch {
    const publicUrl = String(row.public_url || "");
    if (!publicUrl) {
      throw new Error("File non disponibile.");
    }
    const legacyRelative = publicUrl.replace(/^\/+/, "");
    absolutePath = path.join(process.cwd(), "public", legacyRelative);
    await stat(absolutePath);
  }

  const buffer = await readFile(absolutePath);
  return {
    buffer,
    mimeType: String(row.mime_type || "application/octet-stream"),
    originalName: String(row.original_name || "documento"),
  };
}
