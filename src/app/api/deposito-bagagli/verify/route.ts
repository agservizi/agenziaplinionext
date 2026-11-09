import { type NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_PARAM", message: "Il parametro 'token' è obbligatorio." } },
        { status: 400 },
      );
    }

    const res = await fetch(`${DEPOSITO_API_BASE}/verify?token=${encodeURIComponent(token)}`, {
      headers: depositoApiHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Servizio non disponibile." } },
      { status: 502 },
    );
  }
}
