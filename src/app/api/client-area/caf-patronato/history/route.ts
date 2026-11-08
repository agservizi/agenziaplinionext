/**
 * Callers: CafPatronatoHistory (/area-clienti/caf-patronato/storico).
 * API: POST /api/client-area/caf-patronato/history { token? } → { requests[] }.
 * Schema: client_area_requests + client_area_caf_requests + client_area_caf_files + payments.
 * User: "/area-clienti/caf-patronato/storico Unexpected token 'I', \"Internal S\"... is not valid JSON"
 */
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  requestOwnedByActor,
  resolveClientAreaActor,
} from "@/lib/client-area-auth";
import {
  ensureCafPatronatoTables,
  isCafPatronatoDatabaseConfigured,
  listCafPatronatoHistory,
} from "@/lib/caf-patronato-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDetails(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const auth = await resolveClientAreaActor(request, String(body?.token || ""));
  if ("error" in auth) {
    return NextResponse.json({ requests: [], message: auth.error }, { status: auth.status });
  }

  if (!isCafPatronatoDatabaseConfigured()) {
    return NextResponse.json(
      { requests: [], message: "Database non configurato" },
      { status: 503 },
    );
  }

  try {
    await ensureCafPatronatoTables();
    const pool = getPool();
    const [ownershipRows] = await pool.query(
      `SELECT r.id AS request_id, r.email, r.details_json
       FROM client_area_requests r
       INNER JOIN client_area_caf_requests c ON c.request_id = r.id
       WHERE r.area = 'caf-patronato'
       ORDER BY r.created_at DESC
       LIMIT 100`,
    );

    const allowedIds = new Set<number>();
    for (const row of Array.isArray(ownershipRows)
      ? (ownershipRows as Record<string, unknown>[])
      : []) {
      const requestId = Number(row.request_id || 0);
      if (!requestId) continue;
      const details = parseDetails(row.details_json);
      const email = String(row.email || "");
      if (requestOwnedByActor(details, email, auth.actor)) {
        allowedIds.add(requestId);
      }
    }

    const all = await listCafPatronatoHistory();
    const requests = all.filter((item) => allowedIds.has(Number(item.requestId || 0)));
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json(
      {
        requests: [],
        message:
          error instanceof Error
            ? error.message
            : "Impossibile recuperare lo storico pratiche.",
      },
      { status: 500 },
    );
  }
}
