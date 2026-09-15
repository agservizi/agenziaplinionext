import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export async function mirrorSaleorOrder(input: {
  saleorOrderId: string;
  email?: string | null;
  status?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  payload?: unknown;
}) {
  await ensureSaleorBridgeTables();
  const pool = getPool();

  let clientUserId: number | null = null;
  if (input.email) {
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM client_portal_users WHERE LOWER(email) = ? LIMIT 1`,
      [input.email.toLowerCase()],
    );
    if (users[0]?.id) {
      clientUserId = Number(users[0].id);
      await pool.execute(
        `INSERT INTO saleor_customer_links (client_user_id, saleor_customer_id, email)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE email = VALUES(email), updated_at = CURRENT_TIMESTAMP`,
        [clientUserId, `email:${input.email.toLowerCase()}`, input.email.toLowerCase()],
      ).catch(() => undefined);
    }
  }

  await pool.execute(
    `INSERT INTO saleor_order_mirrors
      (saleor_order_id, client_user_id, status, total_amount, currency, payload_json)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       client_user_id = COALESCE(VALUES(client_user_id), client_user_id),
       status = VALUES(status),
       total_amount = VALUES(total_amount),
       currency = VALUES(currency),
       payload_json = VALUES(payload_json),
       updated_at = CURRENT_TIMESTAMP`,
    [
      input.saleorOrderId,
      clientUserId,
      input.status || null,
      input.totalAmount ?? null,
      input.currency || "EUR",
      JSON.stringify(input.payload ?? {}),
    ],
  );

  return { clientUserId };
}

export async function issueDigitalEntitlement(input: {
  clientUserId: number;
  saleorOrderId: string;
  saleorLineId?: string | null;
  assetKey: string;
  maxDownloads?: number | null;
  expiresAt?: Date | null;
}) {
  await ensureSaleorBridgeTables();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO shop_digital_entitlements
      (client_user_id, saleor_order_id, saleor_line_id, asset_key, max_downloads, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.clientUserId,
      input.saleorOrderId,
      input.saleorLineId || null,
      input.assetKey,
      input.maxDownloads ?? 5,
      input.expiresAt || null,
    ],
  );
}

export async function createServiceRequestFromShop(input: {
  clientUserId: number;
  email: string;
  customerName: string;
  saleorOrderId: string;
  productName: string;
}) {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES ('shop-service', ?, ?, ?, '', ?, ?, 'received')`,
    [
      input.productName.slice(0, 120),
      input.customerName,
      input.email,
      `Ordine Saleor ${input.saleorOrderId}`,
      JSON.stringify({
        clientUserId: input.clientUserId,
        saleorOrderId: input.saleorOrderId,
        source: "saleor-service",
      }),
    ],
  );
}
