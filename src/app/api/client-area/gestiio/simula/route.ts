import { NextResponse } from "next/server";
import { gestiioSimulaBolletta } from "@/lib/gestiio-client-portal";
import { requireGestiioPortalCustomer } from "@/lib/gestiio-client-portal-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const customer = await requireGestiioPortalCustomer(request);
  if (!customer) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const result = await gestiioSimulaBolletta({
      kwh_anno: body?.kwh_anno != null ? Number(body.kwh_anno) : undefined,
      smc_anno: body?.smc_anno != null ? Number(body.smc_anno) : undefined,
      potenza_kw: body?.potenza_kw != null ? Number(body.potenza_kw) : undefined,
      spesa_annua_attuale:
        body?.spesa_annua_attuale != null ? Number(body.spesa_annua_attuale) : undefined,
      commodity: body?.commodity,
      include_canone_rai: Boolean(body?.include_canone_rai),
    });
    return NextResponse.json({
      success: true,
      profile: result?.profile ?? null,
      ranking: Array.isArray(result?.ranking) ? result.ranking : [],
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Simulazione non disponibile" },
      { status: 502 },
    );
  }
}
