import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

function dbOk() {
  return Boolean(process.env.MYSQL_HOST);
}

export async function listCustomerOrderMirrors(userId: number, limit = 50) {
  if (!dbOk() || !userId) return [];
  try {
    await ensureSaleorBridgeTables();
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT saleor_order_id, status, total_amount, currency, created_at, updated_at
       FROM saleor_order_mirrors
       WHERE client_user_id = ?
       ORDER BY id DESC LIMIT ?`,
      [userId, limit],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getCustomerOrderMirror(userId: number, orderId: string) {
  if (!dbOk() || !userId || !orderId) return null;
  try {
    await ensureSaleorBridgeTables();
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT *
       FROM saleor_order_mirrors
       WHERE client_user_id = ? AND saleor_order_id = ?
       LIMIT 1`,
      [userId, orderId],
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function listCustomerEntitlements(userId: number) {
  if (!dbOk() || !userId) return [];
  try {
    await ensureSaleorBridgeTables();
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT id, saleor_order_id, asset_key, download_count, max_downloads, expires_at, revoked_at
       FROM shop_digital_entitlements
       WHERE client_user_id = ? AND revoked_at IS NULL
       ORDER BY id DESC LIMIT 100`,
      [userId],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function listCustomerAddresses(userId: number) {
  if (!dbOk() || !userId) return [];
  try {
    await ensureSaleorBridgeTables();
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT id, kind, full_name, line1, line2, city, postal_code, province, country, phone, is_default
       FROM client_shipping_addresses
       WHERE client_user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [userId],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function listCustomerPayments(userId: number, email?: string | null) {
  if (!dbOk() || (!userId && !email)) return [];
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.amount_cents, p.currency, p.payment_status, p.checkout_status, p.price_label, p.created_at
       FROM client_area_payments p
       INNER JOIN client_area_requests r ON r.id = p.request_id
       WHERE (
         CAST(JSON_EXTRACT(r.details_json, '$.clientUserId') AS UNSIGNED) = ?
         OR LOWER(r.email) = LOWER(?)
         OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(r.details_json, '$.clientUsername'))) = LOWER(?)
       )
       ORDER BY p.id DESC LIMIT 100`,
      [userId || 0, email || "", email || ""],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function listCustomerInvoices(userId: number, email?: string | null) {
  if (!dbOk() || (!userId && !email)) return [];
  try {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT i.id, i.status, i.provider, i.invoice_pdf_url, i.created_at
       FROM client_area_invoices i
       INNER JOIN client_area_requests r ON r.id = i.request_id
       WHERE (
         CAST(JSON_EXTRACT(r.details_json, '$.clientUserId') AS UNSIGNED) = ?
         OR LOWER(r.email) = LOWER(?)
       )
       ORDER BY i.id DESC LIMIT 100`,
      [userId || 0, email || ""],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function listCustomerBookings(email: string) {
  if (!dbOk() || !email) return [];
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT id, service, start_at, end_at, status, created_at
       FROM booking_requests
       WHERE LOWER(email) = ?
       ORDER BY id DESC LIMIT 50`,
      [email.toLowerCase()],
    );
    return rows;
  } catch {
    return [];
  }
}

export async function getCustomerEmailByUserId(userId: number) {
  if (!dbOk() || !userId) return null;
  try {
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT email FROM client_portal_users WHERE id = ? LIMIT 1`,
      [userId],
    );
    return rows[0]?.email ? String(rows[0].email) : null;
  } catch {
    return null;
  }
}

export async function getNotificationPrefs(userId: number) {
  if (!dbOk() || !userId) {
    return {
      order_confirm: 1,
      shipped: 1,
      digital_ready: 1,
      service_update: 1,
      marketing: 0,
    };
  }
  try {
    await ensureSaleorBridgeTables();
    const [rows] = await getPool().query<RowDataPacket[]>(
      `SELECT * FROM client_notification_prefs WHERE client_user_id = ? LIMIT 1`,
      [userId],
    );
    if (rows[0]) return rows[0];
  } catch {
    /* defaults */
  }
  return {
    order_confirm: 1,
    shipped: 1,
    digital_ready: 1,
    service_update: 1,
    marketing: 0,
  };
}
