import Link from "next/link";
import Container from "@/components/Container";
import UtilityConsultingWorkspace from "@/components/client-area/UtilityConsultingWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("consulenza-utenze");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti Consulenza Utenze",
    description:
      "Modulo area clienti per richieste consulenza telefonia, luce e gas con registrazione lead e storico dedicato.",
    path: "/area-clienti/consulenza-utenze",
  });
}

export default function AreaClientiConsulenzaUtenzePage() {
  if (!area) return null;

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {area.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{area.title}</h1>
            <p className="text-base text-slate-300 md:text-lg">{area.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/area-clienti/consulenza-utenze/storico"
                className="inline-flex rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:bg-cyan-400"
              >
                Storico lead
              </Link>
              <Link
                href="/area-clienti"
                className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Torna alla dashboard
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Come funziona
            </p>
            <ol className="mt-4 space-y-3 text-sm text-slate-200">
              <li>1. Seleziona il servizio: telefonia, luce o gas.</li>
              <li>2. Inserisci i dati attuali di fornitura e contatto.</li>
              <li>3. La richiesta viene registrata come lead commerciale.</li>
            </ol>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <UtilityConsultingWorkspace area={area} />
          </Container>
        </section>
      </div>
    </div>
  );
}
