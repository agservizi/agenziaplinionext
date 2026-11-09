/**
 * Callers: ticket attachment URLs from ticket route.
 * API: GET /api/client-area/ticket/file?name=
 * Schema: private files under .data/ticket-pratiche; session email ownership.
 * User: procedi con tutto al 100%
 */
import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { requireCustomerSession } from "@/lib/auth/api-guard";
import type { SessionPayload } from "@/lib/auth/session";

export const runtime = "nodejs";

async function resolveCustomerEmail(session: SessionPayload): Promise<string | null> {
  const fromUsername = String(session.username || "").trim().toLowerCase();
  if (fromUsername.includes("@")) return fromUsername;
  if (typeof session.userId === "number" && session.userId > 0) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT email FROM client_portal_users WHERE id = ? LIMIT 1`,
      [session.userId],
    );
    const email = String((rows as Array<{ email?: string }>)?.[0]?.email || "")
      .trim()
      .toLowerCase();
    if (email.includes("@")) return email;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = requireCustomerSession(request);
  if ("error" in auth) return auth.error;

  const email = await resolveCustomerEmail(auth.session);
  if (!email) {
    return NextResponse.json({ message: "Email profilo mancante." }, { status: 400 });
  }

  const name = String(request.nextUrl.searchParams.get("name") || "").trim();
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return NextResponse.json({ message: "File non valido." }, { status: 400 });
  }

  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id FROM client_area_tickets
     WHERE email = ? AND attachments_json LIKE ?
     LIMIT 1`,
    [email, `%${name}%`],
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ message: "Non autorizzato." }, { status: 403 });
  }

  const absolutePath = path.join(process.cwd(), ".data", "ticket-pratiche", name);
  try {
    const buffer = await fs.readFile(absolutePath);
    const ext = path.extname(name).toLowerCase();
    const type =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "application/octet-stream";
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Content-Disposition": `inline; filename="${name.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "File non trovato." }, { status: 404 });
  }
}
