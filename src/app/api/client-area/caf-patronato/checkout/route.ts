import { NextResponse } from "next/server";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";
import {
  createCafPatronatoCheckoutDraft,
  isCafPatronatoDatabaseConfigured,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const formData = await request.formData();
  const customerName = String(formData.get("customerName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const scope = String(formData.get("scope") || "").trim() as "caf" | "patronato";
  const serviceType = String(formData.get("serviceType") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const preferredContactMethod = String(formData.get("preferredContactMethod") || "").trim();
  const preferredContactDate = String(formData.get("preferredContactDate") || "").trim();
  const documentSummary = String(formData.get("documentSummary") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!customerName || !email.includes("@") || !serviceType || (scope !== "caf" && scope !== "patronato")) {
    return NextResponse.json(
      { message: "Compila nominativo, email, ambito e servizio prima del pagamento." },
      { status: 400 },
    );
  }

  try {
    const draft = await createCafPatronatoCheckoutDraft({
      customerName,
      email,
      phone,
      scope,
      serviceType,
      urgency,
      preferredContactMethod,
      preferredContactDate,
      documentSummary,
      notes,
      files,
    });

    const origin = new URL(request.url).origin;
    const checkout = await createStripeCheckoutSession({
      amountCents: draft.amountCents,
      customerEmail: email,
      description: `${draft.priceLabel} • ${draft.serviceLabel}`,
      productName: "Pratica CAF e Patronato AG SERVIZI",
      successUrl: `${origin}/area-clienti/caf-patronato/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/area-clienti/caf-patronato?caf_checkout=cancel`,
      invoiceDescription: `${draft.priceLabel} per ${customerName}`,
      metadata: {
        service_type: serviceType,
        draft_token: draft.draftToken,
        customer_name: customerName,
        scope,
      },
    });

    if (!checkout.url) {
      throw new Error("URL checkout Stripe non disponibile.");
    }

    return NextResponse.json(
      {
        url: checkout.url,
        draftToken: draft.draftToken,
        amountCents: draft.amountCents,
        priceLabel: draft.priceLabel,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Pagamento pratica CAF/Patronato non avviato.",
      },
      { status: 502 },
    );
  }
}
