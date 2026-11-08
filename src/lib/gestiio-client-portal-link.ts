import { getPool } from "@/lib/db";
import { readCustomerSession } from "@/lib/auth/session";

export type GestiioPortalCustomer = {
  clientIdentity: string;
  externalCustomerId: string;
  email: string;
  fullName: string;
  phone: string;
};

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function readLegacyTokenIdentity(token: string) {
  try {
    const [payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      username?: string;
      fullName?: string;
      userId?: number | null;
    };
    const username = String(parsed.username || "").trim().toLowerCase();
    if (!username) return null;
    return {
      clientIdentity: `${parsed.userId || "username"}:${username}`,
      externalCustomerId: String(parsed.userId || username),
      fullName: parsed.fullName ? String(parsed.fullName) : "",
      email: username.includes("@") ? username : "",
      phone: "",
    };
  } catch {
    return null;
  }
}

async function fetchProfileForToken(request: Request, token: string) {
  const response = await fetch(new URL("/api/client-auth/profile", request.url), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    profile?: { fullName?: string; username?: string; email?: string; phone?: string };
  };
  const profile = payload.profile;
  if (!profile?.username) return null;
  const username = String(profile.username).trim().toLowerCase();
  return {
    clientIdentity: `profile:${username}`,
    externalCustomerId: username,
    fullName: String(profile.fullName || "").trim(),
    email: String(profile.email || "").trim().toLowerCase(),
    phone: String(profile.phone || "").trim(),
  };
}

async function validateLegacyToken(request: Request, token: string) {
  const response = await fetch(new URL("/api/client-auth/session", request.url), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) return null;
  const fromToken = readLegacyTokenIdentity(token);
  if (!fromToken) return null;
  const fromProfile = await fetchProfileForToken(request, token);
  if (fromProfile) {
    return {
      ...fromProfile,
      clientIdentity: fromToken.clientIdentity,
      externalCustomerId: fromToken.externalCustomerId,
      fullName: fromProfile.fullName || fromToken.fullName,
      email: fromProfile.email || fromToken.email,
    };
  }
  return fromToken;
}

export async function requireGestiioPortalCustomer(
  request: Request,
): Promise<GestiioPortalCustomer | null> {
  const token = bearerToken(request);
  if (token) {
    return validateLegacyToken(request, token);
  }

  const session = await readCustomerSession();
  if (!session?.username) return null;
  const username = session.username.trim().toLowerCase();
  return {
    clientIdentity: `cookie:${session.userId ?? username}:${username}`,
    externalCustomerId: String(session.userId ?? username),
    fullName: "",
    email: username.includes("@") ? username : "",
    phone: "",
  };
}

export async function ensureGestiioClientPracticesTable() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS gestiio_client_portal_practices (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      client_identity VARCHAR(255) NOT NULL,
      practice_uuid CHAR(36) NOT NULL,
      service_slug VARCHAR(80) NOT NULL,
      service_type VARCHAR(120) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
      local_request_id INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_gestiio_cp_practice_uuid (practice_uuid),
      KEY idx_gestiio_cp_client (client_identity),
      KEY idx_gestiio_cp_service (service_slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function linkGestiioClientPractice(input: {
  clientIdentity: string;
  practiceUuid: string;
  serviceSlug: string;
  serviceType?: string;
  status?: string;
  paymentStatus?: string;
  localRequestId?: number | null;
}) {
  await ensureGestiioClientPracticesTable();
  await getPool().execute(
    `INSERT INTO gestiio_client_portal_practices
      (client_identity, practice_uuid, service_slug, service_type, status, payment_status, local_request_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       service_type = COALESCE(VALUES(service_type), service_type),
       status = VALUES(status),
       payment_status = VALUES(payment_status),
       local_request_id = COALESCE(VALUES(local_request_id), local_request_id),
       updated_at = CURRENT_TIMESTAMP`,
    [
      input.clientIdentity,
      input.practiceUuid,
      input.serviceSlug,
      input.serviceType || null,
      input.status || "draft",
      input.paymentStatus || "unpaid",
      input.localRequestId ?? null,
    ],
  );
}

export async function listLinkedPracticeUuids(clientIdentity: string, serviceSlug?: string) {
  await ensureGestiioClientPracticesTable();
  const params: string[] = [clientIdentity];
  let sql = `SELECT practice_uuid FROM gestiio_client_portal_practices WHERE client_identity = ?`;
  if (serviceSlug) {
    sql += ` AND service_slug = ?`;
    params.push(serviceSlug);
  }
  const [rows] = await getPool().execute(sql, params);
  if (!Array.isArray(rows)) return [] as string[];
  return rows.map((row) => String((row as { practice_uuid: string }).practice_uuid));
}

export async function updateLinkedGestiioPracticeStatus(
  practiceUuid: string,
  status: string,
  paymentStatus?: string,
) {
  await ensureGestiioClientPracticesTable();
  if (paymentStatus) {
    await getPool().execute(
      `UPDATE gestiio_client_portal_practices
       SET status = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE practice_uuid = ?`,
      [status, paymentStatus, practiceUuid],
    );
  } else {
    await getPool().execute(
      `UPDATE gestiio_client_portal_practices
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE practice_uuid = ?`,
      [status, practiceUuid],
    );
  }
}

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureClientAreaRequestsTable() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS client_area_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      area VARCHAR(40) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      notes TEXT DEFAULT '',
      details_json JSON NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_requests_area (area),
      KEY idx_client_area_requests_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function mirrorClientAreaRequest(input: {
  area: string;
  serviceType: string;
  customer: GestiioPortalCustomer;
  gestiioPracticeUuid: string;
  payload?: Record<string, unknown>;
  status?: string;
}) {
  if (!hasDatabaseConfig()) return null;
  await ensureClientAreaRequestsTable();
  const details = {
    gestiio_practice_uuid: input.gestiioPracticeUuid,
    ...(input.payload || {}),
  };
  const [result] = await getPool().execute(
    `INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
    [
      input.area,
      input.serviceType,
      input.customer.fullName || input.customer.clientIdentity,
      input.customer.email || "noreply@agenziaplinio.it",
      input.customer.phone || "",
      "",
      JSON.stringify(details),
      input.status || "new",
    ],
  );
  const header = result as { insertId?: number };
  return typeof header.insertId === "number" ? header.insertId : null;
}

export async function syncClientAreaRequestByGestiioUuid(
  practiceUuid: string,
  status: string,
) {
  if (!hasDatabaseConfig()) return;
  await ensureClientAreaRequestsTable();
  await getPool().execute(
    `UPDATE client_area_requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE JSON_UNQUOTE(JSON_EXTRACT(details_json, '$.gestiio_practice_uuid')) = ?`,
    [status, practiceUuid],
  );
}
