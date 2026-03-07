import { NextResponse } from "next/server";
import { confirmBrtShipment, getMissingBrtConfig } from "@/lib/brt-shipment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { message: `Configurazione BRT incompleta: ${missing.join(", ")}.` },
      { status: 503 },
    );
  }

  const body = await request.json();
  const numericSenderReference = Number(body?.numericSenderReference);
  const alphanumericSenderReference = String(body?.alphanumericSenderReference || "").trim();
  const cmrCode = String(body?.cmrCode || "").trim();

  if (!Number.isFinite(numericSenderReference) || numericSenderReference <= 0) {
    return NextResponse.json({ message: "Riferimento numerico non valido." }, { status: 400 });
  }

  if (!alphanumericSenderReference) {
    return NextResponse.json(
      { message: "Riferimento alfanumerico non valido." },
      { status: 400 },
    );
  }

  try {
    const result = await confirmBrtShipment({
      numericSenderReference,
      alphanumericSenderReference,
      cmrCode,
    });

    return NextResponse.json(
      {
        message: result.message,
        confirmed: result.confirmed,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Errore durante la conferma della spedizione.",
      },
      { status: 502 },
    );
  }
}
