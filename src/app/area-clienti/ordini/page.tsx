import Link from "next/link";
import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import { listCustomerOrderMirrors } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientOrdiniPage() {
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  const orders = await listCustomerOrderMirrors(userId);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Shop"
      title="Ordini shop"
      description={`Solo ordini di ${session?.username || "te"} (anti-IDOR server-side).`}
      actions={
        <Link
          href="/shop"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
        >
          Vai allo shop
        </Link>
      }
    >
      {orders.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">
          Nessun ordine da mostrare. Completa un checkout su /shop per vederli qui.
        </ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["Ordine", "Stato", "Totale", "Data", ""]}
          rows={orders.map((o) => [
            String(o.saleor_order_id),
            String(o.status || "—"),
            o.total_amount != null ? `${o.total_amount} ${o.currency || "EUR"}` : "—",
            o.created_at ? new Date(o.created_at as string).toLocaleString("it-IT") : "—",
            <Link
              key={String(o.saleor_order_id)}
              href={`/area-clienti/ordini/${encodeURIComponent(String(o.saleor_order_id))}`}
              className="font-semibold text-cyan-300 hover:underline"
            >
              Dettaglio
            </Link>,
          ])}
        />
      )}
    </ModuleFrame>
  );
}
