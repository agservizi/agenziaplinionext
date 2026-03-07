import { NextResponse } from "next/server";
import { listDatabaseVisurePricingRules } from "@/lib/visure-pricing-engine";

export const runtime = "nodejs";

export async function POST() {
  try {
    const rules = await listDatabaseVisurePricingRules();
    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        rules: [],
        message:
          error instanceof Error
            ? error.message
            : "Caricamento listino visure non riuscito.",
      },
      { status: 500 },
    );
  }
}

