import fs from "node:fs";

fs.writeFileSync(
  "src/app/area-clienti/documenti/page.tsx",
  `import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { readCustomerSession } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { getCustomerEmailByUserId, listCustomerInvoices } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientDocumentiPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const email =
    (userId ? await getCustomerEmailByUserId(userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);

  const invoices = await listCustomerInvoices(userId, email);

  let serviceDocs: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST && (userId || email)) {
    try {
      const [rows] = await getPool().query<RowDataPacket[]>(
        \`SELECT id, area, service_type, status, created_at
         FROM client_area_requests
         WHERE (
           CAST(JSON_EXTRACT(details_json, '$.clientUserId') AS UNSIGNED) = ?
           OR LOWER(email) = LOWER(?)
         )
         ORDER BY id DESC LIMIT 50\`,
        [userId || 0, email || ""],
      );
      serviceDocs = rows;
    } catch {
      serviceDocs = [];
    }
  }

  const hasAny = invoices.length > 0 || serviceDocs.length > 0;

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Documenti"
      description="Hub CAF / visure / fatture — solo tuoi."
    >
      {!hasAny ? (
        <ModuleNotice tone="client" variant="empty">
          Nessun documento pronto.
        </ModuleNotice>
      ) : (
        <div className="space-y-6">
          {invoices.length > 0 ? (
            <ModuleTable
              tone="client"
              headers={["Fattura", "Stato", ""]}
              rows={invoices.map((r) => [
                \`#\${r.id}\`,
                String(r.status),
                r.invoice_pdf_url ? (
                  <a
                    key={String(r.id)}
                    href={String(r.invoice_pdf_url)}
                    className="font-semibold text-[#5E0ED7] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    PDF
                  </a>
                ) : (
                  "—"
                ),
              ])}
            />
          ) : null}
          {serviceDocs.length > 0 ? (
            <ModuleTable
              tone="client"
              headers={["Pratica", "Area", "Stato", "Data"]}
              rows={serviceDocs.map((r) => [
                String(r.service_type),
                String(r.area),
                String(r.status),
                r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
              ])}
            />
          ) : null}
        </div>
      )}
    </ModuleFrame>
  );
}
`,
);

// locker pricing fail-closed
let lockerPricing = fs.readFileSync("src/app/api/locker-point/pricing/route.ts", "utf8");
lockerPricing = `import { NextResponse } from "next/server";
import {
  LOCKER_POINT_API_BASE,
  getLockerPointApiKey,
  lockerPointHeaders,
  missingApiKeyResponse,
} from "@/lib/locker-point-api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getLockerPointApiKey()) {
    return NextResponse.json(missingApiKeyResponse(), { status: 503 });
  }

  try {
    const res = await fetch(\`\${LOCKER_POINT_API_BASE}/pricing\`, {
      headers: lockerPointHeaders(),
      cache: "no-store",
    });
    const data = await res.json().catch(() => missingApiKeyResponse());
    if (!res.ok) {
      return NextResponse.json(
        typeof data === "object" && data
          ? data
          : { success: false, error: { code: "UPSTREAM", message: "Listino locker non disponibile" } },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Servizio non disponibile." } },
      { status: 502 },
    );
  }
}
`;
fs.writeFileSync("src/app/api/locker-point/pricing/route.ts", lockerPricing);

// deposito fail-closed in api helper usage - patch deposito-bagagli-api
let dep = fs.readFileSync("src/lib/deposito-bagagli-api.ts", "utf8");
if (!dep.includes("depositoMissingKeyResponse")) {
  dep += `
export function depositoMissingKeyResponse() {
  return {
    success: false as const,
    error: {
      code: "CONFIG_ERROR",
      message: "Servizio deposito bagagli non configurato (API key mancante).",
    },
  };
}

export function requireDepositoApiKey() {
  const key = depositoApiKey();
  if (!key) {
    const err = new Error("GESTIIO_DEPOSITO_API_KEY mancante") as Error & { status?: number };
    err.status = 503;
    throw err;
  }
  return key;
}
`;
  fs.writeFileSync("src/lib/deposito-bagagli-api.ts", dep);
}

let depPricing = fs.readFileSync("src/app/api/deposito-bagagli/pricing/route.ts", "utf8");
depPricing = `import { NextResponse } from "next/server";
import {
  DEPOSITO_API_BASE,
  depositoApiHeaders,
  depositoApiKey,
  depositoMissingKeyResponse,
} from "@/lib/deposito-bagagli-api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!depositoApiKey()) {
    return NextResponse.json(depositoMissingKeyResponse(), { status: 503 });
  }
  try {
    const res = await fetch(\`\${DEPOSITO_API_BASE}/pricing\`, {
      headers: depositoApiHeaders(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Servizio non disponibile.",
        },
      },
      { status: 502 },
    );
  }
}
`;
fs.writeFileSync("src/app/api/deposito-bagagli/pricing/route.ts", depPricing);
console.log("documenti + locker/deposito pricing fail-closed");
