import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { fetchOrderById } from "@/lib/saleor/admin-ops";
import {
  createServiceRequestFromShop,
  issueDigitalEntitlement,
  mirrorSaleorOrder,
} from "@/lib/saleor/order-mirror";

/**
 * Saleor webhook receiver — fail closed without secret.
 * Mirrors orders into MySQL and issues DIGITAL entitlements / SERVICE requests.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SALEOR_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const raw = await request.text();
  const signature =
    request.headers.get("saleor-signature") ||
    request.headers.get("x-saleor-signature") ||
    "";

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.replace(/^sha256=/i, ""));
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    type?: string;
    id?: string;
    order?: { id?: string };
    [key: string]: unknown;
  } = {};
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = String(payload.type || "").toUpperCase();
  const orderId =
    payload.order?.id ||
    (typeof payload.id === "string" && eventType.includes("ORDER") ? payload.id : null);

  if (orderId && process.env.MYSQL_HOST && process.env.SALEOR_APP_TOKEN) {
    const detail = await fetchOrderById(orderId);
    if (detail.ok && detail.order) {
      const order = detail.order;
      const { clientUserId } = await mirrorSaleorOrder({
        saleorOrderId: order.id,
        email: order.userEmail,
        status: order.status,
        totalAmount: order.total?.gross?.amount ?? null,
        currency: order.total?.gross?.currency || "EUR",
        payload: order,
      });

      if (clientUserId && order.userEmail) {
        for (const line of order.lines || []) {
          const name = (line.productName || "").toLowerCase();
          const isDigital =
            name.includes("digital") ||
            name.includes("download") ||
            name.includes("pdf") ||
            name.includes("licenza");
          const isService =
            name.includes("service") ||
            name.includes("servizio") ||
            name.includes("pratica") ||
            name.includes("consulenza");

          if (isDigital) {
            await issueDigitalEntitlement({
              clientUserId,
              saleorOrderId: order.id,
              saleorLineId: line.id,
              assetKey: `saleor:${order.id}:${line.id}`,
              maxDownloads: 5,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            });
          }

          if (isService) {
            await createServiceRequestFromShop({
              clientUserId,
              email: order.userEmail,
              customerName: order.userEmail.split("@")[0] || "Cliente",
              saleorOrderId: order.id,
              productName: line.productName,
            });
          }
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    received: payload.type || "unknown",
    id: orderId || payload.id || null,
  });
}
