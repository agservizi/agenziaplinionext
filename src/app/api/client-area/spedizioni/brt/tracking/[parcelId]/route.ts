import { NextRequest, NextResponse } from "next/server";
import { trackBrtParcel } from "@/lib/brt-shipment";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ parcelId: string }> },
) {
  const { parcelId } = await context.params;
  const safeId = String(parcelId || "").trim();

  if (!safeId) {
    return NextResponse.json({ message: "parcelId mancante." }, { status: 400 });
  }

  try {
    const result = await trackBrtParcel(safeId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tracking non disponibile al momento.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
