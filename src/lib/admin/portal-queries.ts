import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

function dbConfigured() {
  return Boolean(process.env.MYSQL_HOST);
}

export async function listClientPortalUsers(limit = 100) {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    await ensureSaleorBridgeTables();
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.full_name, u.username, u.email, u.phone, u.status, u.created_at,
              l.saleor_customer_id
       FROM client_portal_users u
       LEFT JOIN saleor_customer_links l ON l.client_user_id = u.id
       ORDER BY u.id DESC
       LIMIT ?`,
      [limit],
    );
    return { ok: true as const, rows };
  } catch (error) {
    return {
      ok: false as const,
      rows: [],
      reason: "query-failed" as const,
      message: error instanceof Error ? error.message : "query failed",
    };
  }
}

export async function listRegistrationRequests(limit = 100) {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, full_name, email, phone, company_name, status, created_at, notes
       FROM client_portal_registration_requests
       ORDER BY id DESC
       LIMIT ?`,
      [limit],
    );
    return { ok: true as const, rows };
  } catch {
    return { ok: true as const, rows: [] };
  }
}

export async function listBookingRequests(limit = 100) {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, service, start_at, end_at, status, created_at
       FROM booking_requests
       ORDER BY id DESC
       LIMIT ?`,
      [limit],
    );
    return { ok: true as const, rows };
  } catch {
    return { ok: true as const, rows: [] };
  }
}

export async function listInvoices(limit = 100) {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, request_id, payment_id, shipment_id, provider, status, invoice_pdf_url, created_at
       FROM client_area_invoices
       ORDER BY id DESC
       LIMIT ?`,
      [limit],
    );
    return { ok: true as const, rows };
  } catch {
    return { ok: true as const, rows: [] };
  }
}

export async function listPayhipOrders(limit = 100) {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, email, product_name, amount, currency, status, created_at
       FROM payhip_orders
       ORDER BY id DESC
       LIMIT ?`,
      [limit],
    );
    return { ok: true as const, rows };
  } catch {
    return { ok: true as const, rows: [] };
  }
}

export async function listStaffUsers() {
  if (!dbConfigured()) return { ok: false as const, rows: [], reason: "db-missing" as const };
  try {
    await ensureSaleorBridgeTables();
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, username, email, role, status, created_at
       FROM staff_users
       ORDER BY id DESC
       LIMIT 200`,
    );
    return { ok: true as const, rows };
  } catch {
    return { ok: true as const, rows: [] };
  }
}
