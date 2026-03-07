import { NextResponse } from "next/server";
import { verifyAdminPortalToken } from "@/lib/admin-portal-server";
import {
  isCafPatronatoDatabaseConfigured,
  listAdminCafPatronatoRequests,
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
    const requests = await listAdminCafPatronatoRequests();
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile caricare le pratiche CAF e Patronato.",
      },
      { status: 500 },
    );
  }
}
