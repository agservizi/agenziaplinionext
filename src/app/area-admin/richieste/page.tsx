import AdminRequestsDashboard from "@/components/admin-area/AdminRequestsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Richieste Area Admin | AG SERVIZI",
    description: "Gestione richieste e stato pratiche del portale clienti.",
    path: "/area-admin/richieste",
  });
}

export default function AreaAdminRequestsPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Sezione Richieste
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Qui seguo il flusso operativo delle pratiche.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa schermata mi concentro solo sulle richieste: filtro, controllo i dettagli e
          aggiorno gli stati senza mescolare altre configurazioni.
        </p>
      </section>

      <AdminRequestsDashboard />
    </div>
  );
}
