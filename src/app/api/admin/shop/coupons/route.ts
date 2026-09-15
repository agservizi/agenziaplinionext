import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/api-guard";
import { createVoucher, listVouchers } from "@/lib/saleor/admin-ops";

export async function GET(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_read");
  if ("error" in auth) return auth.error;
  const result = await listVouchers(50);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function POST(request: NextRequest) {
  const auth = requireStaffSession(request, "shop_write");
  if ("error" in auth) return auth.error;
  const body = (await request.json()) as {
    code?: string;
    discountValue?: number;
    type?: "PERCENTAGE" | "FIXED";
    minSpent?: number;
  };
  if (!body.code || body.discountValue == null) {
    return NextResponse.json({ ok: false, error: "code and discountValue required" }, { status: 400 });
  }
  const result = await createVoucher({
    code: body.code.trim().toUpperCase(),
    discountValue: Number(body.discountValue),
    type: body.type === "FIXED" ? "FIXED" : "PERCENTAGE",
    minSpent: body.minSpent,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
