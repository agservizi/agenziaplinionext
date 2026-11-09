import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { readCustomerSession } from "@/lib/auth/session";
import {
  getCustomerEmailByUserId,
  listCustomerBookings,
} from "@/lib/client/portal-queries";

export const dynamic = "force-dynamic";

export default async function ClientPrenotazioniPage() {
  const session = await readCustomerSession();
  const email =
    (session?.userId ? await getCustomerEmailByUserId(session.userId) : null) ||
    (session?.username?.includes("@") ? session.username : "");
  const rows = email ? await listCustomerBookings(email) : [];

  return (
    <ModuleFrame
      tone="client"
      eyebrow="Account"
      title="Prenotazioni"
      description="Appuntamenti presi in sede o online. Puoi annullare solo se la prenotazione è ancora modificabile."
    >
      {rows.length === 0 ? (
        <ModuleNotice tone="client" variant="empty">
          Non hai ancora prenotazioni. Quando fissi un appuntamento, lo trovi qui con data e stato.
        </ModuleNotice>
      ) : (
        <ModuleTable
          tone="client"
          headers={["ID", "Servizio", "Inizio", "Stato"]}
          rows={rows.map((r) => [
            String(r.id),
            String(r.service || "—"),
            r.start_at ? new Date(r.start_at as string).toLocaleString("it-IT") : "—",
            String(r.status || "—"),
          ])}
        />
      )}
    </ModuleFrame>
  );
}
