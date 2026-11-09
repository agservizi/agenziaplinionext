import { NextResponse } from "next/server";
import {
  decodeUnsubscribeEmailToken,
  revokeMarketingConsentByEmail,
} from "@/lib/marketing-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let token = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { email?: string; e?: string };
    email = String(body.email || "").trim().toLowerCase();
    token = String(body.e || "").trim();
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "").trim().toLowerCase();
    token = String(form.get("e") || "").trim();
  }

  if (!email && token) {
    email = decodeUnsubscribeEmailToken(token);
  }

  if (!email) {
    return NextResponse.json({ message: "Email non valida." }, { status: 400 });
  }

  await revokeMarketingConsentByEmail(email);
  return NextResponse.json({
    ok: true,
    message: "Disiscrizione dalle comunicazioni commerciali completata.",
  });
}

/** One-click List-Unsubscribe (RFC 8058) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("e") || "").trim();
  const email = decodeUnsubscribeEmailToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/disiscriviti?error=1", request.url));
  }
  await revokeMarketingConsentByEmail(email);
  return NextResponse.redirect(new URL("/disiscriviti?ok=1", request.url));
}
