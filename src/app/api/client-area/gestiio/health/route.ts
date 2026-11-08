import { NextResponse } from "next/server";
import { gestiioClientPortalHealth } from "@/lib/gestiio-client-portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await gestiioClientPortalHealth();
    return NextResponse.json({ ok: true, gestiio: data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Health check fallito",
      },
      { status: 503 },
    );
  }
}
