import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import mysql from "mysql2/promise";
import { DateTime, Interval } from "luxon";
import Stripe from "stripe";
import crypto from "crypto";
import { Readable } from "stream";

const app = express();
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  }),
);
app.use(
  cors({
    origin: ["https://agenziaplinio.it", "https://www.agenziaplinio.it"],
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
const CLOSE_HOUR = 18;
const payhipWebhookSecret = String(process.env.PAYHIP_WEBHOOK_SECRET || "").trim();
const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();
const stripeWebhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
const stripeWebhookSecretSecondary = String(process.env.STRIPE_WEBHOOK_SECRET_SECONDARY || "").trim();
const deliveryBaseUrl = String(process.env.DIGITAL_DELIVERY_BASE_URL || "").trim();

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

async function ensureDigitalOrdersTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS digital_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      stripe_payment_intent_id VARCHAR(191) NOT NULL,
      product_id VARCHAR(120) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(191) NOT NULL,
      amount_cents INT NOT NULL,
      currency VARCHAR(20) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'paid',
      metadata_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_digital_orders_pi (stripe_payment_intent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureDigitalDeliveryTokensTable() {
  if (!process.env.MYSQL_HOST) return;
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS digital_delivery_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      token_hash VARCHAR(191) NOT NULL,
      order_id INT NOT NULL,
      product_id VARCHAR(120) NOT NULL,
      customer_email VARCHAR(191) NOT NULL,
      asset_path VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      max_downloads INT NOT NULL DEFAULT 3,
      download_count INT NOT NULL DEFAULT 0,
      revoked TINYINT(1) NOT NULL DEFAULT 0,
      last_download_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_delivery_token_hash (token_hash),
      KEY idx_delivery_order (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureDigitalCommerceTables() {
  await ensureDigitalOrdersTable();
  await ensureDigitalDeliveryTokensTable();
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateDeliveryToken() {
  return crypto.randomBytes(32).toString("hex");
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

function normalizeProductId(value, fallback = "") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const INTERNAL_STORE_PRODUCTS = [
  
];

function getInternalStoreProducts() {
  return INTERNAL_STORE_PRODUCTS;
}

function getInternalStoreProductById(productId) {
  return INTERNAL_STORE_PRODUCTS.find((item) => item.id === productId) || null;
}

function getPublicBaseUrl() {
  return (deliveryBaseUrl || String(process.env.NEXT_PUBLIC_SITE_URL || "").trim()).replace(/\/$/, "");
}

function buildDeliveryLink(token) {
  const base = getPublicBaseUrl();
  if (!base) return "";
  return `${base}/api/digital/download/${encodeURIComponent(token)}`;
}

function buildAssetSourceUrl(pathOrUrl) {
  const raw = String(pathOrUrl || "").trim();
  if (!raw) return "";

  try {
    return new URL(raw).toString();
  } catch {
    const base = getPublicBaseUrl();
    if (!base) return "";
    const sanitizedPath = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${sanitizedPath}`;
  }
}

async function sendDigitalDeliveryEmail({ to, productName, deliveryUrl }) {
  const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
  const resendFrom = String(process.env.RESEND_FROM || "").trim();
  if (!resendApiKey || !resendFrom || !to || !deliveryUrl) return;

  const subject = `Consegna digitale: ${productName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Pagamento confermato</h2>
      <p>Grazie per il tuo acquisto. Ecco il link per il download del prodotto <strong>${productName}</strong>.</p>
      <p><a href="${deliveryUrl}" style="display:inline-block;padding:12px 18px;background:#0891b2;color:#fff;text-decoration:none;border-radius:999px;">Scarica il prodotto</a></p>
      <p style="font-size: 13px; color: #475569;">Il link ha scadenza e un numero massimo di download.</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to,
      subject,
      html,
    }),
  });
}

let stripeClient = null;
function getStripeClient() {
  if (!stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey);
  }
  return stripeClient;
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

function buildSlots(dateISO) {
  const date = DateTime.fromISO(dateISO, { zone: config.timezone });
  if (!date.isValid) return [];

  const startOfDay = date.set({ hour: OPEN_HOUR, minute: 0, second: 0, millisecond: 0 });
  const endOfDay = date.set({ hour: CLOSE_HOUR, minute: 0, second: 0, millisecond: 0 });

  const slots = [];
  let cursor = startOfDay;

  while (cursor.plus({ minutes: config.defaultDuration }) <= endOfDay) {
    const end = cursor.plus({ minutes: config.defaultDuration });
    slots.push({
      start: cursor.toISO(),
      end: end.toISO(),
      label: cursor.toFormat("HH:mm"),
    });
    cursor = cursor.plus({ minutes: config.defaultDuration });
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

app.get("/api/store/products", (_req, res) => {
  return res.json({ products: getInternalStoreProducts() });
});

app.post("/api/payments/create-intent", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(503).json({ message: "Stripe non configurato" });
  }

  const productId = normalizeProductId(req.body?.productId || "");
  const customerEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
  if (!productId) {
    return res.status(400).json({ message: "Prodotto non valido" });
  }
  if (!customerEmail || !customerEmail.includes("@")) {
    return res.status(400).json({ message: "Email cliente non valida" });
  }

  try {
    const products = getInternalStoreProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return res.status(404).json({ message: "Prodotto non trovato" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.amountCents,
      currency: product.currency || "eur",
      automatic_payment_methods: { enabled: true },
      receipt_email: customerEmail,
      metadata: {
        source: "agenziaplinio_checkout",
        product_id: product.id,
        product_name: product.name,
        customer_email: customerEmail,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amountCents: product.amountCents,
      currency: product.currency,
      productName: product.name,
    });
  } catch {
    return res.status(500).json({ message: "Errore creazione pagamento" });
  }
});

app.post("/api/payments/webhook", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe || (!stripeWebhookSecret && !stripeWebhookSecretSecondary)) {
    return res.status(503).json({ message: "Webhook Stripe non configurato" });
  }

  const signature = req.get("stripe-signature");
  if (!signature || !req.rawBody) {
    return res.status(400).json({ message: "Firma webhook mancante" });
  }

  let event;
  const webhookSecrets = [stripeWebhookSecret, stripeWebhookSecretSecondary].filter(Boolean);
  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
      break;
    } catch {
      // prova il secret successivo
    }
  }

  if (!event) {
    return res.status(400).json({ message: "Firma webhook non valida" });
  }

  if (event.type !== "payment_intent.succeeded") {
    return res.json({ ok: true, ignored: true });
  }

  if (!process.env.MYSQL_HOST) {
    return res.status(503).json({ message: "Database non configurato" });
  }

  try {
    await ensureDigitalCommerceTables();

    const paymentIntent = event.data.object;
    const productId = normalizeProductId(paymentIntent?.metadata?.product_id || "");
    const customerEmail = String(
      paymentIntent?.receipt_email || paymentIntent?.metadata?.customer_email || "",
    )
      .trim()
      .toLowerCase();

    if (!productId || !customerEmail) {
      return res.status(400).json({ message: "Dati ordine incompleti" });
    }

    const product = getInternalStoreProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Prodotto non riconosciuto" });
    }

    const poolRef = getPool();
    const [orderResult] = await poolRef.execute(
      `INSERT INTO digital_orders
        (stripe_payment_intent_id, product_id, product_name, customer_email, amount_cents, currency, status, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        customer_email = VALUES(customer_email),
        amount_cents = VALUES(amount_cents),
        currency = VALUES(currency),
        status = 'paid',
        metadata_json = VALUES(metadata_json),
        updated_at = NOW()`,
      [
        paymentIntent.id,
        product.id,
        product.name,
        customerEmail,
        Number(paymentIntent.amount || product.amountCents),
        String(paymentIntent.currency || product.currency || "eur"),
        JSON.stringify(paymentIntent.metadata || {}),
      ],
    );

    let orderId = Number(orderResult?.insertId || 0);
    if (!orderId) {
      const [rows] = await poolRef.execute(
        "SELECT id FROM digital_orders WHERE stripe_payment_intent_id = ? LIMIT 1",
        [paymentIntent.id],
      );
      orderId = Number(rows?.[0]?.id || 0);
    }

    if (!orderId) {
      return res.status(500).json({ message: "Impossibile registrare ordine" });
    }

    const token = generateDeliveryToken();
    const tokenHash = hashToken(token);
    const expiresAt = DateTime.now().plus({ days: 7 }).toFormat("yyyy-LL-dd HH:mm:ss");

    await poolRef.execute(
      `INSERT INTO digital_delivery_tokens
        (token_hash, order_id, product_id, customer_email, asset_path, expires_at, max_downloads, download_count, revoked, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 3, 0, 0, NOW(), NOW())`,
      [tokenHash, orderId, product.id, customerEmail, product.assetPath, expiresAt],
    );

    const deliveryLink = buildDeliveryLink(token);
    await sendDigitalDeliveryEmail({
      to: customerEmail,
      productName: product.name,
      deliveryUrl: deliveryLink,
    });

    return res.json({ ok: true, processed: true });
  } catch {
    return res.status(500).json({ message: "Errore elaborazione webhook Stripe" });
  }
});

app.get("/api/digital/download/:token", async (req, res) => {
  if (!process.env.MYSQL_HOST) {
    return res.status(503).send("Database non configurato");
  }

  const token = String(req.params?.token || "").trim();
  if (!token) return res.status(400).send("Token non valido");

  try {
    await ensureDigitalCommerceTables();
    const tokenHash = hashToken(token);
    const poolRef = getPool();

    const [rows] = await poolRef.execute(
      `SELECT id, product_id, asset_path, expires_at, max_downloads, download_count, revoked
       FROM digital_delivery_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [tokenHash],
    );

    const row = rows?.[0];
    if (!row) return res.status(404).send("Link non valido");
    if (Number(row.revoked) === 1) return res.status(403).send("Link revocato");

    const expiresAt = DateTime.fromSQL(String(row.expires_at));
    if (!expiresAt.isValid || expiresAt < DateTime.now()) {
      return res.status(410).send("Link scaduto");
    }

    const downloadCount = Number(row.download_count || 0);
    const maxDownloads = Number(row.max_downloads || 0);
    if (maxDownloads > 0 && downloadCount >= maxDownloads) {
      return res.status(410).send("Numero massimo download raggiunto");
    }

    const product = getInternalStoreProductById(String(row.product_id || ""));
    const assetPath = String(row.asset_path || product?.assetPath || "").trim();
    const assetSourceUrl = buildAssetSourceUrl(assetPath);
    if (!assetSourceUrl) return res.status(500).send("Asset non disponibile");

    const upstream = await fetch(assetSourceUrl);
    if (!upstream.ok || !upstream.body) {
      return res.status(502).send("Asset non raggiungibile");
    }

    await poolRef.execute(
      `UPDATE digital_delivery_tokens
       SET download_count = download_count + 1,
           last_download_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [row.id],
    );

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = upstream.headers.get("content-disposition") || "attachment";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", contentDisposition);
    return Readable.fromWeb(upstream.body).pipe(res);
  } catch {
    return res.status(500).send("Errore download digitale");
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
  } catch {
    return res.status(500).json({ message: "Errore nel recupero disponibilità" });
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

    const event = await calendar.events.insert({
      calendarId: config.calendarId,
      sendUpdates: config.sendUpdates,
      requestBody: {
        summary: `Appuntamento ${service} - ${name}`,
        description: descriptionLines.join("\n"),
        start: { dateTime: start.toISO(), timeZone: config.timezone },
        end: { dateTime: end.toISO(), timeZone: config.timezone },
        attendees: config.inviteClient ? [{ email, displayName: name }] : undefined,
      },
    });

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
  } catch {
    return res.status(500).json({ message: "Errore nella creazione appuntamento" });
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
