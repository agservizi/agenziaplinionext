import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-static";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureClientPortalRegistrationRequestsTable() {
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    notes?: string;
  };

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const companyName = String(body.companyName || "").trim();
  const notes = String(body.notes || "").trim();

  if (!fullName || !email) {
    return NextResponse.json(
      { message: "Nome completo e email sono obbligatori." },
      { status: 400 },
    );
  }

  await ensureClientPortalRegistrationRequestsTable();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO client_portal_registration_requests
      (full_name, email, phone, company_name, notes, status)
     VALUES (?, ?, ?, ?, ?, 'new')`,
    [fullName, email, phone, companyName, notes],
  );

  if (resend && process.env.RESEND_FROM) {
    const destination = process.env.RESEND_TO || process.env.RESEND_FROM;
    const html = `
      <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">Nuova richiesta accesso area clienti</h1>
            <p style="margin:8px 0 0;color:#cbd5e1;font-size:14px;">Un cliente ha chiesto l’attivazione del suo accesso.</p>
          </div>
          <div style="padding:24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#64748b;width:150px;">Nome</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Telefono</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${phone || "Non indicato"}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;">Azienda</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${companyName || "Non indicata"}</td></tr>
            </table>
            ${
              notes
                ? `<div style="margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;"><p style="margin:0;color:#0f172a;font-size:14px;white-space:pre-line;">${notes}</p></div>`
                : ""
            }
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: destination,
      replyTo: email,
      subject: `Richiesta registrazione area clienti - ${fullName}`,
      text: [
        `Nome: ${fullName}`,
        `Email: ${email}`,
        `Telefono: ${phone || "Non indicato"}`,
        `Azienda: ${companyName || "Non indicata"}`,
        "",
        notes || "Nessuna nota",
      ].join("\n"),
      html,
    });
  }

  return NextResponse.json(
    {
      message:
        "Richiesta inviata. Ti ricontatteremo per attivare il tuo accesso all’area clienti.",
    },
    { status: 200 },
  );
}
