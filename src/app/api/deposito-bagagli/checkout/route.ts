import { NextRequest, NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
} from "@/lib/deposito-bagagli-api";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const customerName = String(body?.customerName || "").trim();
    const customerEmail = String(body?.customerEmail || "").trim().toLowerCase();
    const bagCount = Number(body?.bagCount) || 0;
    const bookingDate = String(body?.bookingDate || "").trim();
    const days = Math.max(1, Number(body?.days) || 1);

    if (!customerName || !customerEmail.includes("@") || bagCount < 1 || !bookingDate) {
      return NextResponse.json({ message: "Dati prenotazione incompleti." }, { status: 422 });
    }

    let dailyRate = 5;
    try {
      const pricingRes = await fetch(`${DEPOSITO_API_BASE}/pricing`, {
        headers: depositoApiHeaders(),
        cache: "no-store",
      });
      const pricingJson = await pricingRes.json();
      const rate = Number(pricingJson?.data?.dailyRate ?? pricingJson?.dailyRate);
      if (Number.isFinite(rate) && rate > 0) dailyRate = rate;
    } catch {
      /* keep fallback */
    }

    const amountCents = Math.max(50, Math.round(dailyRate * bagCount * days * 100));
    const origin = new URL(request.url).origin;
    const returnPath = String(body?.returnPath || "/deposito-bagagli/prenota");

    const checkout = await createStripeCheckoutSession({
      amountCents,
      customerEmail,
      productName: "Deposito bagagli AG SERVIZI",
      description: `${bagCount} bagagli · ${days} giorn${days === 1 ? "o" : "i"}`,
      successUrl: `${origin}${returnPath}?deposito_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}${returnPath}?deposito_checkout=cancel`,
      invoiceDescription: `Deposito bagagli · ${bookingDate}`,
      metadata: {
        service: "deposito-bagagli",
        amount_cents: String(amountCents),
        bag_count: String(bagCount),
        days: String(days),
        booking_date: bookingDate,
        customer_email: customerEmail,
      },
    });

    if (!checkout.id || !checkout.url) {
      throw new Error("URL checkout Stripe non disponibile.");
    }

    return NextResponse.json({
      url: checkout.url,
      sessionId: checkout.id,
      amountCents,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout non riuscito" },
      { status: 502 },
    );
  }
}
