import { NextRequest, NextResponse } from "next/server";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

/** Caller: LockerPointBookingForm after Stripe return. API: POST /api/locker-point/checkout/verify. User: pagamento locker. */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const body = await request.json();
    const sessionId = String(body?.sessionId || "").trim();
    if (!sessionId) {
      return NextResponse.json({ message: "Sessione Stripe mancante" }, { status: 422 });
    }

    const session = await getStripeCheckoutSession(sessionId);
    const expectedAmount = Number(session.metadata.amount_cents);
    const ok =
      session.status === "complete" &&
      session.paymentStatus === "paid" &&
      session.metadata.service === "locker-point" &&
      Number.isInteger(expectedAmount) &&
      expectedAmount > 0 &&
      session.amountTotal === expectedAmount &&
      session.currency.toLowerCase() === "eur";

    if (!ok) {
      return NextResponse.json({ message: "Pagamento non valido" }, { status: 400 });
    }

    const payload = {
      recipientName: String(body?.recipientName || session.metadata.recipient_name || "").trim(),
      expectedPickupDate: String(
        body?.expectedPickupDate || session.metadata.expected_pickup_date || "",
      ).trim(),
      recipientEmail: body?.recipientEmail
        ? String(body.recipientEmail).trim()
        : session.metadata.customer_email || undefined,
      recipientPhone: body?.recipientPhone ? String(body.recipientPhone).trim() : undefined,
      senderName: body?.senderName ? String(body.senderName).trim() : undefined,
      carrier: body?.carrier ? String(body.carrier).trim() : undefined,
      trackingCode: body?.trackingCode ? String(body.trackingCode).trim() : undefined,
      notes: body?.notes
        ? `${String(body.notes)} · Stripe ${sessionId}`
        : `Pagato online Stripe ${sessionId}`,
      stripeSessionId: sessionId,
      amountPaidCents: session.amountTotal,
    };

    if (!payload.recipientName || !payload.expectedPickupDate) {
      return NextResponse.json(
        { message: "Dati locker mancanti dopo il pagamento" },
        { status: 422 },
      );
    }

    const res = await fetch(`${LOCKER_POINT_API_BASE}/book`, {
      method: "POST",
      headers: lockerPointHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(
      { ...data, paid: true, amountCents: session.amountTotal },
      { status: res.status },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Verifica fallita" },
      { status: 502 },
    );
  }
}
