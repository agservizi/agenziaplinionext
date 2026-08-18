import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SendWebhookPayload = {
  event?: string;
  event_id?: string;
  occurred_at?: string;
  data?: {
    uuid?: string;
    request_number?: string;
    from_status?: string;
    status?: string;
    reason?: string | null;
    documents?: unknown[];
  };
};

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.GESTIIO_SEND_WEBHOOK_SECRET?.trim();
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function ensureWebhookTable() {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS gestiio_send_webhook_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      event_id CHAR(36) NOT NULL,
      event_name VARCHAR(100) NOT NULL,
      send_uuid CHAR(36) NULL,
      request_number VARCHAR(100) NULL,
      from_status VARCHAR(50) NULL,
      status VARCHAR(50) NULL,
      payload JSON NOT NULL,
      occurred_at DATETIME NULL,
      received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_gestiio_send_event_id (event_id),
      KEY idx_gestiio_send_uuid (send_uuid),
      KEY idx_gestiio_send_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-gestiio-signature"))) {
    return NextResponse.json(
      { success: false, error: "INVALID_SIGNATURE" },
      { status: 401 },
    );
  }

  let payload: SendWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SendWebhookPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_JSON" },
      { status: 400 },
    );
  }

  const eventId = request.headers.get("x-gestiio-event-id") || payload.event_id;
  const eventName = request.headers.get("x-gestiio-event") || payload.event;
  if (!eventId || !eventName || !payload.data?.uuid) {
    return NextResponse.json(
      { success: false, error: "INVALID_PAYLOAD" },
      { status: 422 },
    );
  }

  await ensureWebhookTable();
  const occurredAt = payload.occurred_at
    ? new Date(payload.occurred_at).toISOString().slice(0, 19).replace("T", " ")
    : null;

  const [result] = await getPool().execute(
    `INSERT IGNORE INTO gestiio_send_webhook_events
      (event_id, event_name, send_uuid, request_number, from_status, status, payload, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
    [
      eventId,
      eventName,
      payload.data.uuid,
      payload.data.request_number || null,
      payload.data.from_status || null,
      payload.data.status || null,
      rawBody,
      occurredAt,
    ],
  );

  await getPool()
    .execute(
      `UPDATE gestiio_send_client_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE send_uuid = ?`,
      [payload.data.status || "unknown", payload.data.uuid],
    )
    .catch(() => undefined);

  const duplicate = "affectedRows" in result && result.affectedRows === 0;
  return NextResponse.json({ success: true, duplicate });
}
