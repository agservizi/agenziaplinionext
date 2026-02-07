import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { buildBusyIntervals, buildSlots, excludeBusy } from "@/lib/booking";
import { getCalendarClient, getCalendarConfig } from "@/lib/google-calendar";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ message: "Data non valida" }, { status: 400 });
  }

  const config = getCalendarConfig();
  if (!config.enabled || !config.calendarId) {
    return NextResponse.json({ message: "Google Calendar non configurato" }, { status: 503 });
  }

  const day = DateTime.fromISO(date, { zone: config.timezone });
  if (!day.isValid) {
    return NextResponse.json({ message: "Data non valida" }, { status: 400 });
  }

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

    const slots = buildSlots(date, config.defaultDuration);
    const busy = buildBusyIntervals(events);
    const available = excludeBusy(slots, busy);

    return NextResponse.json({
      date,
      timezone: config.timezone,
      duration: config.defaultDuration,
      slots: available,
    });
  } catch (error) {
    console.error("Availability error", error);
    return NextResponse.json({ message: "Errore nel recupero disponibilità" }, { status: 500 });
  }
}
