import { NextResponse } from "next/server";
import { verifyAdminPortalToken } from "@/lib/admin-portal-server";
import {
  isCafPatronatoDatabaseConfigured,
  saveAdminCafPatronatoPricingRule,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  const token = String(request.headers.get("x-admin-token") || "").trim();
  if (!verifyAdminPortalToken(token)) {
    return NextResponse.json({ message: "Sessione admin non valida" }, { status: 401 });
  }

  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      id?: number;
      serviceType?: string;
      label?: string;
      priceEUR?: number;
      sortOrder?: number;
      active?: boolean;
    };

    const serviceType = String(body.serviceType || "").trim();
    const label = String(body.label || "").trim();
    if (!serviceType || !label) {
      return NextResponse.json(
        { message: "Servizio e etichetta sono obbligatori." },
        { status: 400 },
      );
    }

    await saveAdminCafPatronatoPricingRule({
      id: body.id ? Number(body.id) : undefined,
      serviceType,
      label,
      priceEUR: Number(body.priceEUR || 0),
      sortOrder: Number(body.sortOrder || 0),
      active: Boolean(body.active),
    });

    return NextResponse.json({ message: "Regola CAF/Patronato salvata." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossibile salvare il listino CAF e Patronato.",
      },
      { status: 500 },
    );
  }
}
