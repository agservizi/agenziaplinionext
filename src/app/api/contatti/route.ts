import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { message: "Database non configurato" },
      { status: 503 },
    );
  }

  const body = await request.json();
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim();
  const service = String(body?.service || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { message: "Compila tutti i campi obbligatori." },
      { status: 400 },
    );
  }

  const pool = getPool();
  await pool.execute(
    "INSERT INTO contact_requests (name, email, service, message) VALUES (?, ?, ?, ?)",
    [name, email, service, message],
  );

  return NextResponse.json({ message: "Richiesta ricevuta" }, { status: 200 });
}
