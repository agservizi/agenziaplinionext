import { NextResponse } from "next/server";
import { verifyGestiioClientPortalWebhookSignature } from "@/lib/gestiio-client-portal";
import {
  syncClientAreaRequestByGestiioUuid,
  updateLinkedGestiioPracticeStatus,
} from "@/lib/gestiio-client-portal-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientPortalWebhookPayload = {
  event?: string;
  event_id?: string;
  data?: {
    uuid?: string;
    practice_uuid?: string;
    status?: string;
    payment_status?: string;
    service_slug?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-gestiio-signature") || request.headers.get("x-signature");

  const valid = await verifyGestiioClientPortalWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ success: false, error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  let payload: ClientPortalWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ClientPortalWebhookPayload;
  } catch {
    return NextResponse.json({ success: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const practiceUuid = payload.data?.uuid || payload.data?.practice_uuid;
  const status = payload.data?.status;
  const paymentStatus = payload.data?.payment_status;
  if (!practiceUuid || !status) {
    return NextResponse.json({ success: false, error: "INVALID_PAYLOAD" }, { status: 422 });
  }

  await updateLinkedGestiioPracticeStatus(practiceUuid, status, paymentStatus);
  await syncClientAreaRequestByGestiioUuid(practiceUuid, status);

  return NextResponse.json({ success: true });
}
