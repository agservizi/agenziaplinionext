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
    const params = new URLSearchParams();

    for (const key of [
      "email",
      "phone",
      "code",
      "status",
      "from",
      "to",
      "page",
      "limit",
    ] as const) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }

    const query = params.toString();
    const url = query
      ? `${LOCKER_POINT_API_BASE}/packages?${query}`
      : `${LOCKER_POINT_API_BASE}/packages`;

    const res = await fetch(url, { headers: lockerPointHeaders() });
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
