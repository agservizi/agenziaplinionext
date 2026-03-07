import Link from "next/link";
import Container from "@/components/Container";
import BrtShipmentHistory from "@/components/client-area/BrtShipmentHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico Spedizioni Area Clienti",
    description: "Storico delle spedizioni registrate nell'area clienti AG SERVIZI.",
    path: "/area-clienti/spedizioni/storico",
  });
}

export default function AreaClientiSpedizioniStoricoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Storico Spedizioni
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Qui controlli le spedizioni gia create.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              In questa pagina trovi tracking, stato e dettagli operativi delle spedizioni registrate
              dal portale, senza appesantire il modulo di nuova creazione.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/area-clienti/spedizioni"
                className="rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Torna a nuova spedizione
              </Link>
              <Link
                href="/area-clienti"
                className="rounded-full border border-slate-700 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/5"
              >
                Torna alla dashboard
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Vista operativa</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>• ultime spedizioni create dal portale</li>
              <li>• tracking, parcel ID e stato pratica</li>
              <li>• controllo rapido di peso e volume registrati</li>
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <BrtShipmentHistory refreshToken={0} />
          </Container>
        </section>
      </div>
    </div>
  );
}
