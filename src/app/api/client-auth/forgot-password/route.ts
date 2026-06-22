import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email obbligatoria." }, { status: 400 });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, email FROM client_portal_users WHERE LOWER(email) = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    // Always return success to prevent email enumeration
    const successMessage = "Se l'email e registrata, riceverai le istruzioni per il reset.";

    if (!Array.isArray(rows) || !rows[0]) {
      return NextResponse.json({ message: successMessage });
    }

    // TODO: Send actual reset email via Resend
    // For now, just log the request
    console.log(`[Password Reset] Requested for: ${email}`);

    return NextResponse.json({ message: successMessage });
  } catch {
    return NextResponse.json({ message: "Operazione non riuscita." }, { status: 500 });
  }
}
