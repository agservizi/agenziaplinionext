import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { listBookingRequests } from "@/lib/admin/portal-queries";

export const dynamic = "force-dynamic";

export default async function AdminPrenotazioniPage() {
  const result = await listBookingRequests(100);

  return (
    <ModuleFrame
      eyebrow="Sistema"
      title="Prenotazioni"
      description="Richieste booking collegate a Google Calendar."
    >
      {!result.ok ? (
        <ModuleNotice variant="warning">MySQL non configurato.</ModuleNotice>
      ) : result.rows.length === 0 ? (
        <ModuleNotice variant="empty">Nessuna prenotazione.</ModuleNotice>
      ) : (
        <ModuleTable
          headers={["ID", "Nome", "Email", "Servizio", "Inizio", "Stato"]}
          rows={result.rows.map((r) => [
            String(r.id),
            String(r.name || "—"),
            String(r.email || "—"),
            String(r.service || "—"),
            r.start_at ? new Date(r.start_at as string).toLocaleString("it-IT") : "—",
            String(r.status || "—"),
          ])}
        />
      )}
    </ModuleFrame>
  );
}
