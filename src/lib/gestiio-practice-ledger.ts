import { getPool } from "@/lib/db";

export async function ensureGestiioPracticeLedger() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      area VARCHAR(40) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      notes TEXT,
      details_json JSON NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      gestiio_external_id CHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_requests_area (area),
      KEY idx_client_area_requests_status (status),
      KEY idx_client_area_requests_gestiio (gestiio_external_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try {
    await pool.execute(
      `ALTER TABLE client_area_requests ADD COLUMN gestiio_external_id CHAR(36) NULL`,
    );
  } catch {
    // column may already exist
  }
}

export async function insertGestiioPracticeLedger(input: {
  area: string;
  serviceType: string;
  customerName: string;
  email: string;
  phone?: string;
  notes?: string;
  details?: Record<string, unknown>;
  status?: string;
  gestiioUuid: string;
}) {
  await ensureGestiioPracticeLedger();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status, gestiio_external_id)
     VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?, ?)`,
    [
      input.area,
      input.serviceType,
      input.customerName,
      input.email,
      input.phone || "",
      input.notes || "",
      JSON.stringify(input.details || {}),
      input.status || "bozza",
      input.gestiioUuid,
    ],
  );
}

export async function updateGestiioPracticeLedgerStatus(
  gestiioUuid: string,
  status: string,
  paymentStatus?: string,
) {
  await ensureGestiioPracticeLedger();
  const pool = getPool();
  const details = paymentStatus
    ? JSON.stringify({ payment_status: paymentStatus })
    : null;
  if (details) {
    await pool.execute(
      `UPDATE client_area_requests
       SET status = ?, details_json = JSON_MERGE_PATCH(COALESCE(details_json, JSON_OBJECT()), CAST(? AS JSON)), updated_at = NOW()
       WHERE gestiio_external_id = ?`,
      [status, details, gestiioUuid],
    );
  } else {
    await pool.execute(
      `UPDATE client_area_requests SET status = ?, updated_at = NOW() WHERE gestiio_external_id = ?`,
      [status, gestiioUuid],
    );
  }
}
