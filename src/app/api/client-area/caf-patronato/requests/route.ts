import { NextResponse } from "next/server";
import {
  createCafPatronatoRequest,
  isCafPatronatoDatabaseConfigured,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function POST(request: Request) {
  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  const formData = await request.formData();
  const customerName = String(formData.get("customerName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const scope = String(formData.get("scope") || "").trim() as "caf" | "patronato";
  const serviceType = String(formData.get("serviceType") || "").trim();
  const urgency = String(formData.get("urgency") || "").trim();
  const preferredContactMethod = String(formData.get("preferredContactMethod") || "").trim();
  const preferredContactDate = String(formData.get("preferredContactDate") || "").trim();
  const documentSummary = String(formData.get("documentSummary") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!customerName || !email.includes("@") || !serviceType || (scope !== "caf" && scope !== "patronato")) {
    return NextResponse.json(
      { message: "Compila nominativo, email, ambito e servizio prima di inviare la pratica." },
      { status: 400 },
    );
  }

  try {
    const result = await createCafPatronatoRequest({
      customerName,
      email,
      phone,
      scope,
      serviceType,
      urgency,
      preferredContactMethod,
      preferredContactDate,
      documentSummary,
      notes,
      files,
    });

    return NextResponse.json(
      {
        message:
          result.emailStatus === "sent"
            ? "Pratica registrata. Il patronato ha già ricevuto il link operativo per la presa in carico."
            : "Pratica registrata. Il team controllerà la richiesta e abiliterà la presa in carico appena possibile.",
        requestId: result.requestId,
        emailStatus: result.emailStatus,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Impossibile registrare la pratica CAF o Patronato.",
      },
      { status: 500 },
    );
  }
}
