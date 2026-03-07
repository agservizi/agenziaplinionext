import AdminEmailNotificationsDashboard from "@/components/admin-area/AdminEmailNotificationsDashboard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Notifiche Email | Area Admin AG SERVIZI",
    description: "Monitoraggio invii email area clienti con esito e dettagli errore.",
    path: "/area-admin/notifiche-email",
  });
}

export default function AreaAdminEmailNotificationsPage() {
  return (
    <div className="space-y-6 pb-16 text-white">
      <section className="glass-card rounded-4xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Sezione Notifiche
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Qui monitoro gli invii email dell&apos;area clienti.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          In questa pagina verifico esito invio, ragione di eventuali errori e dettaglio evento
          per ogni notifica generata dai flussi operativi.
        </p>
      </section>

      <AdminEmailNotificationsDashboard />
    </div>
  );
}
