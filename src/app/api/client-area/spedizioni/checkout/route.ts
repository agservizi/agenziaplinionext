import { NextResponse } from "next/server";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";
import { resolveShippingPrice } from "@/lib/shipping-pricing-engine";

export const runtime = "nodejs";

function requireString(value: unknown) {
  return String(value || "").trim();
}

function requirePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const body = await request.json();
  const payload = {
    customerName: requireString(body?.customerName),
    email: requireString(body?.email).toLowerCase(),
    billingType: requireString(body?.billingType || "privato"),
    billingCompanyName: requireString(body?.billingCompanyName),
    billingVatNumber: requireString(body?.billingVatNumber).toUpperCase(),
    billingTaxCode: requireString(body?.billingTaxCode).toUpperCase(),
    billingRecipientCode: requireString(body?.billingRecipientCode).toUpperCase(),
    billingCertifiedEmail: requireString(body?.billingCertifiedEmail).toLowerCase(),
    billingAddress: requireString(body?.billingAddress),
    billingZIPCode: requireString(body?.billingZIPCode),
    billingCity: requireString(body?.billingCity),
    billingProvince: requireString(body?.billingProvince).toUpperCase(),
    destinationCountry: requireString(body?.destinationCountry || "IT").toUpperCase(),
    destinationCity: requireString(body?.destinationCity),
    parcelCount: requirePositiveNumber(body?.parcelCount),
    parcelLengthCM: requirePositiveNumber(body?.parcelLengthCM),
    parcelHeightCM: requirePositiveNumber(body?.parcelHeightCM),
    parcelDepthCM: requirePositiveNumber(body?.parcelDepthCM),
    weightKG: requirePositiveNumber(body?.weightKG),
    serviceCode: requireString(body?.serviceCode || "ritiro-nazionale"),
  };

  if (
    !payload.customerName ||
    !payload.email.includes("@") ||
    !payload.destinationCity ||
    !payload.parcelCount ||
    !payload.parcelLengthCM ||
    !payload.parcelHeightCM ||
    !payload.parcelDepthCM ||
    !payload.weightKG
  ) {
    return NextResponse.json(
      { message: "Compila i campi richiesti prima di procedere al pagamento." },
      { status: 400 },
    );
  }

  try {
    const volumeCM3 =
      payload.parcelCount *
      payload.parcelLengthCM *
      payload.parcelHeightCM *
      payload.parcelDepthCM;
    const volumeM3 = Number((volumeCM3 / 1_000_000).toFixed(4));
    const volumetricWeightKG = Number((volumeCM3 / 4000).toFixed(2));
    const taxableWeightKG = Math.max(payload.weightKG, volumetricWeightKG);
    const price = await resolveShippingPrice(
      taxableWeightKG,
      volumeM3,
      payload.destinationCountry,
    );
    const origin = new URL(request.url).origin;
    const checkout = await createStripeCheckoutSession({
      amountCents: price.amountCents,
      customerEmail: payload.email,
      description: `${payload.serviceCode} • ${payload.destinationCity} (${payload.destinationCountry})`,
      successUrl: `${origin}/area-clienti/spedizioni/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/area-clienti/spedizioni?shipment_checkout=cancel`,
      invoiceDescription: `Spedizione ${payload.serviceCode} per ${payload.customerName}`,
      metadata: {
        service_code: payload.serviceCode,
        destination_country: payload.destinationCountry,
        price_label: price.label,
        billing_type: payload.billingType || "privato",
        billing_name:
          payload.billingCompanyName || payload.customerName || "Cliente AG SERVIZI",
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
        message: "Reindirizzamento a Stripe per completare il pagamento.",
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
