import Link from "next/link";
import AdminDashboardOverview from "@/components/admin-area/AdminDashboardOverview";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Admin | AG SERVIZI",
    description: "Pannello interno per gestire le richieste dell'area clienti AG SERVIZI.",
    path: "/area-admin",
  });
}

export default function AreaAdminPage() {
  return (
    <div className="space-y-6 pb-16">
      <AdminDashboardOverview />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/area-admin/richieste"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Operativo
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Richieste e stati</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui controllo pratiche, dettagli cliente, note e aggiornamenti di stato in modo piu
            ordinato.
          </p>
        </Link>

        <Link
          href="/area-admin/visure"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Visure
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Visure e provider OpenAPI</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui seguo lo stato dei provider, i riferimenti OpenAPI e i documenti pronti per il
            cliente.
          </p>
        </Link>

        <Link
          href="/area-admin/listino-visure"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Configurazione
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Listino visure</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui allineo i prezzi usati in area clienti e nel checkout Stripe per ogni richiesta
            visura.
          </p>
        </Link>

        <Link
          href="/area-admin/listino-spedizioni"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Configurazione
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Listino spedizioni</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui tengo coerenti i costi reali lato cliente, impostando scaglioni per peso e volume.
          </p>
        </Link>

        <Link
          href="/area-admin/consulenza-utenze"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Commerciale
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Lead consulenza utenze</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui gestisco lead telefonia, luce e gas e invio preventivi allegati direttamente ai clienti.
          </p>
        </Link>

        <Link
          href="/area-admin/notifiche-email"
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Focus Audit
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950">Notifiche email</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Qui controllo lo storico invii Resend dell&apos;area clienti con esito, motivo errore e timestamp.
          </p>
        </Link>
      </section>
    </div>
  );
}
