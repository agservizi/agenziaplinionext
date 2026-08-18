import { NextResponse } from "next/server";
import {
  clientOwnsSendRequest,
  gestiioSendRequest,
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

  const payload = await gestiioSendRequest(
    `/richieste/${encodeURIComponent(uuid)}/documenti`,
    { method: "POST", body: await request.formData() },
  );
  return NextResponse.json(payload, { status: 201 });
}
