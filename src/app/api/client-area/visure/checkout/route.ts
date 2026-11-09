import { NextResponse } from "next/server";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import {
  supportedVisuraServices,
  type SupportedVisuraService,
} from "@/lib/openapi-visure";
import { resolveDatabaseVisuraPrice } from "@/lib/visure-pricing-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Callers: OpenApiVisureWorkspace checkout submit.
 * Schema: { url, amountCents, priceLabel, message }. Replaces PHP checkout rewrite.
 * User: /area-clienti/visure Servizio visure non disponibile.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const serviceType = String(body?.serviceType || "").trim() as SupportedVisuraService;
  const customerName = String(body?.customerName || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();

  if (
    !supportedVisuraServices.includes(serviceType) ||
    !customerName ||
    !email.includes("@")
  ) {
    return NextResponse.json(
      {
        message:
          "Compila almeno nome, email e tipologia di visura prima del pagamento.",
      },
      { status: 400 },
    );
  }

  try {
    const price = await resolveDatabaseVisuraPrice(serviceType);
    const origin = new URL(request.url).origin;
    const checkout = await createStripeCheckoutSession({
      amountCents: price.amountCents,
      customerEmail: email,
      description: `${price.label} • ${serviceType}`,
      successUrl: `${origin}/area-clienti/visure/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/area-clienti/visure?visura_checkout=cancel`,
      invoiceDescription: `${price.label} per ${customerName}`,
      metadata: {
        service_type: serviceType,
        price_label: price.label,
        customer_name: customerName,
      },
    });

    if (!checkout.url) {
      throw new Error("URL checkout Stripe non disponibile.");
    }

    return NextResponse.json({
      url: checkout.url,
      amountCents: price.amountCents,
      priceLabel: price.label,
      message: "Reindirizzamento a Stripe per completare il pagamento della visura.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message
            ? error.message
            : "Creazione checkout Stripe non riuscita.",
      },
      { status: 502 },
    );
  }
}
