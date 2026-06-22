import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://coresuite.it/api/public/deposito-bagagli";
const API_KEY =
  process.env.CORESUITE_API_KEY ||
  "16e43eaa90b6c5ae75a6821b0ba2a3251aae80da7d63c25967f404a467db6635";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const required = [
      "customerName",
      "customerEmail",
      "bagCount",
      "bookingDate",
    ] as const;
    const missing = required.filter(
      (field) => body[field] === undefined || body[field] === null
    );

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: `Campi obbligatori mancanti: ${missing.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
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
