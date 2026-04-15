import AdminWebAgencyProjectsDashboard from "@/components/admin-area/AdminWebAgencyProjectsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Brief Web Agency | Area Admin",
    description:
      "Gestione brief Web Agency con qualificazione commerciale, aggiornamento stato e invio proposta allegata.",
    path: "/area-admin/web-agency",
  });
}

export default function AreaAdminWebAgencyPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Web Agency</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Brief progetto e invio proposta
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa sezione puoi qualificare i brief, aggiornare lo stato commerciale e allegare la proposta direttamente dal pannello admin.
        </p>
      </section>

      <AdminWebAgencyProjectsDashboard />
    </div>
  );
}
