import { NextRequest } from "next/server";
import { proxyBookingRequest } from "./_proxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyBookingRequest(request, "/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
    },
    body,
  });
}
