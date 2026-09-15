import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { hashPassword } from "@/lib/auth/password";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "staff");
  if ("error" in auth) return auth.error;
  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ ok: false, rows: [] }, { status: 503 });
  }
  await ensureSaleorBridgeTables();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, username, email, role, status, created_at FROM staff_users ORDER BY id DESC`,
  );
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "staff");
  if ("error" in auth) return auth.error;
  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ ok: false, error: "DB missing" }, { status: 503 });
  }

  await ensureSaleorBridgeTables();
  const body = (await request.json()) as {
    action?: "create" | "disable" | "enable";
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    role?: "OPERATOR" | "ADMIN" | "SUPERADMIN";
  };

  const pool = getPool();

  if (body.action === "disable" || body.action === "enable") {
    if (!body.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    await pool.execute(`UPDATE staff_users SET status = ? WHERE id = ?`, [
      body.action === "disable" ? "disabled" : "active",
      body.id,
    ]);
    return NextResponse.json({ ok: true });
  }

  if (!body.username || !body.password) {
    return NextResponse.json({ ok: false, error: "username and password required" }, { status: 400 });
  }

  await pool.execute(
    `INSERT INTO staff_users (username, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, 'active')`,
    [
      body.username.trim(),
      body.email?.trim() || null,
      hashPassword(body.password),
      body.role === "ADMIN" || body.role === "SUPERADMIN" ? body.role : "OPERATOR",
    ],
  );

  return NextResponse.json({ ok: true });
}
