import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { cancelOrder, fetchOrderById, refundOrder } from "@/lib/saleor/admin-ops";
import { fetchShopOrders } from "@/lib/saleor/client";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const detail = await fetchOrderById(id);
    return NextResponse.json(detail, { status: detail.ok ? 200 : 404 });
  }

  if (!process.env.SALEOR_APP_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "SALEOR_APP_TOKEN missing", orders: [], totalCount: 0 },
      { status: 503 },
    );
  }

  const result = await fetchShopOrders(50);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, orders: [], totalCount: 0 },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, orders: result.orders, totalCount: result.totalCount });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    action?: "cancel" | "refund";
    orderId?: string;
    amount?: number;
  };

  if (!body.orderId) {
    return NextResponse.json({ ok: false, error: "orderId required" }, { status: 400 });
  }

  if (body.action === "refund") {
    const auth = requireStaffSession(request, "refund");
    if ("error" in auth) return auth.error;
    const result = await refundOrder(body.orderId, body.amount);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;

  const result = await cancelOrder(body.orderId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
