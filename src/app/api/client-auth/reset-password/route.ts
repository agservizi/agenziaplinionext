import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getPool, isTableEnsured, markTableEnsured } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensurePasswordResetTable() {
  if (isTableEnsured("client_portal_password_resets")) return;
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS client_portal_password_resets (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_token_hash (token_hash),
      KEY idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  markTableEnsured("client_portal_password_resets");
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Troppe richieste." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { token?: string; password?: string };
    const token = String(body.token || "");
    const password = String(body.password || "");
    if (!token || password.length < 8) {
      return NextResponse.json(
        { message: "Token e password (min 8 caratteri) obbligatori." },
        { status: 400 },
      );
    }
    if (!process.env.MYSQL_HOST) {
      return NextResponse.json({ message: "Servizio non disponibile." }, { status: 503 });
    }

    await ensurePasswordResetTable();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, user_id, expires_at, used_at
       FROM client_portal_password_resets
       WHERE token_hash = ? LIMIT 1`,
      [tokenHash],
    );
    const row = rows[0];
    if (!row || row.used_at) {
      return NextResponse.json({ message: "Link non valido o già usato." }, { status: 400 });
    }
    if (new Date(row.expires_at as string).getTime() < Date.now()) {
      return NextResponse.json({ message: "Link scaduto." }, { status: 400 });
    }

    await pool.execute(`UPDATE client_portal_users SET password_hash = ? WHERE id = ?`, [
      hashPassword(password),
      row.user_id,
    ]);
    await pool.execute(`UPDATE client_portal_password_resets SET used_at = NOW() WHERE id = ?`, [
      row.id,
    ]);

    return NextResponse.json({ ok: true, message: "Password aggiornata. Ora puoi accedere." });
  } catch {
    return NextResponse.json({ message: "Operazione non riuscita." }, { status: 500 });
  }
}
