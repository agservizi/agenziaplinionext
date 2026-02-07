import { NextResponse } from "next/server";
import { DateTime, Interval } from "luxon";
import { getPool } from "@/lib/db";
import { getCalendarClient, getCalendarConfig } from "@/lib/google-calendar";

export const runtime = "nodejs";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function POST(request: Request) {
  const config = getCalendarConfig();
  if (!config.enabled || !config.calendarId) {
    return NextResponse.json({ message: "Google Calendar non configurato" }, { status: 503 });
  }

  const body = await request.json();
  const service = String(body?.service || "").trim();
  const date = String(body?.date || "").trim();
  const time = String(body?.time || "").trim();
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const phone = String(body?.phone || "").trim();
  const notes = String(body?.notes || "").trim();

  if (!service || !date || !time || !name || !email || !phone) {
    return NextResponse.json({ message: "Compila tutti i campi obbligatori." }, { status: 400 });
  }

  const start = DateTime.fromISO(`${date}T${time}`, { zone: config.timezone });
  if (!start.isValid) {
    return NextResponse.json({ message: "Data o ora non valide." }, { status: 400 });
  }

  if (start < DateTime.now().setZone(config.timezone).minus({ minutes: 5 })) {
    return NextResponse.json({ message: "Seleziona una data futura." }, { status: 400 });
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
      .filter((interval): interval is Interval => Boolean(interval));

    const requestedInterval = Interval.fromDateTimes(start, end);
    const isBusy = busyIntervals.some((interval) => interval.overlaps(requestedInterval));

    if (isBusy) {
      return NextResponse.json({ message: "Slot non disponibile." }, { status: 409 });
    }

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
        start: {
          dateTime: start.toISO(),
          timeZone: config.timezone,
        },
        end: {
          dateTime: end.toISO(),
          timeZone: config.timezone,
        },
        attendees: config.inviteClient ? [{ email, displayName: name }] : undefined,
      },
    });

    const eventId = event.data.id ?? null;

    if (hasDatabaseConfig()) {
      try {
        const pool = getPool();
        await pool.execute(
          "INSERT INTO booking_requests (google_event_id, name, email, phone, service, start_at, end_at, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [eventId, name, email, phone, service, start.toISO(), end.toISO(), notes, "confirmed"],
        );
      } catch (dbError) {
        console.error("Booking DB insert failed", dbError);
      }
    }

    return NextResponse.json({
      message: "Prenotazione confermata",
      eventId,
      start: start.toISO(),
      end: end.toISO(),
    });
  } catch (error) {
    console.error("Booking error", error);
    return NextResponse.json({ message: "Errore nella creazione appuntamento" }, { status: 500 });
  }
}
