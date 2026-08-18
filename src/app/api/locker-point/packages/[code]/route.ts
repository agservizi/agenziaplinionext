import { type NextRequest, NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const { code } = await params;
    const res = await fetch(
      `${LOCKER_POINT_API_BASE}/packages/${encodeURIComponent(code)}`,
      { headers: lockerPointHeaders() },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const { code } = await params;
    const body = await request.json();
    const res = await fetch(
      `${LOCKER_POINT_API_BASE}/packages/${encodeURIComponent(code)}`,
      {
        method: "PATCH",
        headers: lockerPointHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
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
