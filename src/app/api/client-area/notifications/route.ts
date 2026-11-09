import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireCustomerSession } from "@/lib/auth/api-guard";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = requireCustomerSession(request);
  if ("error" in auth) return auth.error;
  if (!auth.session.userId) {
    return NextResponse.json({
      ok: true,
      prefs: {
        order_confirm: 1,
        shipped: 1,
        digital_ready: 1,
        service_update: 1,
        marketing: 0,
      },
    });
  }
    const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT * FROM client_notification_prefs WHERE client_user_id = ? LIMIT 1`,
    [auth.session.userId],
  );
  return NextResponse.json({
    ok: true,
    prefs: rows[0] || {
      order_confirm: 1,
      shipped: 1,
      digital_ready: 1,
      service_update: 1,
      marketing: 0,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = requireCustomerSession(request);
  if ("error" in auth) return auth.error;
  if (!auth.session.userId) {
    return NextResponse.json({ ok: false, error: "Account incompleto" }, { status: 400 });
  }

  const body = (await request.json()) as Record<string, boolean | string>;
    await getPool().execute(
    `INSERT INTO client_notification_prefs
      (client_user_id, order_confirm, shipped, digital_ready, service_update, marketing)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       order_confirm = VALUES(order_confirm),
       shipped = VALUES(shipped),
       digital_ready = VALUES(digital_ready),
       service_update = VALUES(service_update),
       marketing = VALUES(marketing)`,
    [
      auth.session.userId,
      body.order_confirm === true || body.order_confirm === "true" ? 1 : 0,
      body.shipped === true || body.shipped === "true" ? 1 : 0,
      body.digital_ready === true || body.digital_ready === "true" ? 1 : 0,
      body.service_update === true || body.service_update === "true" ? 1 : 0,
      body.marketing === true || body.marketing === "true" ? 1 : 0,
    ],
  );
  return NextResponse.json({ ok: true });
}
