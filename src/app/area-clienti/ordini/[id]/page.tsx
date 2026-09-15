import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import { getCustomerOrderMirror } from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientOrdineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await readCustomerSession();
  const userId = session?.userId ?? 0;
  if (!userId) notFound();

  const order = await getCustomerOrderMirror(userId, id);
  if (!order) notFound();

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Ordine"
      title={`Ordine ${id.slice(0, 16)}`}
      description="Line items PHYSICAL / DIGITAL / SERVICE · payment · tracking · entitlement."
      actions={
        <Link href="/area-clienti/ordini" className="text-sm font-semibold text-cyan-300 hover:underline">
          ← I tuoi ordini
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40">Stato</p>
          <p className="mt-2 font-semibold">{String(order.status || "—")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40">Totale</p>
          <p className="mt-2 font-semibold">
            {order.total_amount != null ? `${order.total_amount} ${order.currency || "EUR"}` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40">Aggiornato</p>
          <p className="mt-2 font-semibold">
            {order.updated_at
              ? new Date(order.updated_at as string).toLocaleString("it-IT")
              : "—"}
          </p>
        </div>
      </div>
      <ModuleNotice tone="client" variant="empty">
        Timeline e line items completi arrivano dal webhook Saleor → mirror JSON.
      </ModuleNotice>
    </ModuleFrame>
  );
}
