import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://coresuite.it/api/public/deposito-bagagli";
const API_KEY =
  process.env.CORESUITE_API_KEY ||
  "16e43eaa90b6c5ae75a6821b0ba2a3251aae80da7d63c25967f404a467db6635";

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

    const res = await fetch(`${API_BASE}/deposits?${params.toString()}`, {
      headers: { "x-api-key": API_KEY },
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
