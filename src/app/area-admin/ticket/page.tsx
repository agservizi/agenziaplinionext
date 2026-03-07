import AdminTicketsDashboard from "@/components/admin-area/AdminTicketsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Ticket Pratiche Area Admin | AG SERVIZI",
    description: "Gestione ticket cliente, stati e contro-risposte operative.",
    path: "/area-admin/ticket",
  });
}

export default function AreaAdminTicketPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Sezione Ticket Pratiche
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Qui gestisco risposte operative e documenti dei ticket cliente.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          Seleziono il ticket, verifico la conversazione, aggiorno lo stato e invio la
          contro-risposta direttamente in area clienti.
        </p>
      </section>

      <AdminTicketsDashboard />
    </div>
  );
}
