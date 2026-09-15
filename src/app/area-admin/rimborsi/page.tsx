import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ActionButton } from "@/components/portal/ApiForm";
import { canAccessAdminModule, readStaffSession } from "@/lib/auth/session";
import { fetchShopOrders } from "@/lib/saleor/client";

export const dynamic = "force-dynamic";

export default async function AdminRimborsiPage() {
  const session = await readStaffSession();
  const allowed = session ? canAccessAdminModule(session.role, "refund") : false;
  const orders =
    allowed && process.env.SALEOR_APP_TOKEN
      ? await fetchShopOrders(30)
      : { ok: false, orders: [], totalCount: 0 };

  return (
    <ModuleFrame eyebrow="Shop · Finance" title="Rimborsi" description="Solo ADMIN+. Azione refund su ordine.">
      {!allowed ? (
        <ModuleNotice variant="error">Non autorizzato.</ModuleNotice>
      ) : !orders.ok ? (
        <ModuleNotice variant="warning">Saleor non disponibile per i rimborsi.</ModuleNotice>
      ) : orders.orders.length === 0 ? (
        <ModuleNotice variant="empty">Nessun ordine rimborsabile in lista.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["#", "Email", "Stato", "Totale", ""]}
          rows={orders.orders.map((o) => [
            o.number || o.id.slice(-8),
            o.userEmail || "—",
            o.status || "—",
            o.total ? `${o.total.amount.toFixed(2)} ${o.total.currency}` : "—",
            <ActionButton
              key={o.id}
              endpoint="/api/admin/shop/orders"
              body={{ action: "refund", orderId: o.id }}
              label="Rimborsa"
              confirm="Confermi il rimborso?"
            />,
          ])}
        />
      )}
    </ModuleFrame>
  );
}
