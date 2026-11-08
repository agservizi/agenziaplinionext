/**
 * Callers: GestiioPracticeWorkspace (contratti-energia|telefonia selects).
 * API: GET /api/client-area/gestiio/catalog?kind=energia-gestori|telefonia-tipi
 * Schema: proxies GestiiO client-portal catalog endpoints.
 * User: "contratti telefonia e luce e gas(energia) in area clienti dovrebbero seguire il workflow per le segnalazioni presente in gestiio su operatore AG00062"
 */
import { NextResponse } from "next/server";
import {
  gestiioCatalogEnergiaGestori,
  gestiioCatalogTelefoniaTipi,
} from "@/lib/gestiio-client-portal";
import { requireGestiioPortalCustomer } from "@/lib/gestiio-client-portal-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const customer = await requireGestiioPortalCustomer(request);
  if (!customer) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const kind = new URL(request.url).searchParams.get("kind") || "";

  try {
    if (kind === "energia-gestori") {
      const gestori = await gestiioCatalogEnergiaGestori();
      return NextResponse.json({
        options: gestori.map((g) => ({
          value: String(g.id),
          label: g.nome,
        })),
      });
    }

    if (kind === "telefonia-tipi") {
      const tipi = await gestiioCatalogTelefoniaTipi();
      return NextResponse.json({
        options: tipi.map((t) => ({
          value: String(t.id),
          label: t.label || t.nome,
        })),
      });
    }

    return NextResponse.json({ message: "Catalogo non valido." }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossibile caricare il catalogo GestiiO.";
    // Route non ancora in deploy su GestiiO → form area clienti resta usabile.
    if (/could not be found|not found|404/i.test(message)) {
      return NextResponse.json({ options: [], unavailable: true });
    }
    return NextResponse.json({ message }, { status: 502 });
  }
}
