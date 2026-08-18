import { NextResponse } from "next/server";
import { LOCKER_POINT_API_BASE } from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${LOCKER_POINT_API_BASE}/health`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
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
