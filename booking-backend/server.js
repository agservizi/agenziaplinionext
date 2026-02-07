import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import mysql from "mysql2/promise";
import { DateTime, Interval } from "luxon";

const app = express();
app.use(express.json());
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

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Booking backend listening on port ${port}`);
});
