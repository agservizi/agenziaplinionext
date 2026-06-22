import { NextResponse } from "next/server";
import {
  isCafPatronatoDatabaseConfigured,
  listCafPatronatoHistory,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  try {
    const requests = await listCafPatronatoHistory();
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile recuperare lo storico pratiche.",
      },
      { status: 500 },
    );
  }
}
