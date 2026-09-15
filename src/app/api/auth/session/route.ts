import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  STAFF_SESSION_COOKIE,
  createCustomerSession,
  createStaffSession,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";

/**
 * Dual-read cutover:
 * - POST { kind: "customer"|"staff", token: legacyOrNew }
 * Validates and sets httpOnly session cookie.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`session-sync:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: { kind?: string; token?: string; username?: string; userId?: number | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = body.kind === "staff" ? "staff" : "customer";
  const token = String(body.token || "");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Already new-format cookie token?
  const existing = verifySessionToken(token, kind);
  if (existing) {
    const res = NextResponse.json({ ok: true, role: existing.role });
    const cookieName = kind === "staff" ? STAFF_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
    const maxAge = Math.max(60, Math.floor((existing.exp - Date.now()) / 1000));
    res.cookies.set(cookieName, token, sessionCookieOptions(maxAge));
    return res;
  }

  // Legacy HMAC portal token: trust only after upstream session validate
  const origin = request.nextUrl.origin;
  const validatePath =
    kind === "staff" ? "/api/admin-auth/session" : "/api/client-auth/session";

  try {
    const upstream = await fetch(`${origin}${validatePath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const data = (await upstream.json()) as {
      ok?: boolean;
      username?: string;
      userId?: number | null;
    };
    if (!data?.ok && !data?.username) {
      // Some backends return username at top-level without ok
      if (!data?.username) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      }
    }

    const username = String(data.username || body.username || "user");
    const userId =
      typeof data.userId === "number"
        ? data.userId
        : typeof body.userId === "number"
          ? body.userId
          : null;

    const sessionToken =
      kind === "staff"
        ? createStaffSession({ username, role: "ADMIN" })
        : createCustomerSession({ username, userId });

    const res = NextResponse.json({ ok: true, kind });
    const cookieName = kind === "staff" ? STAFF_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
    const maxAge = kind === "staff" ? 4 * 60 * 60 : 12 * 60 * 60;
    res.cookies.set(cookieName, sessionToken, sessionCookieOptions(maxAge));
    return res;
  } catch {
    return NextResponse.json({ error: "Session sync failed" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") === "staff" ? "staff" : "customer";
  const res = NextResponse.json({ ok: true });
  const cookieName = kind === "staff" ? STAFF_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
  res.cookies.set(cookieName, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}
