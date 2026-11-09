import { NextRequest, NextResponse } from "next/server";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointFallbackPricingResponse,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const body = await request.json();
    const recipientName = String(body?.recipientName || "").trim();
    const recipientEmail = String(body?.recipientEmail || "").trim().toLowerCase();
    const expectedPickupDate = String(body?.expectedPickupDate || "").trim();
    const days = Math.max(1, Number(body?.days) || 1);

    if (!recipientName || !expectedPickupDate) {
      return NextResponse.json({ message: "Dati locker incompleti." }, { status: 422 });
    }

    let dailyRate = 0.5;
    try {
      const pricingRes = await fetch(`${LOCKER_POINT_API_BASE}/pricing`, {
        headers: lockerPointHeaders(),
        cache: "no-store",
      });
      const pricingJson = pricingRes.ok
        ? await pricingRes.json()
        : lockerPointFallbackPricingResponse();
      const rate = Number(pricingJson?.data?.dailyRate ?? pricingJson?.dailyRate);
      if (Number.isFinite(rate) && rate > 0) dailyRate = rate;
    } catch {
      dailyRate = lockerPointFallbackPricingResponse().data.dailyRate;
    }

    const amountCents = Math.max(50, Math.round(dailyRate * days * 100));
    const origin = new URL(request.url).origin;
    const returnPath = String(body?.returnPath || "/area-clienti/locker-point");
    const email = recipientEmail.includes("@")
      ? recipientEmail
      : "noreply@agenziaplinio.it";

    const checkout = await createStripeCheckoutSession({
      amountCents,
      customerEmail: email,
      productName: "Fermo deposito / Locker Point",
      description: `${recipientName} · ${days} giorn${days === 1 ? "o" : "i"}`,
      successUrl: `${origin}${returnPath}?locker_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}${returnPath}?locker_checkout=cancel`,
      invoiceDescription: `Locker Point · ${expectedPickupDate}`,
      metadata: {
        service: "locker-point",
        amount_cents: String(amountCents),
        days: String(days),
        expected_pickup_date: expectedPickupDate,
        recipient_name: recipientName.slice(0, 100),
        customer_email: email,
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
