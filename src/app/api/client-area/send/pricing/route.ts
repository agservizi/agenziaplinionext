import { NextResponse } from "next/server";
import {
  requireSendClientIdentity,
  resolveSendPrice,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await requireSendClientIdentity(request))) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }
  try {
    return NextResponse.json(await resolveSendPrice());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Tariffa SEND non disponibile" },
      { status: 502 },
    );
  }
}
