import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSession,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";

/**
 * Callers: AuthBridgeClient, SessionCookieBridge.
 * API: POST /api/auth/session. Schema: token only; identity from upstream.user.
 * User: procedi con tutto al 100% (security-audit AUTHZ-002).
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`session-sync:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  let body: { kind?: string; token?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.kind === "staff") {
    return NextResponse.json({ error: "Staff portal removed" }, { status: 410 });
  }

  const token = String(body.token || "");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const existing = verifySessionToken(token, "customer");
  if (existing) {
    const res = NextResponse.json({ ok: true, role: existing.role });
    const maxAge = Math.max(60, Math.floor((existing.exp - Date.now()) / 1000));
    res.cookies.set(CUSTOMER_SESSION_COOKIE, token, sessionCookieOptions(maxAge));
    return res;
  }

  const origin = request.nextUrl.origin;
  try {
    const upstream = await fetch(`${origin}/api/client-auth/session`, {
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
      user?: { username?: string; userId?: number | null };
    };

    const username = String(data.user?.username || data.username || "").trim();
    if (!username) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    const userId =
      typeof data.user?.userId === "number"
        ? data.user.userId
        : typeof data.userId === "number"
          ? data.userId
          : null;

    const sessionToken = createCustomerSession({ username, userId });
    const res = NextResponse.json({ ok: true, kind: "customer" });
    res.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, sessionCookieOptions(12 * 60 * 60));
    return res;
  } catch {
    return NextResponse.json({ error: "Session sync failed" }, { status: 502 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}
