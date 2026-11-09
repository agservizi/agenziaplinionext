import { type NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

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

    const res = await fetch(`${DEPOSITO_API_BASE}/book`, {
      method: "POST",
      headers: depositoApiHeaders({ "Content-Type": "application/json" }),
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
