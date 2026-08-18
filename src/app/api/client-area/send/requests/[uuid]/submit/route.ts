import { NextResponse } from "next/server";
import {
  clientOwnsSendRequest,
  gestiioSendRequest,
  hasPaidSendRequest,
  requireSendClientIdentity,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;
  const identity = await requireSendClientIdentity(request);
  if (!identity || !(await clientOwnsSendRequest(identity, uuid))) {
    return NextResponse.json({ message: "Pratica non trovata" }, { status: 404 });
  }
  if (!(await hasPaidSendRequest(identity, uuid))) {
    return NextResponse.json(
      { message: "Completa il pagamento prima di inviare la pratica." },
      { status: 402 },
    );
  }

  return NextResponse.json(
    await gestiioSendRequest(`/richieste/${encodeURIComponent(uuid)}/invia`, {
      method: "POST",
    }),
  );
}
