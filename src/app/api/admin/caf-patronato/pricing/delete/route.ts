import { NextResponse } from "next/server";
import { verifyAdminPortalToken } from "@/lib/admin-portal-server";
import {
  isCafPatronatoDatabaseConfigured,
  removeAdminCafPatronatoPricingRule,
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
    const body = (await request.json()) as { id?: number };
    const id = Number(body.id || 0);
    if (!id) {
      return NextResponse.json({ message: "ID regola non valido." }, { status: 400 });
    }

    await removeAdminCafPatronatoPricingRule(id);
    return NextResponse.json({ message: "Regola CAF/Patronato rimossa." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossibile rimuovere la regola del listino CAF e Patronato.",
      },
      { status: 500 },
    );
  }
}
