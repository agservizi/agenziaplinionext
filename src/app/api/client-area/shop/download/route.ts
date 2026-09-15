import { createHmac } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export const dynamic = "force-dynamic";

function signDownloadToken(entitlementId: number, userId: number, exp: number) {
  const secret = process.env.CLIENT_PORTAL_SESSION_SECRET || process.env.SESSION_SECRET || "";
  const payload = `${entitlementId}.${userId}.${exp}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, "customer");
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  await ensureSaleorBridgeTables();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM shop_digital_entitlements
     WHERE id = ? AND client_user_id = ? AND revoked_at IS NULL
     LIMIT 1`,
    [id, session.userId],
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (row.expires_at && new Date(row.expires_at as string).getTime() < Date.now()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  if (row.max_downloads != null && Number(row.download_count) >= Number(row.max_downloads)) {
    return NextResponse.json({ error: "Limit reached" }, { status: 429 });
  }

  await pool.execute(
    `UPDATE shop_digital_entitlements SET download_count = download_count + 1 WHERE id = ? AND client_user_id = ?`,
    [id, session.userId],
  );

  const exp = Date.now() + 5 * 60 * 1000;
  const sig = signDownloadToken(id, session.userId, exp);

  // Fail closed: signed token for private asset fetch — no public permanent URL.
  return NextResponse.json({
    ok: true,
    assetKey: row.asset_key,
    expiresAt: exp,
    signature: sig,
    note: "Use signature within 5 minutes against private storage gateway.",
  });
}

