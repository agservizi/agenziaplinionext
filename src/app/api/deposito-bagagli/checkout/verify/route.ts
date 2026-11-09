import { NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
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
      session.metadata.service === "deposito-bagagli" &&
      Number.isInteger(expectedAmount) &&
      expectedAmount > 0 &&
      session.amountTotal === expectedAmount &&
      session.currency.toLowerCase() === "eur";

    if (!ok) {
      return NextResponse.json({ message: "Pagamento non valido" }, { status: 400 });
    }

    const booking = {
      customerName: String(body?.customerName || "").trim(),
      customerEmail: String(body?.customerEmail || session.metadata.customer_email || "")
        .trim()
        .toLowerCase(),
      customerPhone: body?.customerPhone ? String(body.customerPhone).trim() : undefined,
      bagCount: Number(body?.bagCount) || Number(session.metadata.bag_count) || 1,
      bookingDate: String(body?.bookingDate || session.metadata.booking_date || "").trim(),
      expectedCheckIn: body?.expectedCheckIn || undefined,
      expectedCheckOut: body?.expectedCheckOut || undefined,
      notes: body?.notes
        ? `${String(body.notes)} · Stripe ${sessionId}`
        : `Pagato online Stripe ${sessionId}`,
      stripeSessionId: sessionId,
      amountPaidCents: session.amountTotal,
    };

    if (!booking.customerName || !booking.customerEmail || !booking.bookingDate) {
      return NextResponse.json(
        { message: "Dati prenotazione mancanti dopo il pagamento" },
        { status: 422 },
      );
    }

    const res = await fetch(`${DEPOSITO_API_BASE}/book`, {
      method: "POST",
      headers: depositoApiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(booking),
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
