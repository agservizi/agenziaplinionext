import Link from "next/link";
import Container from "@/components/Container";
import CafPatronatoHistory from "@/components/client-area/CafPatronatoHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico pratiche CAF e Patronato",
    description:
      "Cronologia delle pratiche CAF e Patronato con documenti caricati, stato lavorazione e file evasi disponibili.",
    path: "/area-clienti/caf-patronato/storico",
  });
}

export default function AreaClientiCafStoricoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Storico pratiche
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Qui trovi ogni pratica CAF e Patronato.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Controlli l’avanzamento, riapri i documenti che hai inviato e scarichi quelli evasi
              appena il team li carica.
            </p>
            <Link
              href="/area-clienti/caf-patronato"
              className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
            >
              Torna alle nuove richieste
            </Link>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Cosa vedi nello storico
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>Data di apertura e stato della pratica.</li>
              <li>Documenti caricati da te.</li>
              <li>Documento evaso caricato dal team.</li>
              <li>Eventuali note operative lasciate in chiusura.</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <CafPatronatoHistory />
          </Container>
        </section>
      </div>
    </div>
  );
}
