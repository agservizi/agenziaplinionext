import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm, ActionButton } from "@/components/portal/ApiForm";
import type { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureSaleorBridgeTables } from "@/lib/saleor/ensure-tables";

export const dynamic = "force-dynamic";

export default async function AdminEntitlementPage() {
  let rows: RowDataPacket[] = [];
  let dbOk = Boolean(process.env.MYSQL_HOST);

  if (dbOk) {
    try {
      await ensureSaleorBridgeTables();
      const [result] = await getPool().query<RowDataPacket[]>(
        `SELECT id, client_user_id, saleor_order_id, asset_key, download_count, max_downloads, expires_at, revoked_at
         FROM shop_digital_entitlements ORDER BY id DESC LIMIT 100`,
      );
      rows = result;
    } catch {
      dbOk = false;
    }
  }

  return (
    <ModuleFrame
      eyebrow="Shop · Digital"
      title="Entitlement"
      description="Emit / revoke / reissue download firmati."
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/entitlements"
          submitLabel="Crea entitlement"
          fields={[
            { name: "clientUserId", label: "Client user ID", type: "number", required: true },
            { name: "saleorOrderId", label: "Saleor order ID", required: true },
            { name: "assetKey", label: "Asset key", required: true },
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
        <div>
          {!dbOk ? (
            <ModuleNotice variant="warning">MySQL non disponibile.</ModuleNotice>
          ) : rows.length === 0 ? (
            <ModuleNotice variant="empty">Nessun entitlement emesso.</ModuleNotice>
          ) : (
            <ModuleTable
              headers={["ID", "Cliente", "Ordine", "Asset", "DL", "Revocato", ""]}
              rows={rows.map((r) => [
                String(r.id),
                String(r.client_user_id),
                String(r.saleor_order_id),
                String(r.asset_key),
                `${r.download_count}/${r.max_downloads ?? "∞"}`,
                r.revoked_at ? "sì" : "no",
                <div key={`e-${r.id}`} className="flex gap-2">
                  <ActionButton
                    endpoint="/api/admin/shop/entitlements"
                    body={{ action: "revoke", id: Number(r.id) }}
                    label="Revoca"
                  />
                  <ActionButton
                    endpoint="/api/admin/shop/entitlements"
                    body={{ action: "reissue", id: Number(r.id) }}
                    label="Reissue"
                  />
                </div>,
              ])}
            />
          )}
        </div>
      </div>
    </ModuleFrame>
  );
}
