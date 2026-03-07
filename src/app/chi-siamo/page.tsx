import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { company, values } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Chi siamo | AG SERVIZI Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: agenzia di servizi con consulenza dal 2016 per telefonia, energia, pagamenti e servizi digitali.",
    path: "/chi-siamo",
  });
}

export default function ChiSiamoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-32 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Chi siamo
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Competenza locale, visione moderna.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Un’agenzia di servizi attiva dal 2016, orientata alla consulenza e
              alla costruzione di relazioni di fiducia con privati e aziende.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Contattaci
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Scopri i servizi
              </Link>
            </div>
            <div className="grid gap-4 pt-6 md:grid-cols-3">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="premium-panel rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,47,73,0.45)]"
                >
                  <p className="text-base font-semibold text-white">{value.title}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-[32px] p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Focus strategico
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Un unico partner per servizi essenziali e digitalizzazione.
              </h2>
              <p className="text-sm text-slate-300">
                Mettiamo al centro ascolto, chiarezza e risultati misurabili per
                offrire una consulenza che semplifica e migliora le decisioni.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Approccio consulenziale su misura.</li>
                <li>• Presenza locale con supporto continuativo.</li>
                <li>• Focus su qualità e innovazione.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-12">
          <Container className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
            <article className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-8 md:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_45%)]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  La nostra identita
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
                  Consulenza locale,
                  <br />
                  metodo professionale.
                </h2>
                <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
                  Dal 1 giugno 2016 affianchiamo privati e aziende con un approccio diretto:
                  ascolto, analisi concreta delle opzioni e supporto operativo fino al risultato.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {["Attivi dal 2016", "Presenza locale", "Assistenza continua", "Soluzioni su misura"].map((pill) => (
                    <span key={pill} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <aside className="grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Perche ci scelgono
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  {company.name} semplifica decisioni complesse su telefonia, energia e servizi digitali.
                  Lavoriamo con chiarezza, tempi certi e comunicazione trasparente.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Approccio
                </p>
                <p className="mt-3 text-sm text-slate-200">
                  Ogni progetto parte dall'ascolto e si traduce in una proposta chiara,
                  con supporto prima e dopo l'attivazione.
                </p>
              </div>
            </aside>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Cosa ci guida"
              title="Valori applicati al lavoro quotidiano"
              description="Non parole generiche: principi operativi che influenzano ogni consulenza."
              tone="dark"
            />
          </Container>
          <Container className="mt-8 grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Valore
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{value.description}</p>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <article className="relative overflow-hidden rounded-4xl bg-slate-950 p-8 text-white md:p-10">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-8 top-2 h-44 w-44 rounded-full bg-cyan-500/30 blur-[80px]" />
                <div className="absolute -bottom-12 right-0 h-52 w-52 rounded-full bg-indigo-500/25 blur-[95px]" />
              </div>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Il nostro percorso
                </p>
                <h3 className="mt-3 text-2xl font-semibold md:text-3xl">
                  Crescita costante costruita sulla fiducia.
                </h3>
                <p className="mt-3 text-sm text-slate-200">
                  Dall'apertura a Castellammare di Stabia abbiamo consolidato partner affidabili
                  e un metodo che unisce consulenza e operativita.
                </p>
              </div>
            </article>

            <div className="space-y-4">
              {[
                {
                  year: "2016",
                  title: "Apertura e radicamento locale",
                  desc: "Partenza con focus su assistenza quotidiana per privati e famiglie.",
                },
                {
                  year: "2019",
                  title: "Espansione servizi",
                  desc: "Consolidamento su telefonia, energia e pagamenti con processi interni piu chiari.",
                },
                {
                  year: "2022",
                  title: "Spinta digitale",
                  desc: "Integrazione di servizi digitali e strumenti per una gestione piu veloce.",
                },
                {
                  year: "Oggi",
                  title: "Consulenza evoluta",
                  desc: "Approccio consulenziale completo, supporto continuativo e miglioramento costante.",
                },
              ].map((item) => (
                <article key={item.year} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">{item.year}</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-16">
          <Container className="grid gap-5 md:grid-cols-3">
            {[
              { label: "Anno di apertura", value: "2016" },
              { label: "Aree seguite", value: "Telefonia, Energia, Digitale" },
              { label: "Metodo", value: "Consulenza con supporto operativo" },
            ].map((item) => (
              <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{item.value}</p>
              </article>
            ))}
          </Container>
          <Container className="mt-8">
            <div className="rounded-4xl border border-slate-200 bg-white px-8 py-8 md:flex md:items-center md:justify-between md:px-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Parliamone</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Vuoi una consulenza chiara prima di decidere?
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ti aiutiamo a valutare opzioni, costi e vantaggi con un confronto concreto.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
                <Link
                  href="/contatti"
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white"
                >
                  Contattaci ora
                </Link>
                <Link
                  href="/servizi"
                  className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-500 hover:text-cyan-700"
                >
                  Vedi i servizi
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
