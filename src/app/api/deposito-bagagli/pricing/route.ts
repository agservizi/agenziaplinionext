import { NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
  depositoApiKey,
  depositoMissingKeyResponse,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!depositoApiKey()) {
    return NextResponse.json(depositoMissingKeyResponse(), { status: 503 });
  }
  try {
    const res = await fetch(`${DEPOSITO_API_BASE}/pricing`, {
      headers: depositoApiHeaders(),
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
