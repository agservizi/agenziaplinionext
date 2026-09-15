import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { hashPassword, randomTempPassword } from "@/lib/auth/password";
import { getPool, isTableEnsured, markTableEnsured } from "@/lib/db";

async function ensureRegTable() {
  if (isTableEnsured("client_portal_registration_requests")) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_portal_registration_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      company_name VARCHAR(191) DEFAULT '',
      notes TEXT DEFAULT '',
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_portal_registration_status (status),
      KEY idx_client_portal_registration_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  markTableEnsured("client_portal_registration_requests");
}

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "ops");
  if ("error" in auth) return auth.error;
  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ ok: false, rows: [] }, { status: 503 });
  }
  await ensureRegTable();
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, full_name, email, phone, company_name, status, created_at, notes
     FROM client_portal_registration_requests ORDER BY id DESC LIMIT 200`,
  );
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "ops");
  if ("error" in auth) return auth.error;
  if (!process.env.MYSQL_HOST) {
    return NextResponse.json({ ok: false, error: "DB missing" }, { status: 503 });
  }

  const body = (await request.json()) as {
    id?: number;
    action?: "approve" | "reject";
  };
  if (!body.id || !body.action) {
    return NextResponse.json({ ok: false, error: "id and action required" }, { status: 400 });
  }

  await ensureRegTable();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM client_portal_registration_requests WHERE id = ? LIMIT 1`,
    [body.id],
  );
  const req = rows[0];
  if (!req) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  if (body.action === "reject") {
    await pool.execute(
      `UPDATE client_portal_registration_requests SET status = 'rejected' WHERE id = ?`,
      [body.id],
    );
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  const email = String(req.email).toLowerCase().trim();
  const usernameBase = email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").slice(0, 40) || `user${req.id}`;
  const tempPassword = randomTempPassword(12);
  const passwordHash = hashPassword(tempPassword);

  const [existing] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM client_portal_users WHERE LOWER(email) = ? OR username = ? LIMIT 1`,
    [email, usernameBase],
  );

  let userId = existing[0]?.id as number | undefined;
  if (!userId) {
    const [result] = await pool.execute(
      `INSERT INTO client_portal_users
        (full_name, username, email, phone, company_name, password_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        String(req.full_name || ""),
        usernameBase,
        email,
        String(req.phone || ""),
        String(req.company_name || ""),
        passwordHash,
      ],
    );
    userId = Number((result as { insertId?: number }).insertId);
  } else {
    await pool.execute(
      `UPDATE client_portal_users SET status = 'active', password_hash = ? WHERE id = ?`,
      [passwordHash, userId],
    );
  }

  await pool.execute(
    `UPDATE client_portal_registration_requests SET status = 'approved' WHERE id = ?`,
    [body.id],
  );

  return NextResponse.json({
    ok: true,
    status: "approved",
    userId,
    username: usernameBase,
    tempPassword,
  });
}
