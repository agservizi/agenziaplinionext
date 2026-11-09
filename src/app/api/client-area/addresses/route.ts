import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireCustomerSession } from "@/lib/auth/api-guard";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = requireCustomerSession(request);
  if ("error" in auth) return auth.error;
  if (!auth.session.userId) {
    return NextResponse.json({ ok: true, rows: [] });
  }
    const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT * FROM client_shipping_addresses WHERE client_user_id = ? ORDER BY is_default DESC, id DESC`,
    [auth.session.userId],
  );
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: NextRequest) {
  const auth = requireCustomerSession(request);
  if ("error" in auth) return auth.error;
  if (!auth.session.userId) {
    return NextResponse.json({ ok: false, error: "Account incompleto" }, { status: 400 });
  }

  const body = (await request.json()) as {
    action?: "create" | "delete" | "set-default";
    id?: number;
    kind?: "shipping" | "billing";
    fullName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    province?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  };

    const pool = getPool();
  const userId = auth.session.userId;

  if (body.action === "delete" && body.id) {
    await pool.execute(
      `DELETE FROM client_shipping_addresses WHERE id = ? AND client_user_id = ?`,
      [body.id, userId],
    );
    return NextResponse.json({ ok: true });
  }

  if (body.action === "set-default" && body.id) {
    await pool.execute(
      `UPDATE client_shipping_addresses SET is_default = 0 WHERE client_user_id = ?`,
      [userId],
    );
    await pool.execute(
      `UPDATE client_shipping_addresses SET is_default = 1 WHERE id = ? AND client_user_id = ?`,
      [body.id, userId],
    );
    return NextResponse.json({ ok: true });
  }

  if (!body.fullName || !body.line1 || !body.city || !body.postalCode) {
    return NextResponse.json({ ok: false, error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const postal = body.postalCode.trim();
  if (!/^\d{5}$/.test(postal)) {
    return NextResponse.json({ ok: false, error: "CAP italiano non valido (5 cifre)" }, { status: 400 });
  }

  if (body.isDefault) {
    await pool.execute(
      `UPDATE client_shipping_addresses SET is_default = 0 WHERE client_user_id = ?`,
      [userId],
    );
  }

  await pool.execute(
    `INSERT INTO client_shipping_addresses
      (client_user_id, kind, full_name, line1, line2, city, postal_code, province, country, phone, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      body.kind === "billing" ? "billing" : "shipping",
      body.fullName.trim(),
      body.line1.trim(),
      body.line2?.trim() || null,
      body.city.trim(),
      postal,
      body.province?.trim().toUpperCase().slice(0, 2) || null,
      (body.country || "IT").toUpperCase().slice(0, 2),
      body.phone?.trim() || null,
      body.isDefault ? 1 : 0,
    ],
  );

  return NextResponse.json({ ok: true });
}
