import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  clientOwnsSendRequest,
  recordSendCheckout,
  requireSendClientIdentity,
  resolveSendPrice,
} from "@/lib/gestiio-send";
import {
  createStripeCheckoutSession,
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
  const email = String(body?.email || "").trim().toLowerCase();
  const returnPath =
    body?.returnPath === "/area-clienti/send" ? "/area-clienti/send" : "/send";
  if (!email.includes("@")) {
    return NextResponse.json(
      { message: "Inserisci un indirizzo email valido per il pagamento." },
      { status: 422 },
    );
  }

  try {
    const price = await resolveSendPrice();
    const origin = new URL(request.url).origin;
    const checkout = await createStripeCheckoutSession({
      amountCents: price.amountCents,
      customerEmail: email,
      productName: "Pratica SEND",
      description: "Gestione notifica digitale SEND",
      successUrl: `${origin}${returnPath}?send_checkout=success&session_id={CHECKOUT_SESSION_ID}&uuid=${encodeURIComponent(uuid)}`,
      cancelUrl: `${origin}${returnPath}?send_checkout=cancel&uuid=${encodeURIComponent(uuid)}`,
      invoiceDescription: `Servizio SEND • pratica ${uuid}`,
      metadata: {
        service: "send",
        send_uuid: uuid,
        client_identity_hash: createHash("sha256").update(identity).digest("hex"),
        amount_cents: String(price.amountCents),
      },
    });
    if (!checkout.id || !checkout.url) {
      throw new Error("Checkout Stripe non disponibile");
    }
    await recordSendCheckout({
      clientIdentity: identity,
      uuid,
      sessionId: checkout.id,
      amountCents: price.amountCents,
      currency: price.currency,
    });
    return NextResponse.json({
      url: checkout.url,
      amountCents: price.amountCents,
      currency: price.currency,
      priceLabel: price.label,
    });
  } catch (error) {
    console.error(
      "SEND Stripe checkout failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return NextResponse.json(
      {
        message:
          "Il pagamento non è temporaneamente disponibile. Riprova tra qualche minuto o contattaci.",
      },
      { status: 502 },
    );
  }
}
