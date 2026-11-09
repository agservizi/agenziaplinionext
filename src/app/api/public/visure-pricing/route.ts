import { NextResponse } from "next/server";
import { fetchGestiioVisureListino } from "@/lib/gestiio-listini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Callers: visure-pricing-public client. User: procedi. */
export async function GET() {
  try {
    const rules = await fetchGestiioVisureListino();
    return NextResponse.json({
      rules: rules
        .filter((r) => r.active)
        .map((r) => ({
          serviceType: r.serviceType,
          label: r.label,
          priceEUR: r.priceEUR,
        })),
      source: "gestiio",
    });
  } catch (error) {
    return NextResponse.json(
      {
        rules: [],
        message:
          error instanceof Error ? error.message : "Listino visure non disponibile",
      },
      { status: 502 },
    );
  }
}
