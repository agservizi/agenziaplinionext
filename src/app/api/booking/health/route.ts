import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const enabled = process.env.GOOGLE_CALENDAR_ENABLED === "true";
  const calendarId = Boolean(process.env.GOOGLE_CALENDAR_CALENDAR_ID);
  const credentials = Boolean(process.env.GOOGLE_CALENDAR_CREDENTIALS_JSON);
  const timezone = Boolean(process.env.GOOGLE_CALENDAR_TIMEZONE);
  const duration = Boolean(process.env.GOOGLE_CALENDAR_DEFAULT_DURATION);
  const invite = Boolean(process.env.GOOGLE_CALENDAR_INVITE_CLIENT);
  const updates = Boolean(process.env.GOOGLE_CALENDAR_SEND_UPDATES);

  return NextResponse.json({
    ok: enabled && calendarId && credentials,
    checks: {
      enabled,
      calendarId,
      credentials,
      timezone,
      duration,
      invite,
      updates,
    },
  });
}
