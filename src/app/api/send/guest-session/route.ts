import { NextResponse } from "next/server";
import {
  createSendGuestSession,
  readSendGuestIdentity,
  SEND_GUEST_COOKIE,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (readSendGuestIdentity(request)) {
    return NextResponse.json({ success: true, existing: true });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SEND_GUEST_COOKIE, createSendGuestSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
