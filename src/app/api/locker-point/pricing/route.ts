import { NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const res = await fetch(`${LOCKER_POINT_API_BASE}/pricing`, {
      headers: lockerPointHeaders(),
      cache: "no-store",
    });
    const data = await res.json().catch(() => missingApiKeyResponse());
    if (!res.ok) {
      return NextResponse.json(
        typeof data === "object" && data
          ? data
          : { success: false, error: { code: "UPSTREAM", message: "Listino locker non disponibile" } },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Servizio non disponibile." } },
      { status: 502 },
    );
  }
}
