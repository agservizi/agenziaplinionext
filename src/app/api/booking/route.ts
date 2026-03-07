import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function POST() {
  return NextResponse.json(
    { message: "API booking gestite dal backend PHP in produzione/export." },
    { status: 410 },
  );
}
