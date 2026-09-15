import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type PortalRole = "CUSTOMER" | "OPERATOR" | "ADMIN" | "SUPERADMIN";


export const CUSTOMER_SESSION_COOKIE = "ag_customer_session";
export const STAFF_SESSION_COOKIE = "ag_staff_session";

export type SessionPayload = {
  sub: string;
  role: PortalRole;
  username: string;
  userId: number | null;
  exp: number;
  v: 1;
};

function getSessionSecret(kind: "customer" | "staff") {
  const secret =
    kind === "customer"
      ? process.env.CLIENT_PORTAL_SESSION_SECRET || process.env.SESSION_SECRET
      : process.env.ADMIN_PORTAL_SESSION_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing session secret for ${kind}`);
    }
    return `dev-${kind}-session-secret-not-for-production`;
  }
  return secret;
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function signSession(payload: SessionPayload, kind: "customer" | "staff") {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", getSessionSecret(kind)).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  kind: "customer" | "staff",
): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const expected = createHmac("sha256", getSessionSecret(kind)).update(body).digest();
    const actual = fromB64url(sig);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    if (!payload?.sub || !payload?.role || !payload?.exp) return null;
    if (Date.now() > payload.exp) return null;
    if (kind === "customer" && payload.role !== "CUSTOMER") return null;
    if (kind === "staff" && payload.role === "CUSTOMER") return null;
    return payload;
  } catch {
    return null;
  }
}

export function createCustomerSession(input: {
  username: string;
  userId: number | null;
  ttlMs?: number;
}) {
  const ttlMs = input.ttlMs ?? 12 * 60 * 60 * 1000;
  return signSession(
    {
      sub: `customer:${input.userId ?? input.username}`,
      role: "CUSTOMER",
      username: input.username,
      userId: input.userId,
      exp: Date.now() + ttlMs,
      v: 1,
    },
    "customer",
  );
}

export function createStaffSession(input: {
  username: string;
  role?: Exclude<PortalRole, "CUSTOMER">;
  ttlMs?: number;
}) {
  const ttlMs = input.ttlMs ?? 4 * 60 * 60 * 1000;
  return signSession(
    {
      sub: `staff:${input.username}`,
      role: input.role ?? "ADMIN",
      username: input.username,
      userId: null,
      exp: Date.now() + ttlMs,
      v: 1,
    },
    "staff",
  );
}

export async function readCustomerSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(CUSTOMER_SESSION_COOKIE)?.value, "customer");
}

export async function readStaffSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(STAFF_SESSION_COOKIE)?.value, "staff");
}

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function newCsrfToken() {
  return randomBytes(24).toString("hex");
}

export { safeNextPath } from "@/lib/auth/safe-next";

export function canAccessAdminModule(
  role: PortalRole,
  module:
    | "ops"
    | "shop_read"
    | "shop_write"
    | "refund"
    | "staff"
    | "settings",
) {
  if (role === "SUPERADMIN") return true;
  if (role === "ADMIN") {
    return module !== "staff" && module !== "settings";
  }
  if (role === "OPERATOR") {
    return module === "ops" || module === "shop_read";
  }
  return false;
}
