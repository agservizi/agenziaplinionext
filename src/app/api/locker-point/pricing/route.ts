import { NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointFallbackPricingResponse,
  lockerPointHeaders,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(lockerPointFallbackPricingResponse());
  }

  try {
    const res = await fetch(`${LOCKER_POINT_API_BASE}/pricing`, {
      headers: lockerPointHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(lockerPointFallbackPricingResponse());
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(lockerPointFallbackPricingResponse());
  }
}
