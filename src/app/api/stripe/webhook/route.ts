import { NextRequest, NextResponse } from "next/server";
import {
  gestiioSendRequest,
  markSendCheckoutPaid,
} from "@/lib/gestiio-send";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Stripe signature verification using crypto
  const crypto = await import("crypto");
  const parts = signature.split(",");
  const timestamp = parts.find(p => p.startsWith("t="))?.slice(2);
  const v1Signature = parts.find(p => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !v1Signature) {
    return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
  }

  const signedPayload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  const actualSignature = Buffer.from(v1Signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    actualSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignatureBuffer)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Verify timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return NextResponse.json({ error: "Timestamp too old" }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (
        session?.payment_status === "paid" &&
        session?.metadata?.service === "send" &&
        session?.metadata?.send_uuid
      ) {
        const amountCents = Number(session.amount_total);
        const expectedAmount = Number(session.metadata.amount_cents);
        if (
          Number.isInteger(amountCents) &&
          amountCents > 0 &&
          amountCents === expectedAmount &&
          String(session.currency || "").toLowerCase() === "eur"
        ) {
          await markSendCheckoutPaid({
            uuid: String(session.metadata.send_uuid),
            sessionId: String(session.id),
            amountCents,
            currency: String(session.currency),
          });
          await gestiioSendRequest(
            `/richieste/${encodeURIComponent(String(session.metadata.send_uuid))}/invia`,
            { method: "POST" },
          ).catch(() => undefined);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.log(`[Stripe Webhook] payment_intent.payment_failed: ${intent.id}`);
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
