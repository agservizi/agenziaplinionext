import { NextResponse } from "next/server";
import { resolveCafPatronatoFileDownload } from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body?.token || "").trim();

  if (!token) {
    return NextResponse.json({ message: "Token file mancante." }, { status: 400 });
  }

  try {
    const file = await resolveCafPatronatoFileDownload(token);
    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    );
    headers.set("Cache-Control", "private, max-age=0, must-revalidate");

    return new NextResponse(file.buffer, { status: 200, headers });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Impossibile scaricare il file.",
      },
      { status: 400 },
    );
  }
}
