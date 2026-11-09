import { type NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const res = await fetch(
      `${DEPOSITO_API_BASE}/deposits/${encodeURIComponent(code)}/cancel`,
      {
        method: "POST",
        headers: depositoApiHeaders(),
      }
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
      { status: 502 }
    );
  }
}
