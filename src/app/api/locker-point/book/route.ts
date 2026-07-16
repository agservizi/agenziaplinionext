import { type NextRequest, NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const body = await request.json();

    if (!body?.recipientName || !body?.expectedPickupDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message:
              "Campi obbligatori: recipientName, expectedPickupDate.",
          },
        },
        { status: 400 },
      );
    }

    const payload = {
      recipientName: String(body.recipientName).trim(),
      expectedPickupDate: String(body.expectedPickupDate).trim(),
      recipientEmail: body.recipientEmail
        ? String(body.recipientEmail).trim()
        : undefined,
      recipientPhone: body.recipientPhone
        ? String(body.recipientPhone).trim()
        : undefined,
      senderName: body.senderName
        ? String(body.senderName).trim()
        : undefined,
      senderPhone: body.senderPhone
        ? String(body.senderPhone).trim()
        : undefined,
      carrier: body.carrier ? String(body.carrier).trim() : undefined,
      trackingCode: body.trackingCode
        ? String(body.trackingCode).trim()
        : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
    };

    const res = await fetch(`${LOCKER_POINT_API_BASE}/book`, {
      method: "POST",
      headers: lockerPointHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Servizio non disponibile.",
        },
      },
      { status: 502 },
    );
  }
}
