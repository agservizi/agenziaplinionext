import { NextResponse } from "next/server";
import {
  gestiioSendRequest,
  linkSendRequest,
  requireSendClientIdentity,
  sendAffiliatoId,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GestiioResponse = {
  success: boolean;
  data: {
    uuid: string;
    request_number?: string;
    status?: { value?: string };
  };
};

export async function POST(request: Request) {
  const identity = await requireSendClientIdentity(request);
  if (!identity) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const body = await request.json();
  const payload = await gestiioSendRequest<GestiioResponse>("/richieste", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, affiliato_id: sendAffiliatoId() }),
  });

  await linkSendRequest(identity, {
    uuid: payload.data.uuid,
    requestNumber: payload.data.request_number,
    status: payload.data.status?.value,
  });

  return NextResponse.json(payload, { status: 201 });
}
