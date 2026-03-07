import { NextResponse } from "next/server";
import { getMissingBrtConfig, trackBrtParcel } from "@/lib/brt-shipment";

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
  const parcelId = String(body?.parcelId || "").trim();

  if (!parcelId) {
    return NextResponse.json({ message: "Parcel ID non valido." }, { status: 400 });
  }

  try {
    const result = await trackBrtParcel(parcelId);
    return NextResponse.json(
      {
        message: "Tracking BRT aggiornato.",
        parcelId: result.parcelId,
        shipmentId: result.shipmentId,
        status: result.status,
        statusDescription: result.statusDescription,
        events: result.events,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Errore durante il tracking della spedizione.",
      },
      { status: 502 },
    );
  }
}
