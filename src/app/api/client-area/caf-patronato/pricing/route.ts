import { NextResponse } from "next/server";
import {
  isCafPatronatoDatabaseConfigured,
  listPublicCafPatronatoPricingRules,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST() {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ rules: [] }, { status: 200 });
  }

  try {
    const rules = await listPublicCafPatronatoPricingRules();
    return NextResponse.json({ rules }, { status: 200 });
  } catch {
    return NextResponse.json({ rules: [] }, { status: 200 });
  }
}
