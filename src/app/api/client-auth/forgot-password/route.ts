import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool, isTableEnsured, markTableEnsured } from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

async function ensurePasswordResetTable() {
  if (isTableEnsured("client_portal_password_resets")) return;
  const pool = getPool();
  await pool.execute(`
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
  const limited = rateLimit(`forgot-password:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Troppe richieste. Riprova più tardi." }, { status: 429 });
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email obbligatoria." }, { status: 400 });
    }

    const successMessage = "Se l'email e registrata, riceverai le istruzioni per il reset.";

    if (!process.env.MYSQL_HOST) {
      return NextResponse.json({ message: successMessage });
    }

    const pool = getPool();
    await ensurePasswordResetTable();

    const [rows] = await pool.query(
      "SELECT id, email, full_name FROM client_portal_users WHERE LOWER(email) = ? AND status = 'active' LIMIT 1",
      [email.trim().toLowerCase()],
    );

    if (!Array.isArray(rows) || !rows[0]) {
      return NextResponse.json({ message: successMessage });
    }

    const user = rows[0] as { id: number; email: string; full_name?: string };
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.execute(
      `INSERT INTO client_portal_password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [user.id, tokenHash, expiresAt],
    );

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const resetUrl = `${origin.replace(/\/$/, "")}/login?reset=${rawToken}`;

    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: user.email,
            subject: "Reset password Area Clienti — AG SERVIZI",
            html: `<p>Ciao ${user.full_name || ""},</p><p>Per reimpostare la password apri questo link (valido 1 ora):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se non hai richiesto tu il reset, ignora questa email.</p>`,
          }),
        });
      } catch {
        // Still return generic success (anti-enumeration)
      }
    }

    return NextResponse.json({ message: successMessage });
  } catch {
    return NextResponse.json({ message: "Operazione non riuscita." }, { status: 500 });
  }
}
