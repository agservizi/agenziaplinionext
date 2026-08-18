import crypto from "node:crypto";
import { getPool } from "@/lib/db";

const DEFAULT_BASE_URL = "https://gestiio.agenziaplinio.it/api/public/send";
export const SEND_GUEST_COOKIE = "ag_send_guest";

function sendBaseUrl() {
  return (process.env.GESTIIO_SEND_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function sendApiKey() {
  const key = process.env.GESTIIO_SEND_API_KEY?.trim();
  if (!key) {
    throw new Error("GESTIIO_SEND_API_KEY non configurata");
  }
  return key;
}

export function sendAffiliatoId() {
  const id = Number(process.env.GESTIIO_SEND_AFFILIATO_ID);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("GESTIIO_SEND_AFFILIATO_ID non configurato");
  }
  return id;
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function readTokenIdentity(token: string) {
  try {
    const [payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      username?: string;
      userId?: number | null;
    };
    const username = String(parsed.username || "").trim().toLowerCase();
    return username ? `${parsed.userId || "username"}:${username}` : "";
  } catch {
    return "";
  }
}

function guestSecret() {
  const secret = (
    process.env.GESTIIO_SEND_GUEST_SECRET ||
    process.env.CLIENT_PORTAL_SESSION_SECRET
  )?.trim();
  if (!secret) throw new Error("Segreto sessione ospite SEND non configurato");
  return secret;
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function signGuestId(id: string) {
  return crypto.createHmac("sha256", guestSecret()).update(id).digest("base64url");
}

export function createSendGuestSession() {
  const id = crypto.randomUUID();
  return `${id}.${signGuestId(id)}`;
}

export function readSendGuestIdentity(request: Request) {
  const value = cookieValue(request, SEND_GUEST_COOKIE);
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return "";
  const id = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !signature) return "";

  const expected = Buffer.from(signGuestId(id), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return "";
  return `guest:${id}`;
}

export async function requireSendClientIdentity(request: Request) {
  const token = bearerToken(request);
  if (!token) return readSendGuestIdentity(request) || null;

  const response = await fetch(new URL("/api/client-auth/session", request.url), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) return null;

  return readTokenIdentity(token) || null;
}

export async function ensureSendClientRequestsTable() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS gestiio_send_client_requests (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      client_identity VARCHAR(255) NOT NULL,
      send_uuid CHAR(36) NOT NULL,
      request_number VARCHAR(100) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_gestiio_send_uuid (send_uuid),
      KEY idx_gestiio_send_client (client_identity),
      KEY idx_gestiio_send_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function linkSendRequest(
  clientIdentity: string,
  input: { uuid: string; requestNumber?: string; status?: string },
) {
  await ensureSendClientRequestsTable();
  await getPool().execute(
    `INSERT INTO gestiio_send_client_requests
      (client_identity, send_uuid, request_number, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       request_number = VALUES(request_number),
       status = VALUES(status),
       updated_at = CURRENT_TIMESTAMP`,
    [clientIdentity, input.uuid, input.requestNumber || null, input.status || "draft"],
  );
}

export async function clientOwnsSendRequest(clientIdentity: string, uuid: string) {
  await ensureSendClientRequestsTable();
  const [rows] = await getPool().execute(
    `SELECT id FROM gestiio_send_client_requests
     WHERE client_identity = ? AND send_uuid = ? LIMIT 1`,
    [clientIdentity, uuid],
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function ensureSendPaymentsTable() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS gestiio_send_payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      client_identity VARCHAR(255) NOT NULL,
      send_uuid CHAR(36) NOT NULL,
      stripe_session_id VARCHAR(255) NOT NULL,
      amount_cents INT UNSIGNED NOT NULL,
      currency CHAR(3) NOT NULL DEFAULT 'EUR',
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      paid_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_gestiio_send_stripe_session (stripe_session_id),
      KEY idx_gestiio_send_payment_owner (client_identity, send_uuid),
      KEY idx_gestiio_send_payment_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function recordSendCheckout(input: {
  clientIdentity: string;
  uuid: string;
  sessionId: string;
  amountCents: number;
  currency?: string;
}) {
  await ensureSendPaymentsTable();
  await getPool().execute(
    `INSERT INTO gestiio_send_payments
      (client_identity, send_uuid, stripe_session_id, amount_cents, currency, status)
     VALUES (?, ?, ?, ?, ?, 'pending')
     ON DUPLICATE KEY UPDATE
       amount_cents = VALUES(amount_cents),
       currency = VALUES(currency),
       updated_at = CURRENT_TIMESTAMP`,
    [
      input.clientIdentity,
      input.uuid,
      input.sessionId,
      input.amountCents,
      (input.currency || "EUR").toUpperCase(),
    ],
  );
}

export async function markSendCheckoutPaid(input: {
  clientIdentity?: string;
  uuid: string;
  sessionId: string;
  amountCents: number;
  currency?: string;
}) {
  await ensureSendPaymentsTable();
  const params: Array<string | number> = [
    input.amountCents,
    (input.currency || "EUR").toUpperCase(),
    input.uuid,
    input.sessionId,
  ];
  let ownerClause = "";
  if (input.clientIdentity) {
    ownerClause = " AND client_identity = ?";
    params.push(input.clientIdentity);
  }
  await getPool().execute(
    `UPDATE gestiio_send_payments
     SET status = 'paid',
         amount_cents = ?,
         currency = ?,
         paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP
     WHERE send_uuid = ? AND stripe_session_id = ?${ownerClause}`,
    params,
  );
}

export async function hasPaidSendRequest(clientIdentity: string, uuid: string) {
  await ensureSendPaymentsTable();
  const [rows] = await getPool().execute(
    `SELECT id FROM gestiio_send_payments
     WHERE client_identity = ? AND send_uuid = ? AND status = 'paid'
     LIMIT 1`,
    [clientIdentity, uuid],
  );
  return Array.isArray(rows) && rows.length > 0;
}

export async function resolveSendPrice() {
  const payload = await gestiioSendRequest<{
    success?: boolean;
    data?: { prezzo_cliente?: number | string; currency?: string };
  }>("/pricing");
  const euros = Number(payload.data?.prezzo_cliente);
  const amountCents = Math.round(euros * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error("Tariffa SEND non disponibile");
  }
  return {
    amountCents,
    currency: String(payload.data?.currency || "EUR").toUpperCase(),
    label: `${euros.toFixed(2).replace(".", ",")} €`,
  };
}

export async function gestiioSendRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${sendBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "x-api-key": sendApiKey(),
      ...init.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error
        ? String(payload.error.message)
        : `Errore API SEND: HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export async function downloadGestiioSendDocument(downloadUrl: string) {
  const expectedPrefix = `${sendBaseUrl()}/richieste/`;
  if (!downloadUrl.startsWith(expectedPrefix)) {
    throw new Error("URL download SEND non consentito");
  }

  const response = await fetch(downloadUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/octet-stream",
      "x-api-key": sendApiKey(),
    },
  });

  if (!response.ok) {
    throw new Error(`Download documento SEND non riuscito: HTTP ${response.status}`);
  }

  return response;
}
