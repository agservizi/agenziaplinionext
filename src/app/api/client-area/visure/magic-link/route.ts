import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const VISURE_MAGIC_LINK_SECRET = String(
  process.env.VISURE_MAGIC_LINK_SECRET ||
    process.env.CAF_PATRONATO_MAGIC_LINK_SECRET ||
    process.env.ADMIN_PORTAL_SESSION_SECRET ||
    process.env.CLIENT_PORTAL_SESSION_SECRET ||
    "ag-visure-magic-link",
).trim();

type MagicRequestRow = {
  requestId: number;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  notes: string;
  createdAt: string | Date | null;
  requestStatus: string;
  providerService: string;
  providerStatus: string;
  documentUrl: string;
  amountCents: number;
  currency: string;
  priceLabel: string;
  details: Record<string, unknown>;
};

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

function hashToken(token: string) {
  return crypto.createHash("sha256").update(`${VISURE_MAGIC_LINK_SECRET}:${token}`).digest("hex");
}

function decodeDetails(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function resolveSiteUrl() {
  return (
    String(process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "") ||
    "https://agenziaplinio.it"
  );
}

function mapOperatorStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "completed") {
    return {
      requestStatus: "completed",
      providerStatus: "completed",
      label: "Evasa",
    };
  }
  if (normalized === "waiting-documents") {
    return {
      requestStatus: "processing",
      providerStatus: "waiting-documents",
      label: "In attesa documenti",
    };
  }
  return {
    requestStatus: "processing",
    providerStatus: "processing",
    label: "In lavorazione",
  };
}

async function getMagicRequest(token: string) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT
       ml.id AS magic_link_id,
       ml.request_id,
       ml.expires_at,
       ml.consumed_at,
       r.customer_name,
       r.email,
       r.phone,
       r.service_type,
       r.notes,
       r.created_at,
       r.status,
       r.details_json,
       v.provider_service,
       v.provider_status,
       v.document_url,
       p.amount_cents,
       p.currency,
       p.price_label
     FROM client_area_visure_magic_links ml
     INNER JOIN client_area_requests r ON r.id = ml.request_id
     LEFT JOIN client_area_visure_requests v ON v.request_id = r.id
     LEFT JOIN client_area_payments p ON p.request_id = r.id
     WHERE ml.token_hash = ?
       AND r.area = 'visure'
     ORDER BY ml.id DESC
     LIMIT 1`,
    [hashToken(token)],
  );

  const row = Array.isArray(rows) ? (rows[0] as any) : null;
  if (!row) {
    throw new Error("Magic link non valido.");
  }
  if (row.consumed_at) {
    throw new Error("Questo magic link e gia stato usato.");
  }
  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    throw new Error("Questo magic link e scaduto.");
  }

  return {
    magicLinkId: Number(row.magic_link_id || 0),
    requestId: Number(row.request_id || 0),
    customerName: String(row.customer_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    serviceType: String(row.service_type || ""),
    notes: String(row.notes || ""),
    createdAt: row.created_at || null,
    requestStatus: String(row.status || "processing"),
    providerService: String(row.provider_service || ""),
    providerStatus: String(row.provider_status || "processing"),
    documentUrl: String(row.document_url || ""),
    amountCents: Number(row.amount_cents || 0),
    currency: String(row.currency || "eur"),
    priceLabel: String(row.price_label || ""),
    details: decodeDetails(row.details_json),
  } satisfies MagicRequestRow & { magicLinkId: number };
}

async function storeUploadedFiles(requestId: number, files: File[]) {
  const validFiles = files.filter((file) => file.size > 0);
  if (!validFiles.length) {
    return [] as string[];
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "visure");
  await fs.mkdir(uploadDir, { recursive: true });
  const siteUrl = resolveSiteUrl();
  const storedUrls: string[] = [];

  for (const [index, file] of validFiles.entries()) {
    const extension = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || "documento";
    const storedName = `${requestId}-${Date.now()}-${index + 1}-${baseName}${extension}`;
    const absolutePath = path.join(uploadDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);
    storedUrls.push(`${siteUrl}/uploads/visure/${storedName}`);
  }

  return storedUrls;
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato." }, { status: 503 });
  }

  await ensureClientAreaRequestsTable();
  await ensureClientAreaVisureRequestsTable();
  await ensureClientAreaVisureMagicLinksTable();

  const contentType = String(request.headers.get("content-type") || "");

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const token = String(body?.token || "").trim();
      if (!token) {
        return NextResponse.json({ message: "Token pratica mancante." }, { status: 400 });
      }

      const requestData = await getMagicRequest(token);
      return NextResponse.json(
        {
          request: {
            requestId: requestData.requestId,
            customerName: requestData.customerName,
            email: requestData.email,
            phone: requestData.phone,
            serviceLabel: requestData.providerService || requestData.serviceType,
            status: requestData.providerStatus || requestData.requestStatus,
            notes: requestData.notes,
            createdAt: requestData.createdAt,
            amountLabel: requestData.amountCents
              ? `${(requestData.amountCents / 100).toFixed(2).replace(".", ",")} ${requestData.currency.toUpperCase()}`
              : "",
            priceLabel: requestData.priceLabel,
            existingDocumentUrl: requestData.documentUrl,
          },
        },
        { status: 200 },
      );
    }

    const formData = await request.formData();
    const token = String(formData.get("token") || "").trim();
    const status = String(formData.get("status") || "completed").trim();
    const operatorNotes = String(formData.get("operatorNotes") || "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!token) {
      return NextResponse.json({ message: "Token pratica mancante." }, { status: 400 });
    }

    const requestData = await getMagicRequest(token);
    const nextStatus = mapOperatorStatus(status);
    const storedUrls = await storeUploadedFiles(requestData.requestId, files);
    const primaryDocumentUrl = storedUrls[0] || requestData.documentUrl || "";

    if (nextStatus.providerStatus === "completed" && !primaryDocumentUrl) {
      return NextResponse.json(
        { message: "Per chiudere la pratica devi allegare almeno un documento." },
        { status: 400 },
      );
    }

    const summary = {
      presaInCarico: "manuale backoffice",
      statoLavorazione: nextStatus.label,
      disponibilitaDocumento: primaryDocumentUrl ? "disponibile nello storico" : "in caricamento",
      ultimoAggiornamento: new Date().toISOString(),
    };

    const details = {
      ...requestData.details,
      providerStatus: nextStatus.providerStatus,
      providerSummary: summary,
      manualFulfillment: true,
      operatorNotes,
      operatorUpdatedAt: new Date().toISOString(),
    };

    const providerPayload = {
      mode: "manual_fulfillment",
      operatorNotes,
      storedDocuments: storedUrls,
      primaryDocumentUrl,
      completedAt: nextStatus.providerStatus === "completed" ? new Date().toISOString() : null,
    };

    const pool = getPool();
    await pool.execute(
      `UPDATE client_area_requests
         SET status = ?, details_json = ?
       WHERE id = ? AND area = 'visure'`,
      [nextStatus.requestStatus, JSON.stringify(details), requestData.requestId],
    );

    await pool.execute(
      `UPDATE client_area_visure_requests
         SET provider = 'AG SERVIZI Backoffice',
             provider_status = ?,
             document_url = ?,
             provider_response_json = ?,
             updated_at = CURRENT_TIMESTAMP
       WHERE request_id = ?`,
      [
        nextStatus.providerStatus,
        primaryDocumentUrl || null,
        JSON.stringify(providerPayload),
        requestData.requestId,
      ],
    );

    if (nextStatus.providerStatus === "completed") {
      await pool.execute(
        `UPDATE client_area_visure_magic_links
           SET consumed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [requestData.magicLinkId],
      );
    }

    return NextResponse.json(
      {
        message:
          nextStatus.providerStatus === "completed"
            ? "Pratica evasa correttamente: il documento e ora disponibile nello storico visure del cliente."
            : "Pratica aggiornata correttamente.",
        documentUrl: primaryDocumentUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile gestire la pratica dal magic link.",
      },
      { status: 400 },
    );
  }
}
