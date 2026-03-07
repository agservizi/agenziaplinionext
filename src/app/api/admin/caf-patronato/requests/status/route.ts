import { NextResponse } from "next/server";
import { verifyAdminPortalToken } from "@/lib/admin-portal-server";
import {
  isCafPatronatoDatabaseConfigured,
  updateAdminCafPatronatoStatus,
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

  const body = await request.json();
  const requestId = Number(body?.requestId || 0);
  const status = String(body?.status || "").trim();
  const operatorNotes = String(body?.operatorNotes || "").trim();

  if (!requestId) {
    return NextResponse.json({ message: "Pratica non valida" }, { status: 400 });
  }

  try {
    await updateAdminCafPatronatoStatus({ requestId, status, operatorNotes });
    return NextResponse.json({ message: "Stato pratica aggiornato." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile aggiornare la pratica.",
      },
      { status: 500 },
    );
  }
}
