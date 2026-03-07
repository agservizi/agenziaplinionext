import { Resend } from "resend";

type NotifyClientAreaEventInput = {
  area: string;
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  details?: Record<string, unknown>;
};

type SendConsultationEmailsInput = {
  requestCode: string;
  serviceLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyType?: string;
  city?: string;
  details?: Record<string, unknown>;
};

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function toSafeString(value: unknown) {
  return String(value ?? "").trim();
}

function buildDetailsList(details: Record<string, unknown>) {
  const entries = Object.entries(details)
    .map(([key, value]) => [toSafeString(key), toSafeString(value)] as const)
    .filter(([key, value]) => key !== "" && value !== "");

  return entries;
}

export async function notifyClientAreaEvent(input: NotifyClientAreaEventInput) {
  if (!resend || !process.env.RESEND_FROM) {
    return { sent: false, reason: "not_configured" as const };
  }

  const destination = String(process.env.RESEND_TO || process.env.RESEND_FROM).trim();
  if (!destination) {
    return { sent: false, reason: "missing_destination" as const };
  }

  const details = buildDetailsList(input.details || {});
  const areaLabel = toSafeString(input.area) || "area-clienti";
  const subject = `[Area Clienti] ${toSafeString(input.title) || "Nuovo evento"}`;

  const detailsText = details.length
    ? details.map(([key, value]) => `- ${key}: ${value}`).join("\n")
    : "- Nessun dettaglio aggiuntivo";

  const detailsHtml = details.length
    ? details
        .map(
          ([key, value]) =>
            `<tr><td style=\"padding:6px 0;color:#64748b;width:220px;vertical-align:top;\">${key}</td><td style=\"padding:6px 0;color:#0f172a;font-weight:600;\">${value}</td></tr>`,
        )
        .join("")
    : `<tr><td style=\"padding:6px 0;color:#64748b;\" colspan=\"2\">Nessun dettaglio aggiuntivo</td></tr>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: destination,
    replyTo: input.customerEmail,
    subject,
    text: [
      `Evento: ${toSafeString(input.title)}`,
      `Area: ${areaLabel}`,
      `Cliente: ${toSafeString(input.customerName)}`,
      `Email: ${toSafeString(input.customerEmail)}`,
      `Telefono: ${toSafeString(input.customerPhone) || "Non indicato"}`,
      "",
      "Dettagli:",
      detailsText,
    ].join("\n"),
    html: `
      <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:740px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:20px 24px;">
            <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${areaLabel}</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">${toSafeString(input.title)}</h1>
          </div>
          <div style="padding:22px 24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#64748b;width:220px;">Cliente</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${toSafeString(input.customerName)}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${toSafeString(input.customerEmail)}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Telefono</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${toSafeString(input.customerPhone) || "Non indicato"}</td></tr>
            </table>
            <div style="margin-top:14px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
              <p style="margin:0 0 8px;color:#334155;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Dettagli evento</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">${detailsHtml}</table>
            </div>
          </div>
        </div>
      </div>
    `,
  });

  return { sent: true, reason: "sent" as const };
}

export async function sendInteractiveConsultationEmails(input: SendConsultationEmailsInput) {
  if (!resend || !process.env.RESEND_FROM) {
    return { sent: false, reason: "not_configured" as const };
  }

  const backoffice = String(process.env.RESEND_TO || process.env.RESEND_FROM).trim();
  if (!backoffice) {
    return { sent: false, reason: "missing_destination" as const };
  }

  const details = buildDetailsList(input.details || {});
  const detailsText = details.length
    ? details.map(([key, value]) => `- ${key}: ${value}`).join("\n")
    : "- Nessun dettaglio aggiuntivo";

  const detailsHtml = details.length
    ? details
        .map(
          ([key, value]) =>
            `<tr><td style="padding:6px 0;color:#64748b;width:220px;vertical-align:top;">${key}</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${value}</td></tr>`,
        )
        .join("")
    : `<tr><td style="padding:6px 0;color:#64748b;" colspan="2">Nessun dettaglio aggiuntivo</td></tr>`;

  const requestCode = toSafeString(input.requestCode);
  const serviceLabel = toSafeString(input.serviceLabel);
  const customerName = toSafeString(input.customerName);
  const customerEmail = toSafeString(input.customerEmail);
  const customerPhone = toSafeString(input.customerPhone) || "Non indicato";
  const companyType = toSafeString(input.companyType) || "Privato";
  const city = toSafeString(input.city) || "Non indicata";

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: backoffice,
    replyTo: customerEmail,
    subject: `[Consulenza Interattiva] Nuova richiesta ${requestCode}`,
    text: [
      `Nuova richiesta consulenza: ${requestCode}`,
      `Servizio: ${serviceLabel}`,
      `Cliente: ${customerName}`,
      `Email: ${customerEmail}`,
      `Telefono: ${customerPhone}`,
      `Tipologia: ${companyType}`,
      `Città: ${city}`,
      "",
      "Dettagli:",
      detailsText,
    ].join("\n"),
    html: `
      <div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:740px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:20px 24px;">
            <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Consulenza Interattiva</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">Nuova richiesta ${requestCode}</h1>
          </div>
          <div style="padding:22px 24px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#64748b;width:220px;">Servizio</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${serviceLabel}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Cliente</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${customerName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${customerEmail}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Telefono</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${customerPhone}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Tipologia</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${companyType}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Città</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">${city}</td></tr>
            </table>
            <div style="margin-top:14px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
              <p style="margin:0 0 8px;color:#334155;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Dettagli richiesta</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">${detailsHtml}</table>
            </div>
          </div>
        </div>
      </div>
    `,
  });

  if (customerEmail.includes("@")) {
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: customerEmail,
      subject: `Richiesta ricevuta: ${requestCode}`,
      text: [
        `Ciao ${customerName},`,
        "",
        `abbiamo ricevuto la tua richiesta di consulenza (${serviceLabel}).`,
        `Codice richiesta: ${requestCode}`,
        "",
        "Ti contatteremo a breve ai recapiti indicati.",
        "",
        "AG SERVIZI",
      ].join("\n"),
      html: `
        <div style="background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:20px 24px;">
              <p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">AG SERVIZI</p>
              <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">Richiesta ricevuta</h1>
            </div>
            <div style="padding:22px 24px;">
              <p style="margin:0 0 10px;color:#0f172a;font-size:15px;">Ciao ${customerName}, abbiamo ricevuto la tua richiesta di consulenza.</p>
              <p style="margin:0;color:#334155;font-size:14px;">Servizio: <strong>${serviceLabel}</strong></p>
              <p style="margin:6px 0 0;color:#334155;font-size:14px;">Codice richiesta: <strong>${requestCode}</strong></p>
              <p style="margin:16px 0 0;color:#475569;font-size:14px;">Ti contatteremo a breve ai recapiti indicati.</p>
            </div>
          </div>
        </div>
      `,
    });
  }

  return { sent: true, reason: "sent" as const };
}
