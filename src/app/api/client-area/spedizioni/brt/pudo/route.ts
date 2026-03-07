import { NextResponse } from "next/server";
import { getMissingBrtPudoConfig, searchBrtPudo } from "@/lib/brt-shipment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const missing = getMissingBrtPudoConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { message: `Configurazione BRT PUDO incompleta: ${missing.join(", ")}.` },
      { status: 503 },
    );
  }

  const body = await request.json();
  const zipCode = String(body?.zipCode || "").trim();
  const city = String(body?.city || "").trim();
  const country = String(body?.country || "IT")
    .trim()
    .toUpperCase();

  if (!zipCode && !city) {
    return NextResponse.json(
      { message: "Inserisci almeno CAP o citta per la ricerca PUDO." },
      { status: 400 },
    );
  }

  try {
    const result = await searchBrtPudo({ zipCode, city, country });
    return NextResponse.json(
      {
        message: result.points.length
          ? "Punti BRT disponibili."
          : "Nessun punto BRT trovato per i criteri indicati.",
        points: result.points,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Errore durante la ricerca dei punti BRT.",
      },
      { status: 502 },
    );
  }
}
