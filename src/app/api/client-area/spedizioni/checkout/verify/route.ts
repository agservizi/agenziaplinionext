import { NextResponse } from "next/server";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato." }, { status: 503 });
  }

  const body = await request.json();
  const sessionId = String(body?.sessionId || "").trim();

  if (!sessionId) {
    return NextResponse.json({ message: "Sessione Stripe mancante." }, { status: 400 });
  }

  try {
    const session = await getStripeCheckoutSession(sessionId);
    const paid = session.status === "complete" && session.paymentStatus === "paid";

    if (!paid) {
      return NextResponse.json(
        { message: "Pagamento non ancora confermato da Stripe." },
        { status: 402 },
      );
    }

    return NextResponse.json(
      {
        paid: true,
        amountTotal: session.amountTotal,
        currency: session.currency,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Verifica pagamento Stripe non riuscita.",
      },
      { status: 502 },
    );
  }
}
