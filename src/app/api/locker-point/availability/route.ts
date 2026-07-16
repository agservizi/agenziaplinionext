import { type NextRequest, NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_DATE",
            message: "Il parametro 'date' (YYYY-MM-DD) è obbligatorio.",
          },
        },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${LOCKER_POINT_API_BASE}/availability?date=${encodeURIComponent(date)}`,
      {
        headers: lockerPointHeaders(),
        cache: "no-store",
      },
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Servizio non disponibile.",
        },
      },
      { status: 502 },
    );
  }
}
