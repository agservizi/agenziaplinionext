import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  gestiioCreatePractice,
  gestiioListPractices,
  gestiioUpdatePractice,
  type GestiioClientPortalPractice,
} from "@/lib/gestiio-client-portal";
import {
  linkGestiioClientPractice,
  listLinkedPracticeUuids,
  mirrorClientAreaRequest,
  requireGestiioPortalCustomer,
} from "@/lib/gestiio-client-portal-link";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function areaKeyFromSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "gestiio";
}

export async function GET(request: Request) {
  const customer = await requireGestiioPortalCustomer(request);
  if (!customer) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const url = new URL(request.url);
  const serviceSlug = url.searchParams.get("service_slug") || undefined;

  try {
    const linked = await listLinkedPracticeUuids(customer.clientIdentity, serviceSlug);
    let practices: GestiioClientPortalPractice[] = [];

    if (linked.length > 0) {
      const remote = await gestiioListPractices({
        customerEmail: customer.email || undefined,
        externalCustomerId: customer.externalCustomerId,
        serviceSlug,
        limit: 50,
      });
      const linkedSet = new Set(linked);
      practices = remote.filter((item) => linkedSet.has(item.uuid));
    }

    if (practices.length === 0) {
      practices = await gestiioListPractices({
        customerEmail: customer.email || undefined,
        externalCustomerId: customer.externalCustomerId,
        serviceSlug,
        limit: 50,
      });
    }

    return NextResponse.json({ practices });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossibile recuperare le pratiche Gestiio.",
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const customer = await requireGestiioPortalCustomer(request);
  if (!customer) {
    return NextResponse.json({ message: "Sessione non valida" }, { status: 401 });
  }

  const body = await request.json();
  const serviceSlug = String(body?.service_slug || "").trim();
  const serviceType = String(body?.service_type || "generico").trim();
  const customerEmail = String(body?.customer_email || customer.email || "")
    .trim()
    .toLowerCase();
  const customerName = String(body?.customer_name || customer.fullName || "").trim();
  const customerPhone = String(body?.customer_phone || customer.phone || "").trim();
  const notes = String(body?.notes || "").trim();
  const payload =
    body?.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};
  const paymentRequired = Boolean(body?.payment_required);
  const amountCents = Number(body?.amount_cents) || 1500;

  if (!serviceSlug) {
    return NextResponse.json({ message: "Servizio non valido." }, { status: 400 });
  }
  if (!customerEmail.includes("@")) {
    return NextResponse.json({ message: "Email obbligatoria." }, { status: 422 });
  }

  try {
    const practice = await gestiioCreatePractice({
      service_slug: serviceSlug,
      external_customer_id: customer.externalCustomerId,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: paymentRequired ? "waiting_payment" : "new",
      payment_status: paymentRequired ? "pending" : "unpaid",
      payload: { ...payload, notes },
      meta: {
        source: "area-clienti",
        service_type: serviceType,
        ...(serviceSlug === "contratti-energia" || serviceSlug === "contratti-telefonia"
          ? { segnalazione: true, attribuzione: "portale" }
          : {}),
      },
    });

    const localRequestId = await mirrorClientAreaRequest({
      area: areaKeyFromSlug(serviceSlug),
      serviceType,
      customer: { ...customer, email: customerEmail, fullName: customerName, phone: customerPhone },
      gestiioPracticeUuid: practice.uuid,
      payload: { ...payload, notes },
      status: paymentRequired ? "waiting_payment" : "new",
    });

    await linkGestiioClientPractice({
      clientIdentity: customer.clientIdentity,
      practiceUuid: practice.uuid,
      serviceSlug,
      serviceType,
      status: practice.status,
      paymentStatus: practice.payment_status,
      localRequestId,
    });

    let checkoutUrl: string | undefined;
    if (paymentRequired && isStripeConfigured()) {
      const origin = new URL(request.url).origin;
      const returnPath = `/area-clienti/${encodeURIComponent(serviceSlug)}`;
      const checkout = await createStripeCheckoutSession({
        amountCents,
        customerEmail,
        productName: `Pratica ${serviceSlug}`,
        description: `Servizio area clienti · ${serviceType}`,
        successUrl: `${origin}${returnPath}?checkout=success&uuid=${encodeURIComponent(practice.uuid)}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}${returnPath}?checkout=cancel&uuid=${encodeURIComponent(practice.uuid)}`,
        invoiceDescription: `Gestiio · ${serviceSlug} · ${practice.uuid}`,
        metadata: {
          service: "gestiio-client-portal",
          gestiio_practice_uuid: practice.uuid,
          service_slug: serviceSlug,
          client_identity_hash: createHash("sha256")
            .update(customer.clientIdentity)
            .digest("hex"),
          amount_cents: String(amountCents),
        },
      });

      if (checkout.id && checkout.url) {
        checkoutUrl = checkout.url;
        await gestiioUpdatePractice(practice.uuid, {
          stripe_session_id: checkout.id,
          payment_status: "pending",
          amount: amountCents / 100,
          currency: "eur",
        });
      }
    }

    return NextResponse.json(
      {
        practice,
        checkoutUrl,
        message: checkoutUrl
          ? "Pratica creata. Completa il pagamento per proseguire."
          : "Pratica registrata. Ti ricontattiamo a breve.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Gestiio practice create failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Apertura pratica temporaneamente non disponibile.",
      },
      { status: 502 },
    );
  }
}
