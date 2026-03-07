import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { clientAreas } from "@/lib/client-area";

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti AG SERVIZI",
    description:
      "Area clienti AG SERVIZI per richieste spedizioni, visure e pratiche CAF e patronato in sezioni dedicate.",
    path: "/area-clienti",
  });
}

export default function AreaClientiPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Area Clienti
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Uno spazio dedicato per seguire richieste, pratiche e servizi online.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui trovi un percorso semplice per inviare richieste, organizzare i dati necessari e
              ricevere supporto in modo piu ordinato su spedizioni, visure, pratiche CAF/patronato
              e consulenze telefonia/luce/gas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/area-clienti/spedizioni"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-400"
              >
                Inizia dalle spedizioni
              </Link>
              <Link
                href="/contatti"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Parla con il team
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Cosa puoi fare subito
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Invia richieste in pochi minuti, senza passaggi complicati.</li>
                <li>• Carica documenti e dati necessari direttamente online.</li>
                <li>• Ricevi supporto rapido e aggiornamenti sulla tua pratica.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-16 md:py-20">
          <Container className="space-y-8">
            <SectionHeading
              eyebrow="Moduli disponibili"
              title="Aree dedicate per servizi ad alto impatto operativo"
              description="Ogni modulo raccoglie la richiesta, struttura i dati minimi e prepara il passaggio successivo con il team."
              tone="dark"
              align="center"
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {clientAreas.map((area) => (
                <div key={area.key} className="lux-card rounded-3xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                    {area.eyebrow}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-900">{area.title}</h2>
                  <p className="mt-3 text-sm text-slate-600">{area.subtitle}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {area.highlights.map((highlight) => (
                      <li key={highlight}>• {highlight}</li>
                    ))}
                  </ul>
                  <Link
                    href={area.path}
                    className="button-link-light mt-6 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-50 shadow-lg shadow-slate-950/10 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
                  >
                    {area.cta}
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-100 p-6 shadow-[0_18px_40px_rgba(14,116,144,0.14)] md:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Ticket dedicato
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Ticket Pratiche & Documenti
                </h2>
                <p className="mt-3 text-sm text-slate-700">
                  Con questo modulo puoi inviare richieste operative su pratiche già aperte,
                  allegare documenti mancanti e seguire gli aggiornamenti della lavorazione.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li>• Richieste rapide per pratiche già avviate</li>
                  <li>• Upload allegati e gestione priorità</li>
                  <li>• Storico ticket consultabile dal cliente</li>
                </ul>
                <Link
                  href="/area-clienti/ticket-pratiche-documenti"
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-sky-700 bg-sky-700 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-sky-600 hover:!text-white"
                >
                  Apri modulo ticket
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
