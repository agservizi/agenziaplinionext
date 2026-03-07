import AdminConsultingLeadsDashboard from "@/components/admin-area/AdminConsultingLeadsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Lead Consulenza Utenze | Area Admin",
    description:
      "Gestione lead consulenza telefonia, luce e gas con aggiornamento stato e invio preventivi allegati.",
    path: "/area-admin/consulenza-utenze",
  });
}

export default function AreaAdminConsultingLeadsPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Consulenza Utenze
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Lead commerciali e invio preventivi
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa sezione puoi qualificare lead, aggiornare lo stato commerciale e allegare il
          preventivo direttamente dal pannello admin.
        </p>
      </section>

      <AdminConsultingLeadsDashboard />
    </div>
  );
}
