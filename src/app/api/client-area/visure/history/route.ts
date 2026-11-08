/**
 * Callers: OpenApiVisureHistory (/area-clienti/visure/storico).
 * API: POST /api/client-area/visure/history { token? } → { visure[] }.
 * Schema: client_area_requests + client_area_visure_requests + client_area_payments.
 * User: "/area-clienti/visure/storico Unexpected token 'I', \"Internal S\"... is not valid JSON"
 */
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  requestOwnedByActor,
  resolveClientAreaActor,
} from "@/lib/client-area-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureTables() {
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_visure_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT '',
      provider_service VARCHAR(191) NOT NULL DEFAULT '',
      provider_request_id VARCHAR(191) NOT NULL DEFAULT '',
      provider_status VARCHAR(80) NOT NULL DEFAULT '',
      document_url TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_visure_requests_request (request_id),
      KEY idx_client_area_visure_requests_provider_status (provider_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

function parseDetails(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const auth = await resolveClientAreaActor(request, String(body?.token || ""));
  if ("error" in auth) {
    return NextResponse.json({ visure: [], message: auth.error }, { status: auth.status });
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ visure: [], message: "Database non configurato." });
  }

  try {
    await ensureTables();
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
       LIMIT 40`,
    );

    const visure = [];
    for (const row of Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []) {
      const details = parseDetails(row.details_json);
      const email = String(row.email || "");
      if (!requestOwnedByActor(details, email, auth.actor)) continue;

      const providerSummary =
        details.providerSummary &&
        typeof details.providerSummary === "object" &&
        !Array.isArray(details.providerSummary)
          ? (details.providerSummary as Record<string, unknown>)
          : {};

      visure.push({
        id: Number(row.id || 0),
        customerName: String(row.customer_name || ""),
        email,
        serviceType: String(row.service_type || ""),
        status: String(row.status || ""),
        createdAt: row.created_at || null,
        provider: String(row.provider || ""),
        providerService: String(row.provider_service || ""),
        providerRequestId: String(row.provider_request_id || ""),
        providerStatus: String(row.provider_status || ""),
        documentUrl: String(row.document_url || ""),
        paymentAmountCents: Number(row.amount_cents || 0),
        paymentCurrency: String(row.currency || "eur"),
        priceLabel: String(row.price_label || ""),
        paymentStatus: String(row.payment_status || ""),
        summary: providerSummary,
      });
    }

    return NextResponse.json({ visure });
  } catch (error) {
    return NextResponse.json(
      {
        visure: [],
        message:
          error instanceof Error ? error.message : "Caricamento storico visure non riuscito.",
      },
      { status: 500 },
    );
  }
}
