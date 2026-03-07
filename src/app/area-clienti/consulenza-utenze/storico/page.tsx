import Link from "next/link";
import Container from "@/components/Container";
import UtilityConsultingHistory from "@/components/client-area/UtilityConsultingHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico lead consulenza utenze",
    description:
      "Cronologia richieste consulenza telefonia, luce e gas con stato lead e dati di presa in carico.",
    path: "/area-clienti/consulenza-utenze/storico",
  });
}

export default function AreaClientiConsulenzaStoricoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Storico lead
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Tutte le richieste consulenza in un unico spazio.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui controlli servizio richiesto, dati di contatto e stato commerciale aggiornato.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/area-clienti/consulenza-utenze"
                className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Torna alla consulenza
              </Link>
              <Link
                href="/area-clienti"
                className="inline-flex rounded-full border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-900/60"
              >
                Dashboard clienti
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Cosa vedi qui
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• Servizio richiesto (telefonia/luce/gas)</li>
              <li>• Stato lead commerciale</li>
              <li>• Operatore attuale e spesa media</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <UtilityConsultingHistory />
          </Container>
        </section>
      </div>
    </div>
  );
}
