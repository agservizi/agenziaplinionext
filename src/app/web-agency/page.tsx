import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import WebAgencyWizardModal from "@/components/WebAgencyWizardModal";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Web Agency creativa a Castellammare di Stabia",
    description:
      "AG SERVIZI Web Agency: UI/UX, sviluppo e crescita digitale con uno stile creativo e ad alto impatto.",
    path: "/web-agency",
  });
}

const focusAreas = [
  {
    title: "Sprint Conversion",
    description: "Landing ad alta resa, copy orientato al lead e funnel tracciato.",
    accent: "from-cyan-500/15 to-cyan-100/0",
    kpi: "30 giorni",
  },
  {
    title: "Rebrand Digitale",
    description: "Nuova identita visiva, tone of voice e sistema grafico completo.",
    accent: "from-fuchsia-500/15 to-fuchsia-100/0",
    kpi: "6 settimane",
  },
  {
    title: "Piattaforma Pro",
    description: "Sito su misura con SEO tecnico, performance elevate e scalabilita.",
    accent: "from-emerald-500/15 to-emerald-100/0",
    kpi: "8-10 settimane",
  },
  {
    title: "Growth Continuo",
    description: "Ottimizzazione mensile su CRO, contenuti e campagne digital.",
    accent: "from-amber-500/15 to-amber-100/0",
    kpi: "Retainer",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Discovery guidata",
    description: "Analisi business, benchmark concorrenti e obiettivi concreti.",
  },
  {
    step: "02",
    title: "Architettura e UX",
    description: "Mappa contenuti, flussi utente e struttura CTA per conversione.",
  },
  {
    step: "03",
    title: "Design system",
    description: "Componenti riusabili, stile coerente e prototipi di pagina.",
  },
  {
    step: "04",
    title: "Build e integrazioni",
    description: "Sviluppo front/back, form smart, analytics e automazioni.",
  },
  {
    step: "05",
    title: "Go-live e ottimizzazione",
    description: "Deploy controllato, monitoraggio e miglioramento continuo.",
  },
];

const deliverables = [
  {
    title: "Output strategici",
    items: ["Roadmap progetto", "Posizionamento digitale", "Piano canali e priorita"],
  },
  {
    title: "Output creativi",
    items: ["Visual concept", "Design system UI", "Template contenuti social/web"],
  },
  {
    title: "Output tecnici",
    items: ["Sito ottimizzato", "Setup SEO tecnico", "Dashboard KPI e tracking eventi"],
  },
];

const stats = [
  { label: "Tempo medio per andare online", value: "21 gg" },
  { label: "Velocita del sito", value: "90+" },
  { label: "Qualita dei contatti", value: "A/B test" },
];

export default function WebAgencyShowcasePage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient relative overflow-hidden bg-slate-950 pt-36 pb-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 rounded-full bg-indigo-500/30 blur-[140px]" />
        </div>
        <Container className="relative grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Web Agency Creativa
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-6xl">
              Un sito potente e creativo che fa crescere il tuo brand.
            </h1>
            <p className="text-base text-slate-200 md:text-lg">
              Ti aiutiamo a distinguerti con un’esperienza digitale ricca, veloce e
              orientata ai risultati. Niente minimalismo: identità forte, colori e ritmo.
            </p>
            <div className="flex flex-wrap gap-4">
              <WebAgencyWizardModal />
              <Link
                href="/servizi"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Vedi tutti i servizi
              </Link>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {[
                "UI/UX strategico",
                "Design system",
                "SEO + Performance",
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Creatività + Conversione
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Interfacce energiche, layout ricchi e copy che guidano i tuoi clienti.
            </h2>
            <p className="mt-3 text-sm text-slate-200">
              Ogni sezione valorizza ciò che offri e accompagna l’utente alla richiesta
              di contatto con un look premium.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface text-slate-900">
        <section className="py-18">
          <Container className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">
                Creative Direction
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.05] text-slate-900 md:text-6xl">
                Design che non riempie pagine.
                <br />
                Muove decisioni.
              </h2>
              <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
                Costruiamo esperienze digitali con personalita forte: estetica, strategia e conversione
                allineate nello stesso sistema.
              </p>
            </div>
            <aside className="lux-panel rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Risultati attesi da subito
              </p>
              <div className="mt-4 grid gap-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xl font-semibold text-slate-900">{item.value}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </Container>
        </section>

        <section className="pb-10">
          <Container className="grid gap-5">
            {focusAreas.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(14,116,144,0.18)] md:grid md:grid-cols-[120px_1fr_180px] md:items-center md:gap-8"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${item.accent} opacity-90`} />
                <span className="relative text-5xl font-semibold leading-none text-slate-300/80 md:text-6xl">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <div className="relative mt-4 md:mt-0">
                  <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-700 md:text-base">{item.description}</p>
                </div>
                <div className="relative mt-4 md:mt-0 md:text-right">
                  <span className="inline-flex rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {item.kpi}
                  </span>
                </div>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative overflow-hidden rounded-4xl bg-slate-950 p-8 text-white md:p-10">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-12 -left-8 h-40 w-40 rounded-full bg-cyan-500/30 blur-[80px]" />
                <div className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-fuchsia-500/30 blur-[95px]" />
              </div>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Metodo
                </p>
                <h3 className="mt-3 text-2xl font-semibold md:text-3xl">
                  Pipeline completa dal concept al go-live.
                </h3>
                <p className="mt-3 text-sm text-slate-200">
                  Team allineato, milestone chiare, nessuna zona grigia tra design e sviluppo.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {processSteps.map((step) => (
                <article key={step.step} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600/10 text-xs font-semibold text-cyan-700">
                      {step.step}
                    </span>
                    <p className="text-lg font-semibold text-slate-900">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-16">
          <Container className="grid gap-6 md:grid-cols-3">
            {deliverables.map((column) => (
              <article key={column.title} className="lux-card rounded-3xl p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Container>
        </section>

        <section className="pb-12">
          <Container className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white px-8 py-10 md:px-12">
            <div className="pointer-events-none absolute -right-10 -bottom-12 h-52 w-52 rounded-full bg-cyan-500/15 blur-[50px]" />
            <div className="pointer-events-none absolute -left-8 top-0 h-44 w-44 rounded-full bg-fuchsia-500/15 blur-[60px]" />
            <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Proposta su misura
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
                  Raccontaci il tuo obiettivo: prepariamo una roadmap operativa.
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <WebAgencyWizardModal />
                <Link
                  href="/contatti"
                  className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-400 hover:text-cyan-700"
                >
                  Parla con il team
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-8">
          <Container>
            <SectionHeading
              eyebrow="Risultati reali"
              title="Obiettivi misurabili per il tuo business"
              description="Diamo struttura al tuo progetto con KPI chiari: più contatti, più autorevolezza e un’esperienza che converte davvero."
              tone="dark"
              align="center"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "+120% richieste",
                  description: "Landing ottimizzate con CTA, copy e funnel dedicato.",
                },
                {
                  title: "Performance 90+",
                  description: "Velocità, SEO tecnico e stabilità su mobile e desktop.",
                },
                {
                  title: "Brand memorabile",
                  description: "Visual identity coerente e riconoscibile su ogni pagina.",
                },
              ].map((item) => (
                <div key={item.title} className="lux-card rounded-3xl p-6">
                  <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
