import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { hashPassword, randomTempPassword } from "@/lib/auth/password";
import { getPool } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "ops");
  if ("error" in auth) return auth.error;
  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ ok: false, error: "DB missing" }, { status: 503 });
  }

  const body = (await request.json()) as {
    action?: "disable" | "enable" | "reset-password";
    userId?: number;
  };
  if (!body.userId || !body.action) {
    return NextResponse.json({ ok: false, error: "userId and action required" }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM client_portal_users WHERE id = ? LIMIT 1`,
    [body.userId],
  );
  if (!rows[0]) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (body.action === "disable" || body.action === "enable") {
    await pool.execute(`UPDATE client_portal_users SET status = ? WHERE id = ?`, [
      body.action === "disable" ? "disabled" : "active",
      body.userId,
    ]);
    return NextResponse.json({ ok: true });
  }

  const tempPassword = randomTempPassword(12);
  await pool.execute(`UPDATE client_portal_users SET password_hash = ? WHERE id = ?`, [
    hashPassword(tempPassword),
    body.userId,
  ]);
  return NextResponse.json({ ok: true, tempPassword });
}
