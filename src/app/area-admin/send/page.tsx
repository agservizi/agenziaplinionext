import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSendPage() {
  let rows: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST) {
    try {
      const [result] = await getPool().query<RowDataPacket[]>(
        `SELECT id, area, service_type, customer_name, email, status, created_at
         FROM client_area_requests
         WHERE area = 'send' OR service_type LIKE '%send%' OR service_type LIKE '%gestiio%'
         ORDER BY id DESC LIMIT 100`,
      );
      rows = result;
    } catch {
      rows = [];
    }
  }

  return (
    <ModuleFrame
      eyebrow="Bridge"
      title="SEND / Gestiio"
      description="Pratiche SEND collegate all'identità portale."
    >
      {rows.length === 0 ? (
        <ModuleNotice variant="empty">
          Nessuna pratica SEND in evidenza. I record arrivano dalle richieste area send.
        </ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Cliente", "Email", "Servizio", "Stato", "Data"]}
          rows={rows.map((r) => [
            String(r.id),
            String(r.customer_name),
            String(r.email),
            String(r.service_type),
            String(r.status),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
