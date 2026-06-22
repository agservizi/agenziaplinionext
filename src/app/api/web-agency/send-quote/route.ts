import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getPool } from "@/lib/db";
import { escapeHtml } from "@/lib/escape-html";

export const runtime = "nodejs";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Gap 4: Use verified domain sender when available, fallback to gmail
const SENDER = process.env.RESEND_VERIFIED_FROM || process.env.RESEND_FROM || "ag.servizi16@gmail.com";

function buildQuoteHtml(data: {
  name: string;
  plan: string;
  project: string;
  budget: string;
  timeline: string;
  summary: string;
}) {
  const { name, plan, project, budget, timeline, summary } = data;
  const firstName = escapeHtml(name.split(" ")[0] || name);
  const safePlan = escapeHtml(plan);
  const safeProject = escapeHtml(project);
  const safeBudget = escapeHtml(budget);
  const safeTimeline = escapeHtml(timeline);
  const safeSummary = escapeHtml(summary);

  return `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0084ff 0%,#319AFF 50%,#60B1FF 100%);border-radius:20px 20px 0 0;padding:40px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">AG SERVIZI</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;text-transform:uppercase;letter-spacing:2px;">Web Agency</p>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:40px 32px;border-radius:0 0 20px 20px;border:1px solid #e2e8f0;border-top:none;">

    <p style="margin:0 0 24px;color:#0f172a;font-size:18px;font-weight:700;">Ciao ${firstName},</p>

    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
      grazie per aver parlato con il nostro consulente. Abbiamo preparato un riepilogo personalizzato in base alla nostra conversazione.
    </p>

    <!-- Project Card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#0084ff;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Il tuo progetto</p>
      <p style="margin:0;color:#0f172a;font-size:17px;font-weight:700;">${safeProject}</p>
    </div>

    <!-- Details Grid -->
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:16px;background:#f8fafc;border-radius:12px 0 0 0;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;width:50%;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Piano</p>
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${safePlan}</p>
        </td>
        <td style="padding:16px;background:#f8fafc;border-radius:0 12px 0 0;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Budget</p>
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${safeBudget}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background:#f8fafc;border-radius:0 0 0 12px;border-right:1px solid #e2e8f0;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Tempistiche</p>
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">${safeTimeline}</p>
        </td>
        <td style="padding:16px;background:#f8fafc;border-radius:0 0 12px 0;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Consulente</p>
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700;">AG Servizi</p>
        </td>
      </tr>
    </table>

    <!-- AI Summary -->
    <div style="background:linear-gradient(135deg,#0084ff08,#319AFF08);border:1px solid #0084ff20;border-radius:16px;padding:24px;margin:0 0 32px;">
      <p style="margin:0 0 8px;color:#0084ff;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Riepilogo personalizzato</p>
      <p style="margin:0;color:#334155;font-size:14px;line-height:1.8;">${safeSummary}</p>
    </div>

    <!-- Next Steps -->
    <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:700;">Prossimi passi</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 32px;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 0;vertical-align:top;width:32px;">
          <div style="width:24px;height:24px;background:#0084ff15;border-radius:8px;text-align:center;line-height:24px;color:#0084ff;font-size:12px;font-weight:800;">1</div>
        </td>
        <td style="padding:12px 0 12px 12px;color:#475569;font-size:14px;border-bottom:1px solid #f1f5f9;">Ti ricontattiamo entro 24h per approfondire i dettagli</td>
      </tr>
      <tr>
        <td style="padding:12px 0;vertical-align:top;">
          <div style="width:24px;height:24px;background:#0084ff15;border-radius:8px;text-align:center;line-height:24px;color:#0084ff;font-size:12px;font-weight:800;">2</div>
        </td>
        <td style="padding:12px 0 12px 12px;color:#475569;font-size:14px;border-bottom:1px solid #f1f5f9;">Prepariamo un preventivo dettagliato su misura</td>
      </tr>
      <tr>
        <td style="padding:12px 0;vertical-align:top;">
          <div style="width:24px;height:24px;background:#0084ff15;border-radius:8px;text-align:center;line-height:24px;color:#0084ff;font-size:12px;font-weight:800;">3</div>
        </td>
        <td style="padding:12px 0 12px 12px;color:#475569;font-size:14px;">Avviamo il progetto secondo le tempistiche concordate</td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="https://wa.me/393773798570?text=${encodeURIComponent(`Ciao, sono ${name}. Ho ricevuto il riepilogo per il piano ${plan}. Vorrei procedere.`)}" style="display:inline-block;background:#0084ff;color:#ffffff;padding:16px 40px;border-radius:14px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">Rispondi su WhatsApp</a>
      <p style="margin:12px 0 0;color:#94a3b8;font-size:12px;">oppure rispondi direttamente a questa email</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:24px 0;text-align:center;">
    <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">AG SERVIZI Web Agency</p>
    <p style="margin:0;color:#cbd5e1;font-size:11px;">Via Plinio il Vecchio 72, Castellammare di Stabia (NA) — +39 377 379 8570</p>
  </div>

</div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  if (!resend || !process.env.RESEND_FROM) {
    return NextResponse.json({ message: "Resend non configurato" }, { status: 503 });
  }

  let body: {
    name?: string;
    email?: string;
    phone?: string;
    plan?: string;
    project?: string;
    budget?: string;
    timeline?: string;
    conversation?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Body non valido" }, { status: 400 });
  }

  const name = body.name || "Cliente";
  const email = body.email;
  if (!email) {
    return NextResponse.json({ message: "Email obbligatoria" }, { status: 400 });
  }

  const plan = body.plan || "Sito Web";
  const project = body.project || "Progetto web";
  const budget = body.budget || "Da definire";
  const timeline = body.timeline || "Da concordare";
  const conversation = body.conversation || "";

  // Generate a personalized summary using Groq
  let summary = `Sulla base della nostra conversazione, stiamo preparando un preventivo per il tuo progetto "${project}" con il piano ${plan}. Ti contatteremo presto con tutti i dettagli.`;

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && conversation) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 300,
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `Sei un consulente web di AG SERVIZI. Scrivi un breve riepilogo personalizzato (3-4 frasi, italiano) per il preventivo email basandoti sulla conversazione. Includi cosa farai per il cliente, i punti chiave discussi e perché il piano scelto è adatto. Tono professionale ma caloroso. Solo testo, no markdown.`,
            },
            {
              role: "user",
              content: `Piano: ${plan}\nProgetto: ${project}\nBudget: ${budget}\nTempistiche: ${timeline}\n\nConversazione:\n${conversation}`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) summary = text;
      }
    } catch {
      // fallback to default summary
    }
  }

  const html = buildQuoteHtml({ name, plan, project, budget, timeline, summary });

  // Send to client
  await resend.emails.send({
    from: SENDER,
    to: email,
    subject: `Il tuo progetto ${plan} — AG SERVIZI Web Agency`,
    replyTo: process.env.RESEND_TO || process.env.RESEND_FROM,
    html,
  });

  // Notify team
  if (process.env.RESEND_TO) {
    await resend.emails.send({
      from: SENDER,
      to: process.env.RESEND_TO,
      subject: `Nuovo lead Web Agency — ${name} (${plan})`,
      replyTo: email,
      text: `Nome: ${name}\nEmail: ${email}\nTelefono: ${body.phone || "n/d"}\nPiano: ${plan}\nProgetto: ${project}\nBudget: ${budget}\nTempistiche: ${timeline}\n\nRiepilogo AI:\n${summary}`,
    });
  }

  // Gap 6: Save lead to DB
  try {
    const pool = getPool();
    await pool.execute(
      "INSERT INTO contact_requests (name, email, service, message) VALUES (?, ?, ?, ?)",
      [
        name,
        email,
        `Web Agency Preventivo - ${plan}`,
        `Telefono: ${body.phone || "n/d"}\nProgetto: ${project}\nBudget: ${budget}\nTempistiche: ${timeline}\n\nRiepilogo AI:\n${summary}`,
      ],
    );
  } catch (dbErr) {
    console.error("[send-quote] DB save error:", dbErr);
  }

  return NextResponse.json({ message: "Preventivo inviato" });
}
