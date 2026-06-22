import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://coresuite.it/api/public/deposito-bagagli";
const API_KEY =
  process.env.CORESUITE_API_KEY ||
  "16e43eaa90b6c5ae75a6821b0ba2a3251aae80da7d63c25967f404a467db6635";

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
      `${API_BASE}/availability?date=${encodeURIComponent(date)}`,
      {
        headers: { "x-api-key": API_KEY },
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
