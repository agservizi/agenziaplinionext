import { Resend } from "resend";
import { company } from "@/lib/site-data";
import { getPool } from "@/lib/db";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type MarketingEmailInput = {
  to: string;
  subject: string;
  /** Plain text body (required). No open-tracking pixels. */
  text: string;
  /** Optional HTML without tracking pixels / remote beacons. */
  html?: string;
  /** Must be true: caller already verified marketing consent. */
  marketingConsentVerified: boolean;
};

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "https://agenziaplinio.it"
  );
}

function unsubscribeUrl(email: string) {
  const token = Buffer.from(email.trim().toLowerCase(), "utf8").toString("base64url");
  return `${siteOrigin()}/disiscriviti?e=${encodeURIComponent(token)}`;
}

/**
 * Sends a commercial/marketing email only when consent is verified.
 * Includes List-Unsubscribe headers, identifiable sender, no open pixels.
 */
export async function sendMarketingEmail(input: MarketingEmailInput) {
  if (!input.marketingConsentVerified) {
    return { sent: false as const, reason: "missing_marketing_consent" as const };
  }
  if (!resend || !process.env.RESEND_FROM) {
    return { sent: false as const, reason: "not_configured" as const };
  }

  const to = String(input.to || "").trim().toLowerCase();
  if (!to || !to.includes("@")) {
    return { sent: false as const, reason: "invalid_recipient" as const };
  }

  const unsub = unsubscribeUrl(to);
  const footerText = [
    "",
    "—",
    `Mittente: ${company.legalName} · P.IVA ${company.vat}`,
    company.address,
    `Telefono: ${company.phone}`,
    `Per non ricevere più comunicazioni commerciali: ${unsub}`,
  ].join("\n");

  const text = `${input.text.trim()}${footerText}`;
  const html =
    input.html?.trim() ||
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.5;max-width:640px;">
      <div style="white-space:pre-line;">${text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#64748b;">
        Mittente: ${company.legalName} · P.IVA ${company.vat}<br/>
        ${company.address}<br/>
        <a href="${unsub}">Disiscriviti dalle comunicazioni commerciali</a>
      </p>
    </div>`;

  // Guard: refuse HTML that embeds tracking pixels / remote beacons.
  if (/<img[^>]+src=["']https?:/i.test(html) || /tracking|open\.gif|pixel/i.test(html)) {
    return { sent: false as const, reason: "tracking_content_blocked" as const };
  }

  await resend.emails.send({
    from: `${company.name} <${process.env.RESEND_FROM}>`,
    to,
    subject: input.subject,
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  return { sent: true as const, unsubscribeUrl: unsub };
}

export async function revokeMarketingConsentByEmail(email: string) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { ok: false as const, reason: "invalid_email" as const };
  }

  try {
    const pool = getPool();
    await pool.execute(
      `UPDATE client_area_notification_prefs p
       INNER JOIN client_portal_users u ON u.id = p.client_user_id
       SET p.marketing = 0
       WHERE LOWER(u.email) = ?`,
      [normalized],
    );
  } catch {
    // Table may not exist in all environments; still treat as soft-success for UX.
  }

  return { ok: true as const };
}

export function decodeUnsubscribeEmailToken(token: string) {
  try {
    const raw = Buffer.from(String(token || ""), "base64url").toString("utf8").trim().toLowerCase();
    if (!raw.includes("@")) return "";
    return raw;
  } catch {
    return "";
  }
}
