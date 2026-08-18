import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  clientOwnsSendRequest,
  gestiioSendRequest,
  markSendCheckoutPaid,
  requireSendClientIdentity,
} from "@/lib/gestiio-send";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ uuid: string }> },
) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }
  const { uuid } = await context.params;
  const identity = await requireSendClientIdentity(request);
  if (!identity || !(await clientOwnsSendRequest(identity, uuid))) {
    return NextResponse.json({ message: "Pratica non trovata" }, { status: 404 });
  }
  const body = await request.json();
  const sessionId = String(body?.sessionId || "").trim();
  if (!sessionId) {
    return NextResponse.json({ message: "Sessione Stripe mancante" }, { status: 400 });
  }

  try {
    const session = await getStripeCheckoutSession(sessionId);
    const expectedAmount = Number(session.metadata.amount_cents);
    const valid =
      session.status === "complete" &&
      session.paymentStatus === "paid" &&
      session.metadata.service === "send" &&
      session.metadata.send_uuid === uuid &&
      session.metadata.client_identity_hash ===
        createHash("sha256").update(identity).digest("hex") &&
      Number.isInteger(expectedAmount) &&
      expectedAmount > 0 &&
      session.amountTotal === expectedAmount &&
      session.currency.toLowerCase() === "eur";
    if (!valid) {
      return NextResponse.json(
        { message: "Il pagamento Stripe non corrisponde alla pratica SEND." },
        { status: 402 },
      );
    }

    await markSendCheckoutPaid({
      clientIdentity: identity,
      uuid,
      sessionId,
      amountCents: session.amountTotal,
      currency: session.currency,
    });

    let submitted = true;
    try {
      await gestiioSendRequest(`/richieste/${encodeURIComponent(uuid)}/invia`, {
        method: "POST",
      });
    } catch {
      submitted = false;
    }
    const detail = await gestiioSendRequest<{
      data?: { status?: { value?: string } | string };
    }>(`/richieste/${encodeURIComponent(uuid)}`).catch(() => null);
    const detailStatus = detail?.data?.status;
    const status =
      detailStatus && typeof detailStatus === "object"
        ? String(detailStatus.value || "")
        : String(detailStatus || "");

    return NextResponse.json({
      paid: true,
      submitted,
      status,
      amountCents: session.amountTotal,
      currency: session.currency,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Verifica pagamento non riuscita" },
      { status: 502 },
    );
  }
}
