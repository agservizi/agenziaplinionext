import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;
  await ensureSaleorBridgeTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, client_user_id, saleor_order_id, asset_key, download_count, max_downloads, expires_at, revoked_at
     FROM shop_digital_entitlements ORDER BY id DESC LIMIT 200`,
  );
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as {
    action?: "revoke" | "reissue" | "create";
    id?: number;
    clientUserId?: number;
    saleorOrderId?: string;
    assetKey?: string;
    maxDownloads?: number;
  };

  await ensureSaleorBridgeTables();
  const pool = getPool();

  if (body.action === "revoke" && body.id) {
    await pool.execute(
      `UPDATE shop_digital_entitlements SET revoked_at = NOW() WHERE id = ?`,
      [body.id],
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reissue" && body.id) {
    await pool.execute(
      `UPDATE shop_digital_entitlements
       SET revoked_at = NULL, download_count = 0, expires_at = DATE_ADD(NOW(), INTERVAL 365 DAY)
       WHERE id = ?`,
      [body.id],
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "create") {
    if (!body.clientUserId || !body.saleorOrderId || !body.assetKey) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }
    await pool.execute(
      `INSERT INTO shop_digital_entitlements
        (client_user_id, saleor_order_id, asset_key, max_downloads, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 365 DAY))`,
      [body.clientUserId, body.saleorOrderId, body.assetKey, body.maxDownloads ?? 5],
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
