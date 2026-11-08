import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";
import { gestiioUpdatePractice } from "@/lib/gestiio-client-portal";
import {
  requireGestiioPortalCustomer,
  updateLinkedGestiioPracticeStatus,
  syncClientAreaRequestByGestiioUuid,
} from "@/lib/gestiio-client-portal-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const customer = await requireGestiioPortalCustomer(request);
  if (!customer) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = String(body?.sessionId || "").trim();
  const uuid = String(body?.uuid || "").trim();
  if (!sessionId || !uuid) {
    return NextResponse.json({ message: "sessionId e uuid obbligatori" }, { status: 422 });
  }

  try {
    const session = await getStripeCheckoutSession(sessionId);
    const identityHash = createHash("sha256")
      .update(customer.clientIdentity)
      .digest("hex");
    const expectedAmount = Number(session.metadata.amount_cents);
    const ok =
      session.status === "complete" &&
      session.paymentStatus === "paid" &&
      session.metadata.service === "gestiio-client-portal" &&
      session.metadata.gestiio_practice_uuid === uuid &&
      session.metadata.client_identity_hash === identityHash &&
      Number.isInteger(expectedAmount) &&
      expectedAmount > 0 &&
      session.amountTotal === expectedAmount &&
      session.currency.toLowerCase() === "eur";

    if (!ok) {
      return NextResponse.json({ message: "Pagamento non valido" }, { status: 400 });
    }

    await gestiioUpdatePractice(uuid, {
      payment_status: "paid",
      status: "in_lavorazione",
      stripe_session_id: sessionId,
      amount: session.amountTotal / 100,
    });
    await updateLinkedGestiioPracticeStatus(uuid, "in_lavorazione", "paid");
    await syncClientAreaRequestByGestiioUuid(uuid, "paid");

    return NextResponse.json({ ok: true, uuid, payment_status: "paid" });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Verifica fallita" },
      { status: 502 },
    );
  }
}
