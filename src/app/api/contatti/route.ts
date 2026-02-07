import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { message: "Database non configurato" },
      { status: 503 },
    );
  }

  if (!resend || !process.env.RESEND_FROM || !process.env.RESEND_TO) {
    return NextResponse.json(
      { message: "Resend non configurato" },
      { status: 503 },
    );
  }

  const body = await request.json();
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const service = String(body?.service || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { message: "Compila tutti i campi obbligatori." },
      { status: 400 },
    );
  }

  const pool = getPool();
  await pool.execute(
    "INSERT INTO contact_requests (name, email, service, message) VALUES (?, ?, ?, ?)",
    [name, email, service, message],
  );

  const safeService = service || "Non specificato";
  const html = `
    <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="background:linear-gradient(135deg,#0f172a,#0b1120);padding:24px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">AG SERVIZI</h1>
          <p style="margin:6px 0 0;color:#cbd5f5;font-size:14px;">Nuova richiesta di contatto</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;color:#0f172a;font-size:16px;">Hai ricevuto una nuova richiesta dal sito.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 0;color:#64748b;width:140px;">Nome</td>
              <td style="padding:8px 0;color:#0f172a;font-weight:600;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;">Email</td>
              <td style="padding:8px 0;color:#0f172a;font-weight:600;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;">Servizio</td>
              <td style="padding:8px 0;color:#0f172a;font-weight:600;">${safeService}</td>
            </tr>
          </table>
          <div style="margin:16px 0;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
            <p style="margin:0;color:#0f172a;font-size:14px;white-space:pre-line;">${message}</p>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:12px;">Rispondi direttamente a questa email per contattare il cliente.</p>
        </div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: process.env.RESEND_TO,
    subject: `Nuova richiesta contatto - ${name}`,
    replyTo: email,
    text: [
      `Nome: ${name}`,
      `Email: ${email}`,
      `Servizio: ${safeService}`,
      "",
      message,
    ].join("\n"),
    html,
  });

  return NextResponse.json({ message: "Richiesta inviata" }, { status: 200 });
}
