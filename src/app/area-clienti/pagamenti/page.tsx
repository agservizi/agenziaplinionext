import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import {
  getCustomerEmailByUserId,
  listCustomerPayments,
} from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientPagamentiPage() {
  const session = await readCustomerSession();
  const email =
    (session?.userId ? await getCustomerEmailByUserId(session.userId) : null) ||
    (session?.username?.includes("@") ? session.username : null);
  const rows = await listCustomerPayments(session?.userId ?? 0, email);

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Pagamenti"
      description="Solo i tuoi pagamenti servizi + shop (ownership server-side)."
    >
      {rows.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">Nessun pagamento trovato.</ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["ID", "Importo", "Stato", "Etichetta", "Data"]}
          rows={rows.map((r) => [
            String(r.id),
            `${(Number(r.amount_cents || 0) / 100).toFixed(2)} ${String(r.currency || "eur").toUpperCase()}`,
            String(r.payment_status || r.checkout_status || "—"),
            String(r.price_label || "—"),
            r.created_at ? new Date(r.created_at as string).toLocaleString("it-IT") : "—",
          ])}
        />
      )}
    </ModuleFrame>
  );
}
