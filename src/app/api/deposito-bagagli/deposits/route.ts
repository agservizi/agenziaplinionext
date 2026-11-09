import { type NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAM",
            message: "Il parametro 'email' è obbligatorio.",
          },
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ email });

    const optional = ["status", "from", "to", "page", "limit"] as const;
    for (const key of optional) {
      const value = searchParams.get(key);
      if (value) {
        params.set(key, value);
      }
    }

    const res = await fetch(`${DEPOSITO_API_BASE}/deposits?${params.toString()}`, {
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
      { status: 502 }
    );
  }
}
