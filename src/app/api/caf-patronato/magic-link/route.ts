import { NextResponse } from "next/server";
import {
  completeCafPatronatoMagicLink,
  getCafPatronatoMagicLinkRequest,
  isCafPatronatoDatabaseConfigured,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  const contentType = String(request.headers.get("content-type") || "");

  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const token = String(body?.token || "").trim();
      if (!token) {
        return NextResponse.json({ message: "Token pratica mancante." }, { status: 400 });
      }

      const requestData = await getCafPatronatoMagicLinkRequest(token);
      return NextResponse.json({ request: requestData }, { status: 200 });
    }

    const formData = await request.formData();
    const token = String(formData.get("token") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const operatorNotes = String(formData.get("operatorNotes") || "").trim();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!token) {
      return NextResponse.json({ message: "Token pratica mancante." }, { status: 400 });
    }

    const result = await completeCafPatronatoMagicLink({
      token,
      status,
      operatorNotes,
      files,
    });

    return NextResponse.json(
      {
        message:
          result.status === "completed"
            ? "Pratica evasa e documento caricato correttamente."
            : "Pratica aggiornata e rimessa in lavorazione.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile aggiornare la pratica dal link.",
      },
      { status: 400 },
    );
  }
}
