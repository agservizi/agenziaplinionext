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

export async function POST() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ shipments: [], message: "Database non configurato." }, { status: 200 });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaShipmentsTable();
    await ensureClientAreaPaymentsTable();
    await ensureClientAreaInvoicesTable();

    const pool = getPool();
    const [rows] = await pool.query(
       `SELECT
         s.id,
         s.request_id,
         s.tracking_code,
         s.parcel_id,
         s.shipment_number_from,
         s.shipment_number_to,
         s.brt_response_json,
         s.created_at,
         r.customer_name,
         r.email,
         r.service_type,
         r.status,
         r.details_json,
         p.amount_cents,
         p.currency,
         p.payment_status,
         p.checkout_status,
         p.price_label,
         i.status AS invoice_status,
         i.invoice_pdf_url
       FROM client_area_shipments s
       LEFT JOIN client_area_requests r ON r.id = s.request_id
       LEFT JOIN client_area_payments p ON p.shipment_id = s.id OR p.request_id = s.request_id
       LEFT JOIN client_area_invoices i ON i.shipment_id = s.id OR i.request_id = s.request_id
       ORDER BY s.created_at DESC
       LIMIT 20`,
    );

    const shipments = Array.isArray(rows)
      ? rows.map((row: any) => {
          let details: Record<string, unknown> = {};
          let brtResponse: Record<string, unknown> = {};

          try {
            if (typeof row.details_json === "string") {
              details = JSON.parse(row.details_json);
            } else if (row.details_json && typeof row.details_json === "object") {
              details = row.details_json;
            }
          } catch {
            details = {};
          }

          try {
            if (typeof row.brt_response_json === "string") {
              brtResponse = JSON.parse(row.brt_response_json);
            } else if (row.brt_response_json && typeof row.brt_response_json === "object") {
              brtResponse = row.brt_response_json;
            }
          } catch {
            brtResponse = {};
          }

          const manifest =
            brtResponse.manifest && typeof brtResponse.manifest === "object"
              ? (brtResponse.manifest as Record<string, unknown>)
              : {};

          return {
            id: Number(row.id || 0),
            requestId: Number(row.request_id || 0),
            trackingCode: String(row.tracking_code || ""),
            parcelId: String(row.parcel_id || ""),
            shipmentNumberFrom: String(row.shipment_number_from || ""),
            shipmentNumberTo: String(row.shipment_number_to || ""),
            createdAt: row.created_at,
            customerName: String(row.customer_name || ""),
            email: String(row.email || ""),
            serviceType: String(row.service_type || ""),
            status: String(row.status || ""),
            destinationCompanyName: String(details.destinationCompanyName || ""),
            destinationCity: String(details.destinationCity || ""),
            destinationCountry: String(details.destinationCountry || ""),
            parcelCount: Number(details.parcelCount || 0),
            actualWeightKG: Number(details.weightKG || 0),
            volumetricWeightKG: Number(details.volumetricWeightKG || 0),
            volumeM3: Number(details.volumeM3 || 0),
            paymentAmountCents: Number(row.amount_cents || 0),
            paymentCurrency: String(row.currency || "eur"),
            paymentStatus: String(row.payment_status || ""),
            checkoutStatus: String(row.checkout_status || ""),
            priceLabel: String(row.price_label || ""),
            invoiceStatus: String(row.invoice_status || ""),
            invoicePdfUrl: String(row.invoice_pdf_url || ""),
            manifestCreated: Boolean(manifest.created),
            manifestMessage: String(manifest.message || ""),
          };
        })
      : [];

    return NextResponse.json({ shipments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        shipments: [],
        message:
          error instanceof Error
            ? error.message
            : "Caricamento storico spedizioni non riuscito.",
      },
      { status: 500 },
    );
  }
}
