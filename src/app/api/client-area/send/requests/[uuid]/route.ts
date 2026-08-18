import { NextResponse } from "next/server";
import {
  clientOwnsSendRequest,
  gestiioSendRequest,
  requireSendClientIdentity,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize(request: Request, uuid: string) {
  const identity = await requireSendClientIdentity(request);
  return identity && (await clientOwnsSendRequest(identity, uuid));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;
  if (!(await authorize(request, uuid))) {
    return NextResponse.json({ message: "Pratica non trovata" }, { status: 404 });
  }
  return NextResponse.json(
    await gestiioSendRequest(`/richieste/${encodeURIComponent(uuid)}`),
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;
  if (!(await authorize(request, uuid))) {
    return NextResponse.json({ message: "Pratica non trovata" }, { status: 404 });
  }
  return NextResponse.json(
    await gestiioSendRequest(`/richieste/${encodeURIComponent(uuid)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    }),
  );
}
