import { NextResponse } from "next/server";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";
import { resolveDatabaseVisuraPrice } from "@/lib/visure-pricing-engine";
import {
  supportedVisuraServices,
  type SupportedVisuraService,
} from "@/lib/openapi-visure";

export const runtime = "nodejs";

function requireString(value: unknown) {
  return String(value || "").trim();
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const body = await request.json();
  const serviceType = requireString(body?.serviceType);
  const customerName = requireString(body?.customerName);
  const email = requireString(body?.email).toLowerCase();

  if (
    !supportedVisuraServices.includes(serviceType as SupportedVisuraService) ||
    !customerName ||
    !email.includes("@")
  ) {
    return NextResponse.json(
      { message: "Compila almeno nome, email e tipologia di visura prima del pagamento." },
      { status: 400 },
    );
  }

  try {
    const price = await resolveDatabaseVisuraPrice(serviceType as SupportedVisuraService);
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

    return NextResponse.json(
      {
        url: checkout.url,
        amountCents: price.amountCents,
        priceLabel: price.label,
        message: "Reindirizzamento a Stripe per completare il pagamento della visura.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Creazione checkout Stripe non riuscita.",
      },
      { status: 502 },
    );
  }
}
