import { NextResponse } from "next/server";
import {
  finalizeCafPatronatoCheckout,
  isCafPatronatoDatabaseConfigured,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  const body = await request.json();
  const draftToken = String(body?.draftToken || "").trim();
  const stripeSessionId = String(body?.stripeSessionId || "").trim();

  if (!draftToken || !stripeSessionId) {
    return NextResponse.json(
      { message: "Pagamento o pratica non trovati. Riparti dal modulo." },
      { status: 400 },
    );
  }

  try {
    const result = await finalizeCafPatronatoCheckout({
      draftToken,
      stripeSessionId,
    });

    return NextResponse.json(
      {
        message:
          "Pagamento confermato e pratica inviata al team. Il patronato ha già ricevuto il link operativo.",
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Pagamento presente, ma la pratica non è stata finalizzata.",
      },
      { status: 502 },
    );
  }
}
