/**
 * Callers: /api/client-area/visure/history, /api/client-area/caf-patronato/history.
 * API: verifies legacy localStorage client-portal HMAC token (+ optional cookie session).
 * Schema: client_portal_users; token payload {username,userId,source,exp}.
 * User: "/area-clienti/visure/storico Unexpected token 'I', \"Internal S\"... is not valid JSON"
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireCustomerSession } from "@/lib/auth/api-guard";
import { getPool } from "@/lib/db";

export type ClientAreaActor = {
  username: string;
  userId: number | null;
  email: string;
  fullName: string;
  source: string;
};

function clientPortalSecret() {
  const secret = String(
    process.env.CLIENT_PORTAL_SESSION_SECRET || process.env.SESSION_SECRET || "",
  ).trim();
  if (!secret) {
    throw new Error("CLIENT_PORTAL_SESSION_SECRET non configurato");
  }
  return secret;
}

function verifyLegacyClientPortalToken(token: string): {
  username: string;
  userId: number | null;
  source: string;
  fullName: string;
  exp: number;
} | null {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = createHmac("sha256", clientPortalSecret())
    .update(payload)
    .digest("base64url");
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length) return null;
  if (!timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username?: string;
      userId?: number | null;
      source?: string;
      fullName?: string;
      exp?: number;
    };
    if (!parsed?.username || !parsed?.exp) return null;
    if (Number(parsed.exp) < Date.now()) return null;
    return {
      username: String(parsed.username),
      userId: typeof parsed.userId === "number" ? parsed.userId : null,
      source: String(parsed.source || "unknown"),
      fullName: parsed.fullName ? String(parsed.fullName) : "",
      exp: Number(parsed.exp),
    };
  } catch {
    return null;
  }
}

async function loadClientPortalUser(session: {
  username: string;
  userId: number | null;
  source: string;
}) {
  if (session.source === "env") {
    return {
      username: session.username,
      userId: null as number | null,
      email: "",
      fullName: "",
      source: "env",
    };
  }

  if (!process.env.MYSQL_HOST) return null;
  const pool = getPool();
  const numericUserId = Number(session.userId || 0);

  if (numericUserId > 0) {
    const [rows] = await pool.query(
      `SELECT id, full_name, username, email, phone, company_name, status
       FROM client_portal_users
       WHERE id = ?
       LIMIT 1`,
      [numericUserId],
    );
    const user = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
    if (user && String(user.status || "active") === "active") {
      return {
        username: String(user.username || session.username),
        userId: Number(user.id || 0) || null,
        email: String(user.email || "").toLowerCase(),
        fullName: String(user.full_name || ""),
        source: "db",
      };
    }
  }

  const identifier = String(session.username || "").toLowerCase();
  if (!identifier) return null;
  const [rows] = await pool.query(
    `SELECT id, full_name, username, email, phone, company_name, status
     FROM client_portal_users
     WHERE LOWER(username) = ? OR LOWER(email) = ?
     LIMIT 1`,
    [identifier, identifier],
  );
  const user = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
  if (!user || String(user.status || "active") !== "active") return null;

  return {
    username: String(user.username || session.username),
    userId: Number(user.id || 0) || null,
    email: String(user.email || "").toLowerCase(),
    fullName: String(user.full_name || ""),
    source: "db",
  };
}

export async function resolveClientAreaActor(
  request: NextRequest,
  bodyToken?: string,
): Promise<{ actor: ClientAreaActor } | { error: string; status: number }> {
  const cookieAuth = requireCustomerSession(request);
  if (!("error" in cookieAuth)) {
    const session = cookieAuth.session;
    const user = await loadClientPortalUser({
      username: session.username,
      userId: session.userId,
      source: session.userId ? "db" : "env",
    });
    if (user) return { actor: user };
    return {
      actor: {
        username: session.username,
        userId: session.userId,
        email: "",
        fullName: "",
        source: "cookie",
      },
    };
  }

  const token = String(bodyToken || "").trim();
  if (!token) {
    return { error: "Sessione cliente non valida.", status: 401 };
  }

  try {
    const legacy = verifyLegacyClientPortalToken(token);
    if (!legacy) {
      return { error: "Sessione cliente non valida.", status: 401 };
    }
    const user = await loadClientPortalUser(legacy);
    if (!user) {
      return { error: "Profilo cliente non disponibile.", status: 401 };
    }
    return { actor: user };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Autenticazione non riuscita.",
      status: 500,
    };
  }
}

export function requestOwnedByActor(
  details: Record<string, unknown> | null | undefined,
  requestEmail: string,
  actor: ClientAreaActor,
) {
  const payloadUserId = Number(details?.clientUserId || 0);
  const payloadUsername = String(details?.clientUsername || "").trim().toLowerCase();
  const payloadEmail = String(details?.clientEmail || requestEmail || "")
    .trim()
    .toLowerCase();
  const currentUsername = String(actor.username || "").trim().toLowerCase();
  const currentEmail = String(actor.email || "").trim().toLowerCase();
  const currentUserId = Number(actor.userId || 0);

  if (currentUserId > 0 && payloadUserId > 0 && currentUserId === payloadUserId) return true;
  if (currentEmail && payloadEmail && currentEmail === payloadEmail) return true;
  if (currentUsername && payloadUsername && currentUsername === payloadUsername) return true;
  if (currentEmail && requestEmail && currentEmail === requestEmail.trim().toLowerCase()) {
    return true;
  }
  return false;
}
