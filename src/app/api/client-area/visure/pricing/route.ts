import { NextResponse } from "next/server";
import { fetchGestiioVisureListino } from "@/lib/gestiio-listini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Callers: OpenApiVisureWorkspace. Replaces MySQL listino. User: procedi. */
export async function POST() {
  try {
    const rules = await fetchGestiioVisureListino();
    return NextResponse.json({ rules, source: "gestiio" });
  } catch (error) {
    const status = (error as { status?: number })?.status || 502;
    return NextResponse.json(
      {
        rules: [],
        message:
          error instanceof Error ? error.message : "Listino visure non disponibile",
      },
      { status },
    );
  }
}

export async function GET() {
  return POST();
}
