import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

function dbOk() {
  return Boolean(process.env.MYSQL_HOST);
}

async function ensureNotificationPrefsTable() {
  if (!dbOk()) return;
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS client_notification_prefs (
      client_user_id INT NOT NULL PRIMARY KEY,
      order_confirm TINYINT(1) NOT NULL DEFAULT 1,
      shipped TINYINT(1) NOT NULL DEFAULT 1,
      digital_ready TINYINT(1) NOT NULL DEFAULT 1,
      service_update TINYINT(1) NOT NULL DEFAULT 1,
      marketing TINYINT(1) NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function ensureAddressesTable() {
  if (!dbOk()) return;
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS client_shipping_addresses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      client_user_id INT NOT NULL,
      kind VARCHAR(32) NOT NULL DEFAULT 'shipping',
      full_name VARCHAR(191) NOT NULL DEFAULT '',
      line1 VARCHAR(255) NOT NULL DEFAULT '',
      line2 VARCHAR(255) NOT NULL DEFAULT '',
      city VARCHAR(120) NOT NULL DEFAULT '',
      postal_code VARCHAR(32) NOT NULL DEFAULT '',
      province VARCHAR(8) NOT NULL DEFAULT '',
      country VARCHAR(8) NOT NULL DEFAULT 'IT',
      phone VARCHAR(64) NOT NULL DEFAULT '',
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_addr_user (client_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function listCustomerAddresses(userId: number) {
  if (!dbOk() || !userId) return [];
  try {
    await ensureAddressesTable();
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
    await ensureNotificationPrefsTable();
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
