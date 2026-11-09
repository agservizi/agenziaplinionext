import { NextRequest } from "next/server";
import { proxyBookingRequest } from "../_proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return proxyBookingRequest(
    request,
    `/api/booking/availability${request.nextUrl.search}`,
  );
}
