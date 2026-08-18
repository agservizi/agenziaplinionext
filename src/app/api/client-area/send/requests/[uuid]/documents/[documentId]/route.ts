import { NextResponse } from "next/server";
import {
  clientOwnsSendRequest,
  downloadGestiioSendDocument,
  requireSendClientIdentity,
} from "@/lib/gestiio-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ uuid: string; documentId: string }> },
) {
  const { uuid, documentId } = await context.params;
  const identity = await requireSendClientIdentity(request);
  if (!identity || !(await clientOwnsSendRequest(identity, uuid))) {
    return NextResponse.json({ message: "Documento non trovato" }, { status: 404 });
  }

  const base = (
    process.env.GESTIIO_SEND_BASE_URL ||
    "https://gestiio.agenziaplinio.it/api/public/send"
  ).replace(/\/+$/, "");
  const upstream = await downloadGestiioSendDocument(
    `${base}/richieste/${encodeURIComponent(uuid)}/documenti/${encodeURIComponent(documentId)}`,
  );

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition":
        upstream.headers.get("content-disposition") || 'attachment; filename="documento-send"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
