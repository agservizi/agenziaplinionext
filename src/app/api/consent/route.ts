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
  const body = await request.json();

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }

  const pool = getPool();
  await pool.execute(
    "INSERT INTO consent_logs (consent_version, consent_payload, consent_date, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
    [
      String(body?.version || ""),
      JSON.stringify(body || {}),
      new Date().toISOString(),
      request.headers.get("x-forwarded-for") || "",
      request.headers.get("user-agent") || "",
    ],
  );

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
