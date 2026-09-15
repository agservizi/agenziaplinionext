import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export const dynamic = "force-dynamic";

export default async function AdminProdottiDigitaliPage() {
  let rows: RowDataPacket[] = [];
  if (process.env.MYSQL_HOST) {
    try {
      await ensureSaleorBridgeTables();
      const [result] = await getPool().query<RowDataPacket[]>(
        `SELECT id, client_user_id, saleor_order_id, asset_key, max_downloads, expires_at, revoked_at, created_at
         FROM shop_digital_entitlements ORDER BY id DESC LIMIT 100`,
      );
      rows = result;
    } catch {
      rows = [];
    }
  }

  return (
    <ModuleFrame
      eyebrow="Shop · Digital"
      title="Prodotti digitali"
      description="Asset protetti via entitlement (mai in /public)."
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/entitlements"
          submitLabel="Registra asset"
          fields={[
            { name: "clientUserId", label: "Cliente ID", type: "number", required: true },
            { name: "saleorOrderId", label: "Ordine Saleor", required: true },
            {
              name: "assetKey",
              label: "Chiave asset privata",
              required: true,
              placeholder: "s3://bucket/file.pdf",
            },
            { name: "maxDownloads", label: "Max download", type: "number", defaultValue: "5" },
          ]}
          buildBody={(v) => ({
            action: "create",
            clientUserId: Number(v.clientUserId),
            saleorOrderId: v.saleorOrderId,
            assetKey: v.assetKey,
            maxDownloads: Number(v.maxDownloads || 5),
          })}
        />
        {rows.length === 0 ? (
          <ModuleNotice variant="empty">Nessun asset digitale registrato.</ModuleNotice>
        ) : (
          <ModuleTable
            headers={["ID", "Cliente", "Ordine", "Asset", "Max DL", "Scade"]}
            rows={rows.map((r) => [
              String(r.id),
              String(r.client_user_id),
              String(r.saleor_order_id),
              String(r.asset_key),
              String(r.max_downloads ?? "∞"),
              r.expires_at ? new Date(r.expires_at as string).toLocaleDateString("it-IT") : "—",
            ])}
          />
        )}
      </div>
    </ModuleFrame>
  );
}
