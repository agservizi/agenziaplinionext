import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminServiziShopPage() {
  let rows: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST) {
    try {
      const [result] = await getPool().query<RowDataPacket[]>(
        `SELECT id, service_type, customer_name, email, status, created_at, details_json
         FROM client_area_requests
         WHERE area = 'shop-service'
         ORDER BY id DESC LIMIT 100`,
      );
      rows = result;
    } catch {
      rows = [];
    }
  }

  return (
    <ModuleFrame
      eyebrow="Shop · Service"
      title="Servizi shop"
      description="Coda SERVICE da webhook Saleor → client_area_requests."
    >
      {rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessun servizio shop in lavorazione.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Servizio", "Cliente", "Email", "Stato", "Data"]}
          rows={rows.map((r) => [
            String(r.id),
            String(r.service_type),
            String(r.customer_name),
            String(r.email),
            String(r.status),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
