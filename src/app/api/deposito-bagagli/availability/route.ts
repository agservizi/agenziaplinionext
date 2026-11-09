import { type NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Il parametro 'date' (YYYY-MM-DD) è obbligatorio.",
          },
        },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${DEPOSITO_API_BASE}/availability?date=${encodeURIComponent(date)}`,
      {
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
