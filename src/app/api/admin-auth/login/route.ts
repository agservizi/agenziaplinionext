import { NextRequest, NextResponse } from "next/server";
import {
  STAFF_SESSION_COOKIE,
  createStaffSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";

/** CMS editor login via STORE_ADMIN_*. Callers: /admin-login. User: protect /area-admin with old admin-login. */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`admin-login:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Troppi tentativi. Riprova tra 15 minuti." }, { status: 429 });
  }

  const expectedUser = String(process.env.STORE_ADMIN_USER || "").trim();
  const expectedPass = String(process.env.STORE_ADMIN_PASSWORD || "").trim();
  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ message: "Credenziali admin non configurate" }, { status: 503 });
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Richiesta non valida" }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();
  if (!username || !password) {
    return NextResponse.json({ message: "Inserisci nome utente e password" }, { status: 400 });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ message: "Credenziali non valide" }, { status: 401 });
  }

  const token = createStaffSession({ username, role: "ADMIN" });
  const res = NextResponse.json({ ok: true, username, role: "ADMIN" });
  res.cookies.set(STAFF_SESSION_COOKIE, token, sessionCookieOptions(4 * 60 * 60));
  return res;
}
