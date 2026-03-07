import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import mysql from "mysql2/promise";
import { DateTime, Interval } from "luxon";
import crypto from "crypto";

const app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
);
const allowedOrigins = [
  "https://agenziaplinio.it",
  "https://www.agenziaplinio.it",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST"],
  }),
);

const config = {
  enabled: process.env.GOOGLE_CALENDAR_ENABLED === "true",
  calendarId: process.env.GOOGLE_CALENDAR_CALENDAR_ID || "",
  timezone: process.env.GOOGLE_CALENDAR_TIMEZONE || "Europe/Rome",
  defaultDuration: Number(process.env.GOOGLE_CALENDAR_DEFAULT_DURATION || 60),
  inviteClient: process.env.GOOGLE_CALENDAR_INVITE_CLIENT === "true",
  sendUpdates: process.env.GOOGLE_CALENDAR_SEND_UPDATES || "none",
};

const OPEN_HOUR = 9;
const MIDDAY_CLOSE_HOUR = 13;
const AFTERNOON_OPEN_HOUR = 16;
const AFTERNOON_OPEN_MINUTE = 20;
const CLOSE_HOUR = 18;
const CLOSE_MINUTE = 30;
const SATURDAY_OPEN_HOUR = 9;
const SATURDAY_OPEN_MINUTE = 20;
const SATURDAY_CLOSE_HOUR = 12;
const SATURDAY_CLOSE_MINUTE = 30;
const payhipWebhookSecret = String(process.env.PAYHIP_WEBHOOK_SECRET || "").trim();
const clientPortalUsername = String(process.env.CLIENT_PORTAL_USERNAME || "").trim();
const clientPortalPassword = String(process.env.CLIENT_PORTAL_PASSWORD || "").trim();
const adminPortalUsername = String(process.env.STORE_ADMIN_USER || "").trim();
const adminPortalPassword = String(process.env.STORE_ADMIN_PASSWORD || "").trim();
const clientPortalSessionSecret = String(
  process.env.CLIENT_PORTAL_SESSION_SECRET || "ag-client-portal-dev-secret",
).trim();
const adminPortalSessionSecret = String(
  process.env.ADMIN_PORTAL_SESSION_SECRET || "ag-admin-portal-dev-secret",
).trim();

let pool = null;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number(process.env.MYSQL_PORT ?? 3306),
      connectionLimit: 10,
    });
  }
  return pool;
}

async function ensurePayhipOrdersTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS payhip_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      external_id VARCHAR(191) NOT NULL,
      event_type VARCHAR(120) DEFAULT '',
      product_title VARCHAR(255) DEFAULT '',
      buyer_email VARCHAR(191) DEFAULT '',
      currency VARCHAR(20) DEFAULT '',
      total_amount DECIMAL(10,2) DEFAULT NULL,
      status VARCHAR(60) DEFAULT '',
      payload_json JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_payhip_external_id (external_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaRequestsTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
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

async function ensureShippingPricingTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shipping_pricing_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      label VARCHAR(191) NOT NULL,
      service_scope VARCHAR(20) NOT NULL DEFAULT 'all',
      country_code VARCHAR(8) NOT NULL DEFAULT '',
      min_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
      max_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
      min_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
      max_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_shipping_pricing_sort (sort_order),
      KEY idx_shipping_pricing_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Backward-compatible migration on existing tables.
  try {
    await pool.execute(
      "ALTER TABLE shipping_pricing_rules ADD COLUMN service_scope VARCHAR(20) NOT NULL DEFAULT 'all' AFTER label",
    );
  } catch (_error) {}
  try {
    await pool.execute(
      "ALTER TABLE shipping_pricing_rules ADD COLUMN country_code VARCHAR(8) NOT NULL DEFAULT '' AFTER service_scope",
    );
  } catch (_error) {}
}

async function ensureVisurePricingTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS visure_pricing_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_type VARCHAR(120) NOT NULL,
      label VARCHAR(191) NOT NULL,
      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_visure_pricing_service (service_type),
      KEY idx_visure_pricing_sort (sort_order),
      KEY idx_visure_pricing_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientPortalUsersTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_portal_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(191) NOT NULL,
      username VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      company_name VARCHAR(191) DEFAULT '',
      password_hash VARCHAR(255) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_portal_users_username (username),
      UNIQUE KEY uq_client_portal_users_email (email),
      KEY idx_client_portal_users_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaShipmentsTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_shipments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      tracking_code VARCHAR(64) NOT NULL DEFAULT '',
      parcel_id VARCHAR(64) NOT NULL DEFAULT '',
      shipment_number_from VARCHAR(32) NOT NULL DEFAULT '',
      shipment_number_to VARCHAR(32) NOT NULL DEFAULT '',
      label_pdf_base64 LONGTEXT NULL,
      brt_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_shipments_tracking (tracking_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaPaymentsTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      shipment_id INT NULL,
      stripe_session_id VARCHAR(191) NOT NULL,
      amount_cents INT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'eur',
      payment_status VARCHAR(40) NOT NULL DEFAULT '',
      checkout_status VARCHAR(40) NOT NULL DEFAULT '',
      price_label VARCHAR(191) NOT NULL DEFAULT '',
      stripe_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_area_payments_session (stripe_session_id),
      KEY idx_client_area_payments_request (request_id),
      KEY idx_client_area_payments_shipment (shipment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaInvoicesTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      payment_id INT NULL,
      shipment_id INT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT 'pending',
      provider_document_id VARCHAR(191) NOT NULL DEFAULT '',
      status VARCHAR(60) NOT NULL DEFAULT 'pending_provider_config',
      invoice_pdf_url TEXT NULL,
      billing_json JSON NULL,
      provider_payload_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_invoices_request (request_id),
      KEY idx_client_area_invoices_payment (payment_id),
      KEY idx_client_area_invoices_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaVisureRequestsTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_visure_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT '',
      provider_service VARCHAR(191) NOT NULL DEFAULT '',
      provider_request_id VARCHAR(191) NOT NULL DEFAULT '',
      provider_status VARCHAR(80) NOT NULL DEFAULT '',
      document_url TEXT NULL,
      provider_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_visure_requests_request (request_id),
      KEY idx_client_area_visure_requests_provider_status (provider_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function toObject(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function normalizePayhipPayload(body) {
  const payload = body?.payload
    ? toObject(body.payload)
    : body && typeof body === "object"
      ? body
      : {};
  const data = toObject(payload?.data);
  const sale = toObject(payload?.sale);
  const order = toObject(payload?.order);
  const customer = toObject(payload?.customer);
  const buyer = toObject(payload?.buyer);
  const product = toObject(payload?.product);

  const externalId = String(
    payload?.id ||
      payload?.sale_id ||
      payload?.order_id ||
      data?.id ||
      sale?.id ||
      order?.id ||
      payload?.transaction_id ||
      payload?.txid ||
      payload?.reference ||
      "",
  ).trim();

  const eventType = String(
    payload?.event || payload?.event_type || body?.event || body?.type || "sale.created",
  ).trim();

  const productTitle = String(
    product?.title || payload?.product_name || payload?.product || data?.product_name || "",
  ).trim();

  const buyerEmail = String(
    customer?.email || buyer?.email || payload?.email || data?.email || "",
  ).trim();

  const status = String(
    payload?.status || sale?.status || order?.status || data?.status || "paid",
  ).trim();

  const currency = String(
    payload?.currency || sale?.currency || order?.currency || data?.currency || "",
  ).trim();

  const rawAmount =
    payload?.price ||
    payload?.amount ||
    payload?.total ||
    sale?.price ||
    sale?.amount ||
    order?.total ||
    data?.price ||
    data?.amount ||
    "";
  const amount = Number(rawAmount);
  const totalAmount = Number.isFinite(amount) ? Number(amount.toFixed(2)) : null;

  return {
    externalId,
    eventType,
    productTitle,
    buyerEmail,
    currency,
    totalAmount,
    status,
    payload,
  };
}

function isWebhookAuthorized(req) {
  if (!payhipWebhookSecret) return true;

  const headerSecret = String(
    req.get("x-payhip-secret") || req.get("payhip-secret") || "",
  ).trim();
  if (headerSecret && headerSecret === payhipWebhookSecret) return true;

  const querySecret = String(req.query?.secret || "").trim();
  if (querySecret && querySecret === payhipWebhookSecret) return true;

  const bodySecret = String(req.body?.secret || req.body?.webhook_secret || "").trim();
  if (bodySecret && bodySecret === payhipWebhookSecret) return true;

  return false;
}

function createClientPortalToken({
  username = clientPortalUsername,
  userId = null,
  source = "env",
} = {}) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      userId,
      source,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    }),
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", clientPortalSessionSecret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function createAdminPortalToken() {
  const payload = Buffer.from(
    JSON.stringify({
      username: adminPortalUsername,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    }),
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", adminPortalSessionSecret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

function verifyClientPortalToken(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", clientPortalSessionSecret)
    .update(payload)
    .digest("base64url");

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.exp || Number(parsed.exp) < Date.now()) return null;
    if (!parsed?.username) return null;
    if (parsed?.source === "env" && clientPortalUsername && parsed?.username !== clientPortalUsername) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function hashClientPortalPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyClientPortalPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;

  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  const actual = Buffer.from(hash, "hex");
  const expected = Buffer.from(computed, "hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

async function getClientPortalUserBySession(session) {
  if (!session || session.source !== "db" || !process.env.MYSQL_HOST) {
    return null;
  }

  await ensureClientPortalUsersTable();
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
    const user = Array.isArray(rows) ? rows[0] : null;
    if (user) return user;
  }

  const identifier = String(session.username || "").toLowerCase();
  const [rows] = await pool.query(
    `SELECT id, full_name, username, email, phone, company_name, status
     FROM client_portal_users
     WHERE LOWER(username) = ? OR LOWER(email) = ?
     LIMIT 1`,
    [identifier, identifier],
  );

  return Array.isArray(rows) ? rows[0] : null;
}

function verifyAdminPortalToken(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", adminPortalSessionSecret)
    .update(payload)
    .digest("base64url");

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.exp || Number(parsed.exp) < Date.now()) return null;
    if (parsed?.username !== adminPortalUsername) return null;
    return parsed;
  } catch {
    return null;
  }
}

function decodeCredentials() {
  const encoded = process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON;
  if (!encoded) return null;
  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function getCalendarClient() {
  const credentials = decodeCredentials();
  if (!credentials) throw new Error("Credenziali Google Calendar non valide");

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

function getBookingErrorMessage(error, fallbackMessage) {
  const googleMessage =
    error?.response?.data?.error?.message ||
    error?.errors?.[0]?.message ||
    error?.message;

  if (typeof googleMessage === "string" && googleMessage.trim()) {
    return googleMessage;
  }

  return fallbackMessage;
}

function isBookingAttendeesPermissionError(error) {
  const message = String(getBookingErrorMessage(error, "")).toLowerCase();
  if (!message) return false;
  return (
    message.includes("service accounts cannot invite attendees") ||
    message.includes("domain-wide delegation")
  );
}

function buildSlots(dateISO) {
  const date = DateTime.fromISO(dateISO, { zone: config.timezone });
  if (!date.isValid) return [];

  if (date.weekday === 7) {
    return [];
  }

  const slots = [];
  const pushRange = (startHour, startMinute, endHour, endMinute) => {
    let cursor = date.set({
      hour: startHour,
      minute: startMinute,
      second: 0,
      millisecond: 0,
    });
    const endOfRange = date.set({
      hour: endHour,
      minute: endMinute,
      second: 0,
      millisecond: 0,
    });

    while (cursor.plus({ minutes: config.defaultDuration }) <= endOfRange) {
      const end = cursor.plus({ minutes: config.defaultDuration });
      slots.push({
        start: cursor.toISO(),
        end: end.toISO(),
        label: cursor.toFormat("HH:mm"),
      });
      cursor = cursor.plus({ minutes: config.defaultDuration });
    }
  };

  if (date.weekday === 6) {
    pushRange(
      SATURDAY_OPEN_HOUR,
      SATURDAY_OPEN_MINUTE,
      SATURDAY_CLOSE_HOUR,
      SATURDAY_CLOSE_MINUTE,
    );
  } else {
    pushRange(OPEN_HOUR, 0, MIDDAY_CLOSE_HOUR, 0);
    pushRange(AFTERNOON_OPEN_HOUR, AFTERNOON_OPEN_MINUTE, CLOSE_HOUR, CLOSE_MINUTE);
  }

  return slots;
}

function excludeBusy(slots, busy) {
  if (!busy.length) return slots;

  const busyIntervals = busy
    .map((item) => {
      const start = DateTime.fromISO(item.start);
      const end = DateTime.fromISO(item.end);
      if (!start.isValid || !end.isValid) return null;
      return Interval.fromDateTimes(start, end);
    })
    .filter(Boolean);

  return slots.filter((slot) => {
    const slotInterval = Interval.fromDateTimes(
      DateTime.fromISO(slot.start),
      DateTime.fromISO(slot.end),
    );
    return !busyIntervals.some((interval) => interval.overlaps(slotInterval));
  });
}

app.get("/api/booking/health", (_req, res) => {
  res.json({
    ok: config.enabled && config.calendarId && Boolean(process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON),
    checks: {
      enabled: config.enabled,
      calendarId: Boolean(config.calendarId),
      credentials: Boolean(process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON),
      timezone: Boolean(config.timezone),
      duration: Boolean(config.defaultDuration),
      invite: Boolean(config.inviteClient),
      updates: Boolean(config.sendUpdates),
    },
  });
});

app.get("/api/payhip/health", (_req, res) => {
  res.json({
    ok: Boolean(process.env.MYSQL_HOST),
    checks: {
      webhookSecret: Boolean(payhipWebhookSecret),
      database: Boolean(process.env.MYSQL_HOST),
    },
  });
});

app.post("/api/client-auth/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Inserisci nome utente e password" });
  }

  try {
    if (process.env.MYSQL_HOST) {
      await ensureClientPortalUsersTable();
      const pool = getPool();
      const identifier = username.toLowerCase();
      const [rows] = await pool.query(
        `SELECT id, username, email, password_hash, status
         FROM client_portal_users
         WHERE LOWER(username) = ? OR LOWER(email) = ?
         LIMIT 1`,
        [identifier, identifier],
      );

      const user = Array.isArray(rows) ? rows[0] : null;
      if (user && String(user.status || "active") === "active") {
        const passwordValid = verifyClientPortalPassword(password, user.password_hash);
        if (!passwordValid) {
          return res.status(401).json({ message: "Credenziali non valide" });
        }

        return res.json({
          ok: true,
          token: createClientPortalToken({
            username: String(user.username || user.email || username),
            userId: Number(user.id || 0) || null,
            source: "db",
          }),
          user: {
            username: String(user.username || user.email || username),
            role: "client",
            source: "database",
          },
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Errore durante il controllo credenziali",
    });
  }

  if (!clientPortalUsername || !clientPortalPassword) {
    return res.status(401).json({ message: "Credenziali non valide" });
  }

  if (username !== clientPortalUsername || password !== clientPortalPassword) {
    return res.status(401).json({ message: "Credenziali non valide" });
  }

  return res.json({
    ok: true,
    token: createClientPortalToken({
      username: clientPortalUsername,
      source: "env",
    }),
    user: {
      username: clientPortalUsername,
      role: "client",
      source: "env",
    },
  });
});

app.post("/api/client-auth/session", (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!token) {
    return res.status(400).json({ message: "Token mancante" });
  }

  const session = verifyClientPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione non valida" });
  }

  return res.json({
    ok: true,
    authenticated: true,
    user: {
      username: session.username,
      role: "client",
    },
  });
});

app.post("/api/client-auth/profile", async (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!token) {
    return res.status(400).json({ message: "Token mancante" });
  }

  const session = verifyClientPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione non valida" });
  }

  if (session.source === "env") {
    return res.json({
      ok: true,
      editable: false,
      profile: {
        fullName: "Accesso di fallback",
        username: session.username,
        email: "",
        phone: "",
        companyName: "",
        source: "env",
      },
    });
  }

  try {
    const user = await getClientPortalUserBySession(session);
    if (!user || String(user.status || "active") !== "active") {
      return res.status(404).json({ message: "Profilo cliente non trovato" });
    }

    return res.json({
      ok: true,
      editable: true,
      profile: {
        fullName: String(user.full_name || ""),
        username: String(user.username || ""),
        email: String(user.email || ""),
        phone: String(user.phone || ""),
        companyName: String(user.company_name || ""),
        source: "db",
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento profilo",
    });
  }
});

app.post("/api/client-auth/profile-update", async (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!token) {
    return res.status(400).json({ message: "Token mancante" });
  }

  const session = verifyClientPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione non valida" });
  }

  if (session.source === "env") {
    return res.status(403).json({ message: "Il profilo di fallback non puo essere modificato" });
  }

  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const phone = String(req.body?.phone || "").trim();
  const companyName = String(req.body?.companyName || "").trim();
  const currentPassword = String(req.body?.currentPassword || "").trim();
  const nextPassword = String(req.body?.newPassword || "").trim();

  if (!fullName || !email) {
    return res.status(400).json({ message: "Nome completo ed email sono obbligatori" });
  }

  try {
    await ensureClientPortalUsersTable();
    const pool = getPool();
    const user = await getClientPortalUserBySession(session);
    if (!user || String(user.status || "active") !== "active") {
      return res.status(404).json({ message: "Profilo cliente non trovato" });
    }

    const currentUserId = Number(user.id || 0);
    const [existingRows] = await pool.query(
      `SELECT id FROM client_portal_users WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND id <> ? LIMIT 1`,
      [email, email, currentUserId],
    );

    if (Array.isArray(existingRows) && existingRows[0]) {
      return res.status(409).json({ message: "Esiste gia un altro profilo con questa email" });
    }

    let passwordHashSql = "";
    let passwordArgs = [];

    if (nextPassword) {
      const [passwordRows] = await pool.query(
        `SELECT password_hash FROM client_portal_users WHERE id = ? LIMIT 1`,
        [currentUserId],
      );
      const passwordRow = Array.isArray(passwordRows) ? passwordRows[0] : null;
      if (!passwordRow || !verifyClientPortalPassword(currentPassword, passwordRow.password_hash)) {
        return res.status(401).json({ message: "La password attuale non e corretta" });
      }

      if (nextPassword.length < 8) {
        return res.status(400).json({ message: "La nuova password deve avere almeno 8 caratteri" });
      }

      passwordHashSql = ", password_hash = ?";
      passwordArgs = [hashClientPortalPassword(nextPassword)];
    }

    await pool.execute(
      `UPDATE client_portal_users
       SET full_name = ?, username = ?, email = ?, phone = ?, company_name = ?${passwordHashSql}
       WHERE id = ?`,
      [fullName, email, email, phone, companyName, ...passwordArgs, currentUserId],
    );

    const nextToken = createClientPortalToken({
      username: email,
      userId: currentUserId,
      source: "db",
    });

    return res.json({
      ok: true,
      token: nextToken,
      message: "Profilo aggiornato correttamente",
      profile: {
        fullName,
        username: email,
        email,
        phone,
        companyName,
        source: "db",
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore aggiornamento profilo",
    });
  }
});

app.post("/api/client-auth/register", async (req, res) => {
  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const phone = String(req.body?.phone || "").trim();
  const companyName = String(req.body?.companyName || "").trim();
  const password = String(req.body?.password || "").trim();

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Nome completo, email e password sono obbligatori" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "La password deve avere almeno 8 caratteri" });
  }

  try {
    await ensureClientPortalUsersTable();
    const pool = getPool();
    const username = email;
    const [existingRows] = await pool.query(
      `SELECT id FROM client_portal_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1`,
      [email, username],
    );

    if (Array.isArray(existingRows) && existingRows[0]) {
      return res.status(409).json({ message: "Esiste già un accesso registrato con questa email" });
    }

    const passwordHash = hashClientPortalPassword(password);
    await pool.execute(
      `INSERT INTO client_portal_users
        (full_name, username, email, phone, company_name, password_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [fullName, username, email, phone, companyName, passwordHash],
    );

    return res.json({
      ok: true,
      message: "Registrazione completata. Ora puoi accedere con email e password.",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Registrazione area clienti non riuscita",
    });
  }
});

app.post("/api/admin-auth/login", (req, res) => {
  if (!adminPortalUsername || !adminPortalPassword) {
    return res.status(503).json({ message: "Credenziali area admin non configurate" });
  }

  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();

  if (!username || !password) {
    return res.status(400).json({ message: "Inserisci nome utente e password" });
  }

  if (username !== adminPortalUsername || password !== adminPortalPassword) {
    return res.status(401).json({ message: "Credenziali non valide" });
  }

  return res.json({
    ok: true,
    token: createAdminPortalToken(),
    user: {
      username: adminPortalUsername,
      role: "admin",
    },
  });
});

app.post("/api/admin-auth/session", (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!token) {
    return res.status(400).json({ message: "Token mancante" });
  }

  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione non valida" });
  }

  return res.json({
    ok: true,
    authenticated: true,
    user: {
      username: session.username,
      role: "admin",
    },
  });
});

app.get("/api/admin/client-area/requests", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.query?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaShipmentsTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         r.id,
         r.area,
         r.service_type,
         r.customer_name,
         r.email,
         r.phone,
         r.notes,
         r.details_json,
         r.status,
         r.created_at,
         r.updated_at,
         s.tracking_code,
         s.parcel_id,
         s.brt_response_json
       FROM client_area_requests r
       LEFT JOIN client_area_shipments s ON s.request_id = r.id
       ORDER BY r.created_at DESC
       LIMIT 100`,
    );

    const requests = Array.isArray(rows)
      ? rows.map((row) => {
          let details = {};
          let brtResponse = {};
          try {
            details = row.details_json ? JSON.parse(row.details_json) : {};
          } catch {
            details = {};
          }

          try {
            brtResponse = row.brt_response_json ? JSON.parse(row.brt_response_json) : {};
          } catch {
            brtResponse = {};
          }

          const manifest =
            brtResponse && typeof brtResponse === "object" && brtResponse.manifest
              ? brtResponse.manifest
              : {};

          return {
            id: row.id,
            area: row.area,
            serviceType: row.service_type,
            customerName: row.customer_name,
            email: row.email,
            phone: row.phone,
            notes: row.notes,
            details,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            trackingCode: row.tracking_code || "",
            parcelId: row.parcel_id || "",
            manifestCreated: Boolean(manifest?.created),
            manifestMessage: String(manifest?.message || ""),
          };
        })
      : [];

    return res.json({ ok: true, requests });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento richieste",
    });
  }
});

app.post("/api/admin/client-area/requests/status", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.body?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const id = Number(req.body?.id);
  const status = String(req.body?.status || "").trim();
  const allowedStatuses = [
    "new",
    "processing",
    "submitted_to_brt",
    "confirmed_by_brt",
    "completed",
    "cancelled",
  ];

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "ID richiesta non valido" });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Stato non valido" });
  }

  try {
    await ensureClientAreaRequestsTable();
    const pool = getPool();
    await pool.execute(
      `UPDATE client_area_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id],
    );

    return res.json({ ok: true, message: "Stato aggiornato" });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore aggiornamento stato",
    });
  }
});

app.get("/api/public/shipping-pricing", async (_req, res) => {
  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureShippingPricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, label, service_scope, country_code, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active
       FROM shipping_pricing_rules
       WHERE active = 1
       ORDER BY service_scope ASC, country_code ASC, sort_order ASC, id ASC`,
    );

    const rules = Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          label: row.label,
          serviceScope: String(row.service_scope || "all"),
          countryCode: String(row.country_code || "").toUpperCase(),
          minWeightKG: Number(row.min_weight_kg || 0),
          maxWeightKG: Number(row.max_weight_kg || 0),
          minVolumeM3: Number(row.min_volume_m3 || 0),
          maxVolumeM3: Number(row.max_volume_m3 || 0),
          priceEUR: Number(row.price_eur || 0),
          sortOrder: Number(row.sort_order || 0),
          active: Boolean(row.active),
        }))
      : [];

    return res.json({ ok: true, rules });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento prezzi spedizioni",
    });
  }
});

app.get("/api/public/visure-pricing", async (_req, res) => {
  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, service_type, label, price_eur, sort_order, active
       FROM visure_pricing_rules
       WHERE active = 1
       ORDER BY sort_order ASC, id ASC`,
    );

    const rules = Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          serviceType: row.service_type,
          label: row.label,
          priceEUR: Number(row.price_eur || 0),
          sortOrder: Number(row.sort_order || 0),
          active: Boolean(row.active),
        }))
      : [];

    return res.json({ ok: true, rules });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento prezzi visure",
    });
  }
});

app.get("/api/admin/shipping-pricing", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.query?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureShippingPricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, label, service_scope, country_code, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active
       FROM shipping_pricing_rules
       ORDER BY service_scope ASC, country_code ASC, sort_order ASC, id ASC`,
    );

    const rules = Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          label: row.label,
          serviceScope: String(row.service_scope || "all"),
          countryCode: String(row.country_code || "").toUpperCase(),
          minWeightKG: Number(row.min_weight_kg || 0),
          maxWeightKG: Number(row.max_weight_kg || 0),
          minVolumeM3: Number(row.min_volume_m3 || 0),
          maxVolumeM3: Number(row.max_volume_m3 || 0),
          priceEUR: Number(row.price_eur || 0),
          sortOrder: Number(row.sort_order || 0),
          active: Boolean(row.active),
        }))
      : [];

    return res.json({ ok: true, rules });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento prezzi spedizioni",
    });
  }
});

app.get("/api/admin/visure-pricing", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.query?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, service_type, label, price_eur, sort_order, active
       FROM visure_pricing_rules
       ORDER BY sort_order ASC, id ASC`,
    );

    const rules = Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          serviceType: row.service_type,
          label: row.label,
          priceEUR: Number(row.price_eur || 0),
          sortOrder: Number(row.sort_order || 0),
          active: Boolean(row.active),
        }))
      : [];

    return res.json({ ok: true, rules });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento prezzi visure",
    });
  }
});

app.post("/api/admin/shipping-pricing/upsert", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.body?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const id = Number(req.body?.id || 0);
  const label = String(req.body?.label || "").trim();
  const serviceScope = String(req.body?.serviceScope || "all").trim().toLowerCase();
  let countryCode = String(req.body?.countryCode || "").trim().toUpperCase();
  const minWeightKG = Number(req.body?.minWeightKG || 0);
  const maxWeightKG = Number(req.body?.maxWeightKG || 0);
  const minVolumeM3 = Number(req.body?.minVolumeM3 || 0);
  const maxVolumeM3 = Number(req.body?.maxVolumeM3 || 0);
  const priceEUR = Number(req.body?.priceEUR || 0);
  const sortOrder = Number(req.body?.sortOrder || 0);
  const active = Boolean(req.body?.active);

  if (!label) {
    return res.status(400).json({ message: "Etichetta regola obbligatoria" });
  }

  if (!["all", "national", "international"].includes(serviceScope)) {
    return res.status(400).json({ message: "Ambito regola non valido" });
  }
  if (serviceScope === "national") {
    countryCode = "IT";
  }
  if (serviceScope === "international" && !countryCode) {
    countryCode = "ALL";
  }
  if (countryCode && countryCode !== "ALL" && !/^[A-Z]{2}$/.test(countryCode)) {
    return res.status(400).json({ message: "Codice nazione non valido (usa IT, FR, DE... o ALL)" });
  }

  if (
    !Number.isFinite(minWeightKG) ||
    !Number.isFinite(maxWeightKG) ||
    !Number.isFinite(minVolumeM3) ||
    !Number.isFinite(maxVolumeM3) ||
    !Number.isFinite(priceEUR) ||
    !Number.isFinite(sortOrder)
  ) {
    return res.status(400).json({ message: "Valori numerici non validi" });
  }

  try {
    await ensureShippingPricingTable();
    const pool = getPool();
    let savedId = id;

    if (id > 0) {
      await pool.execute(
        `UPDATE shipping_pricing_rules
         SET label = ?, service_scope = ?, country_code = ?, min_weight_kg = ?, max_weight_kg = ?, min_volume_m3 = ?, max_volume_m3 = ?, price_eur = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          label,
          serviceScope,
          countryCode,
          minWeightKG,
          maxWeightKG,
          minVolumeM3,
          maxVolumeM3,
          priceEUR,
          sortOrder,
          active ? 1 : 0,
          id,
        ],
      );
    } else {
      const [insertResult] = await pool.execute(
        `INSERT INTO shipping_pricing_rules
          (label, service_scope, country_code, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          label,
          serviceScope,
          countryCode,
          minWeightKG,
          maxWeightKG,
          minVolumeM3,
          maxVolumeM3,
          priceEUR,
          sortOrder,
          active ? 1 : 0,
        ],
      );
      savedId = Number(insertResult?.insertId || 0);
    }
    let savedRule = { id: savedId, serviceScope, countryCode };
    if (savedId > 0) {
      const [verifyRows] = await pool.query(
        "SELECT id, service_scope, country_code FROM shipping_pricing_rules WHERE id = ? LIMIT 1",
        [savedId],
      );
      const row = Array.isArray(verifyRows) && verifyRows[0] ? verifyRows[0] : null;
      if (row) {
        savedRule = {
          id: Number(row.id || savedId),
          serviceScope: String(row.service_scope || serviceScope),
          countryCode: String(row.country_code || countryCode).toUpperCase(),
        };
      }
    }

    return res.json({ ok: true, message: "Regola prezzo salvata", savedRule });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore salvataggio regola",
    });
  }
});

app.post("/api/admin/shipping-pricing/delete", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.body?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const id = Number(req.body?.id || 0);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "ID regola non valido" });
  }

  try {
    await ensureShippingPricingTable();
    const pool = getPool();
    await pool.execute(`DELETE FROM shipping_pricing_rules WHERE id = ?`, [id]);
    return res.json({ ok: true, message: "Regola rimossa" });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore rimozione regola",
    });
  }
});

app.post("/api/admin/visure-pricing/upsert", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.body?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const id = Number(req.body?.id || 0);
  const serviceType = String(req.body?.serviceType || "").trim();
  const label = String(req.body?.label || "").trim();
  const priceEUR = Number(req.body?.priceEUR || 0);
  const sortOrder = Number(req.body?.sortOrder || 0);
  const active = Boolean(req.body?.active);
  const allowedServiceTypes = [
    "visura-camerale",
    "visura-catastale",
    "visura-pra",
    "visura-crif",
    "visura-cr",
  ];

  if (!allowedServiceTypes.includes(serviceType)) {
    return res.status(400).json({ message: "Tipologia visura non valida" });
  }

  if (!label) {
    return res.status(400).json({ message: "Etichetta regola obbligatoria" });
  }

  if (!Number.isFinite(priceEUR) || !Number.isFinite(sortOrder)) {
    return res.status(400).json({ message: "Valori numerici non validi" });
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();

    if (id > 0) {
      await pool.execute(
        `UPDATE visure_pricing_rules
         SET service_type = ?, label = ?, price_eur = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [serviceType, label, priceEUR, sortOrder, active ? 1 : 0, id],
      );
    } else {
      await pool.execute(
        `INSERT INTO visure_pricing_rules
          (service_type, label, price_eur, sort_order, active)
         VALUES (?, ?, ?, ?, ?)`,
        [serviceType, label, priceEUR, sortOrder, active ? 1 : 0],
      );
    }

    return res.json({ ok: true, message: "Regola prezzo visura salvata" });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore salvataggio regola visura",
    });
  }
});

app.post("/api/admin/visure-pricing/delete", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.body?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  const id = Number(req.body?.id || 0);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "ID regola non valido" });
  }

  try {
    await ensureVisurePricingTable();
    const pool = getPool();
    await pool.execute(`DELETE FROM visure_pricing_rules WHERE id = ?`, [id]);
    return res.json({ ok: true, message: "Regola visura rimossa" });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore rimozione regola visura",
    });
  }
});

app.get("/api/admin/client-area/payments", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.query?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureClientAreaPaymentsTable();
    await ensureClientAreaInvoicesTable();
    await ensureClientAreaRequestsTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.request_id,
         p.shipment_id,
         p.stripe_session_id,
         p.amount_cents,
         p.currency,
         p.payment_status,
         p.checkout_status,
         p.price_label,
         p.created_at,
         r.customer_name,
         r.email,
         r.service_type,
         r.status AS request_status,
         i.status AS invoice_status,
         i.provider,
         i.provider_document_id,
         i.invoice_pdf_url
       FROM client_area_payments p
       LEFT JOIN client_area_requests r ON r.id = p.request_id
       LEFT JOIN client_area_invoices i ON i.payment_id = p.id OR i.request_id = p.request_id
       ORDER BY p.created_at DESC
       LIMIT 100`,
    );

    const payments = Array.isArray(rows)
      ? rows.map((row) => ({
          id: row.id,
          requestId: Number(row.request_id || 0),
          shipmentId: Number(row.shipment_id || 0),
          stripeSessionId: row.stripe_session_id,
          amountCents: Number(row.amount_cents || 0),
          currency: String(row.currency || "eur"),
          paymentStatus: String(row.payment_status || ""),
          checkoutStatus: String(row.checkout_status || ""),
          priceLabel: String(row.price_label || ""),
          createdAt: row.created_at,
          customerName: String(row.customer_name || ""),
          email: String(row.email || ""),
          serviceType: String(row.service_type || ""),
          requestStatus: String(row.request_status || ""),
          invoiceStatus: String(row.invoice_status || ""),
          invoiceProvider: String(row.provider || ""),
          invoiceDocumentId: String(row.provider_document_id || ""),
          invoicePdfUrl: String(row.invoice_pdf_url || ""),
        }))
      : [];

    return res.json({ ok: true, payments });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento pagamenti",
    });
  }
});

app.get("/api/admin/client-area/visure", async (req, res) => {
  const token = String(req.get("x-admin-token") || req.query?.token || "").trim();
  const session = verifyAdminPortalToken(token);
  if (!session) {
    return res.status(401).json({ message: "Sessione admin non valida" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaVisureRequestsTable();
    await ensureClientAreaPaymentsTable();
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT
         r.id,
         r.customer_name,
         r.email,
         r.service_type,
         r.status,
         r.details_json,
         r.created_at,
         r.updated_at,
         v.provider,
         v.provider_service,
         v.provider_request_id,
         v.provider_status,
         v.document_url,
         p.amount_cents,
         p.currency,
         p.price_label,
         p.payment_status
       FROM client_area_requests r
       LEFT JOIN client_area_visure_requests v ON v.request_id = r.id
       LEFT JOIN client_area_payments p ON p.request_id = r.id
       WHERE r.area = 'visure'
       ORDER BY r.created_at DESC
       LIMIT 100`,
    );

    const visure = Array.isArray(rows)
      ? rows.map((row) => {
          let details = {};
          try {
            details = row.details_json ? JSON.parse(row.details_json) : {};
          } catch {
            details = {};
          }

          return {
            id: row.id,
            customerName: row.customer_name,
            email: row.email,
            serviceType: row.service_type,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            provider: row.provider || "",
            providerService: row.provider_service || "",
            providerRequestId: row.provider_request_id || "",
            providerStatus: row.provider_status || "",
            documentUrl: row.document_url || "",
            paymentAmountCents: Number(row.amount_cents || 0),
            paymentCurrency: row.currency || "eur",
            priceLabel: row.price_label || "",
            paymentStatus: row.payment_status || "",
            summary:
              details && typeof details === "object" && details.providerSummary
                ? details.providerSummary
                : {},
          };
        })
      : [];

    return res.json({ ok: true, visure });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Errore caricamento visure",
    });
  }
});

app.get("/api/booking/availability", async (req, res) => {
  if (!config.enabled || !config.calendarId) {
    return res.status(503).json({ message: "Google Calendar non configurato" });
  }

  const date = String(req.query.date || "").trim();
  if (!date) return res.status(400).json({ message: "Data non valida" });

  const day = DateTime.fromISO(date, { zone: config.timezone });
  if (!day.isValid) return res.status(400).json({ message: "Data non valida" });

  const timeMin = day.startOf("day").toISO();
  const timeMax = day.endOf("day").toISO();

  try {
    const calendar = await getCalendarClient();
    const response = await calendar.events.list({
      calendarId: config.calendarId,
      timeMin: timeMin ?? undefined,
      timeMax: timeMax ?? undefined,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items ?? []).map((event) => {
      if (event.start?.dateTime && event.end?.dateTime) {
        return { start: event.start.dateTime, end: event.end.dateTime };
      }
      if (event.start?.date && event.end?.date) {
        return {
          start: day.startOf("day").toISO(),
          end: day.endOf("day").toISO(),
        };
      }
      return { start: null, end: null };
    });

    const slots = buildSlots(date);
    const busy = events.filter((item) => item.start && item.end);
    const available = excludeBusy(slots, busy);

    return res.json({
      date,
      timezone: config.timezone,
      duration: config.defaultDuration,
      slots: available,
    });
  } catch (error) {
    const message = getBookingErrorMessage(error, "Errore nel recupero disponibilità");
    console.error("Booking availability error:", message);
    return res.status(500).json({ message });
  }
});

app.post("/api/booking", async (req, res) => {
  if (!config.enabled || !config.calendarId) {
    return res.status(503).json({ message: "Google Calendar non configurato" });
  }

  const { service, date, time, name, email, phone, notes } = req.body || {};
  if (!service || !date || !time || !name || !email || !phone) {
    return res.status(400).json({ message: "Compila tutti i campi obbligatori." });
  }

  const start = DateTime.fromISO(`${date}T${time}`, { zone: config.timezone });
  if (!start.isValid) {
    return res.status(400).json({ message: "Data o ora non valide." });
  }

  if (start < DateTime.now().setZone(config.timezone).minus({ minutes: 5 })) {
    return res.status(400).json({ message: "Seleziona una data futura." });
  }

  const end = start.plus({ minutes: config.defaultDuration });

  const allowedSlots = buildSlots(date);
  const requestedStartMillis = start.toMillis();
  const isWithinBusinessHours = allowedSlots.some((slot) => {
    const slotStart = DateTime.fromISO(slot.start);
    return slotStart.isValid && slotStart.toMillis() === requestedStartMillis;
  });

  if (!isWithinBusinessHours) {
    return res.status(400).json({ message: "Questo orario non rientra nelle fasce prenotabili." });
  }

  try {
    const calendar = await getCalendarClient();
    const eventsResponse = await calendar.events.list({
      calendarId: config.calendarId,
      timeMin: start.startOf("day").toISO() ?? undefined,
      timeMax: start.endOf("day").toISO() ?? undefined,
      singleEvents: true,
      orderBy: "startTime",
    });

    const busyIntervals = (eventsResponse.data.items ?? [])
      .map((event) => {
        if (event.start?.dateTime && event.end?.dateTime) {
          return Interval.fromDateTimes(
            DateTime.fromISO(event.start.dateTime),
            DateTime.fromISO(event.end.dateTime),
          );
        }
        if (event.start?.date && event.end?.date) {
          return Interval.fromDateTimes(start.startOf("day"), start.endOf("day"));
        }
        return null;
      })
      .filter(Boolean);

    const requestedInterval = Interval.fromDateTimes(start, end);
    const isBusy = busyIntervals.some((interval) => interval.overlaps(requestedInterval));
    if (isBusy) return res.status(409).json({ message: "Slot non disponibile." });

    const descriptionLines = [
      `Nome: ${name}`,
      `Email: ${email}`,
      `Telefono: ${phone}`,
      notes ? "" : null,
      notes ? `Note: ${notes}` : null,
    ].filter(Boolean);

    const requestBody = {
      summary: `Appuntamento ${service} - ${name}`,
      description: descriptionLines.join("\n"),
      start: { dateTime: start.toISO(), timeZone: config.timezone },
      end: { dateTime: end.toISO(), timeZone: config.timezone },
      attendees: config.inviteClient ? [{ email, displayName: name }] : undefined,
    };

    let event;
    try {
      event = await calendar.events.insert({
        calendarId: config.calendarId,
        sendUpdates: config.sendUpdates,
        requestBody,
      });
    } catch (insertError) {
      if (requestBody.attendees && isBookingAttendeesPermissionError(insertError)) {
        delete requestBody.attendees;
        event = await calendar.events.insert({
          calendarId: config.calendarId,
          sendUpdates: "none",
          requestBody,
        });
      } else {
        throw insertError;
      }
    }

    const eventId = event.data.id ?? null;

    if (process.env.MYSQL_HOST) {
      try {
        const pool = getPool();
        await pool.execute(
          "INSERT INTO booking_requests (google_event_id, name, email, phone, service, start_at, end_at, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [eventId, name, email, phone, service, start.toISO(), end.toISO(), notes || "", "confirmed"],
        );
      } catch {
        // ignore db errors
      }
    }

    return res.json({
      message: "Prenotazione confermata",
      eventId,
      start: start.toISO(),
      end: end.toISO(),
    });
  } catch (error) {
    const message = getBookingErrorMessage(error, "Errore nella creazione appuntamento");
    console.error("Booking create error:", message);
    return res.status(500).json({ message });
  }
});

app.post("/api/payhip/webhook", async (req, res) => {
  if (!isWebhookAuthorized(req)) {
    return res.status(401).json({ message: "Webhook Payhip non autorizzato" });
  }

  const normalized = normalizePayhipPayload(req.body || {});
  if (!normalized.externalId) {
    return res.status(400).json({ message: "Payload Payhip non valido: id mancante" });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(202).json({
      ok: true,
      saved: false,
      externalId: normalized.externalId,
      message: "Webhook ricevuto, database non configurato",
    });
  }

  try {
    await ensurePayhipOrdersTable();
    const pool = getPool();
    await pool.execute(
      `INSERT INTO payhip_orders
        (external_id, event_type, product_title, buyer_email, currency, total_amount, status, payload_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        event_type = VALUES(event_type),
        product_title = VALUES(product_title),
        buyer_email = VALUES(buyer_email),
        currency = VALUES(currency),
        total_amount = VALUES(total_amount),
        status = VALUES(status),
        payload_json = VALUES(payload_json),
        updated_at = NOW()`,
      [
        normalized.externalId,
        normalized.eventType,
        normalized.productTitle,
        normalized.buyerEmail,
        normalized.currency,
        normalized.totalAmount,
        normalized.status,
        JSON.stringify(normalized.payload),
      ],
    );

    return res.json({
      ok: true,
      saved: true,
      externalId: normalized.externalId,
      eventType: normalized.eventType,
    });
  } catch {
    return res.status(500).json({ message: "Errore salvataggio webhook Payhip" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Booking backend listening on port ${port}`);
});
