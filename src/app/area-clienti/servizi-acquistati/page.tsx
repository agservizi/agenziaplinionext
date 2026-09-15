import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { readCustomerSession } from "@/lib/auth/session";
import { getPool } from "@/lib/db";
import { getCustomerEmailByUserId } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientServiziAcquistatiPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const email =
    (userId ? await getCustomerEmailByUserId(userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);

  let rows: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST && (userId || email)) {
    try {
      const [result] = await getPool().query<RowDataPacket[]>(
        `SELECT id, service_type, status, notes, created_at, updated_at
         FROM client_area_requests
         WHERE area = 'shop-service'
           AND (
             CAST(JSON_EXTRACT(details_json, '$.clientUserId') AS UNSIGNED) = ?
             OR LOWER(email) = LOWER(?)
           )
         ORDER BY id DESC LIMIT 100`,
        [userId || 0, email || ""],
      );
      rows = result;
    } catch {
      rows = [];
    }
  }

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Shop · SERVICE"
      title="Servizi acquistati"
      description="Stati: ricevuto → in lavorazione → revisione → completato."
    >
      {rows.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">Nessun servizio shop in corso.</ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["ID", "Servizio", "Stato", "Note", "Aggiornato"]}
          rows={rows.map((r) => [
            String(r.id),
            String(r.service_type),
            String(r.status),
            String(r.notes || "—"),
            r.updated_at
              ? new Date(r.updated_at as string).toLocaleString("it-IT")
              : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
