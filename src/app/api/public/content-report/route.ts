import { NextResponse } from "next/server";
import { Resend } from "resend";
import { company } from "@/lib/site-data";
import { escapeHtml } from "@/lib/escape-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    reporterName?: string;
    reporterEmail?: string;
    contentUrl?: string;
    category?: string;
    description?: string;
    goodFaith?: boolean;
  };

  const reporterName = String(body.reporterName || "").trim();
  const reporterEmail = String(body.reporterEmail || "").trim().toLowerCase();
  const contentUrl = String(body.contentUrl || "").trim();
  const category = String(body.category || "").trim();
  const description = String(body.description || "").trim();
  const goodFaith = body.goodFaith === true;

  if (!reporterName || !reporterEmail || !contentUrl || !category || !description || !goodFaith) {
    return NextResponse.json(
      { message: "Compila tutti i campi e conferma la dichiarazione di buona fede." },
      { status: 400 },
    );
  }

  if (!resend || !process.env.RESEND_FROM) {
    return NextResponse.json(
      {
        message:
          "Servizio segnalazioni temporaneamente non disponibile. Scrivi a info@agenziaplinio.it.",
      },
      { status: 503 },
    );
  }

  const destination = process.env.RESEND_TO || process.env.RESEND_FROM;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: destination,
    replyTo: reporterEmail,
    subject: `[DSA] Segnalazione contenuto — ${category}`,
    text: [
      "Nuova segnalazione contenuto (DSA)",
      `Segnalante: ${reporterName}`,
      `Email: ${reporterEmail}`,
      `Categoria: ${category}`,
      `Riferimento: ${contentUrl}`,
      "",
      description,
      "",
      `Titolare: ${company.legalName} · P.IVA ${company.vat}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;color:#0f172a;">
        <h1 style="font-size:18px;">Segnalazione contenuto (DSA)</h1>
        <p><strong>Segnalante:</strong> ${escapeHtml(reporterName)} &lt;${escapeHtml(reporterEmail)}&gt;</p>
        <p><strong>Categoria:</strong> ${escapeHtml(category)}</p>
        <p><strong>Riferimento:</strong> ${escapeHtml(contentUrl)}</p>
        <div style="margin-top:16px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-line;">${escapeHtml(description)}</div>
        <p style="margin-top:16px;font-size:12px;color:#64748b;">Procedura: valutare entro tempi ragionevoli e rimuovere/disabilitare se illecito.</p>
      </div>
    `,
  });

  return NextResponse.json({
    ok: true,
    message: "Segnalazione inviata. La esamineremo e ti risponderemo se servono chiarimenti.",
  });
}
