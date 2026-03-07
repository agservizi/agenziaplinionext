import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

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

export async function POST() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ visure: [], message: "Database non configurato." }, { status: 200 });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaVisureRequestsTable();
    await ensureClientAreaPaymentsTable();

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         r.id,
         r.customer_name,
         r.email,
         r.service_type,
         r.status,
         r.details_json,
         r.created_at,
         v.provider,
         v.provider_service,
         v.provider_request_id,
         v.provider_status,
         v.document_url,
         p.amount_cents,
         p.currency,
         p.price_label,
         p.payment_status
       FROM client_area_requests r
       LEFT JOIN client_area_visure_requests v ON v.request_id = r.id
       LEFT JOIN client_area_payments p ON p.request_id = r.id
       WHERE r.area = 'visure'
       ORDER BY r.created_at DESC
       LIMIT 20`,
    );

    const visure = Array.isArray(rows)
      ? rows.map((row: any) => {
          let details: Record<string, unknown> = {};
          try {
            if (typeof row.details_json === "string") {
              details = JSON.parse(row.details_json);
            } else if (row.details_json && typeof row.details_json === "object") {
              details = row.details_json;
            }
          } catch {
            details = {};
          }

          return {
            id: Number(row.id || 0),
            customerName: String(row.customer_name || ""),
            email: String(row.email || ""),
            serviceType: String(row.service_type || ""),
            status: String(row.status || ""),
            createdAt: row.created_at,
            provider: String(row.provider || ""),
            providerService: String(row.provider_service || ""),
            providerRequestId: String(row.provider_request_id || ""),
            providerStatus: String(row.provider_status || ""),
            documentUrl: String(row.document_url || ""),
            paymentAmountCents: Number(row.amount_cents || 0),
            paymentCurrency: String(row.currency || "eur"),
            priceLabel: String(row.price_label || ""),
            paymentStatus: String(row.payment_status || ""),
            summary:
              details.providerSummary && typeof details.providerSummary === "object"
                ? details.providerSummary
                : {},
          };
        })
      : [];

    return NextResponse.json({ visure }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        visure: [],
        message:
          error instanceof Error
            ? error.message
            : "Caricamento storico visure non riuscito.",
      },
      { status: 500 },
    );
  }
}
