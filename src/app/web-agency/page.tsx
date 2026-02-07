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
    title: "UI/UX ad alto impatto",
    description:
      "Interfacce scenografiche, micro-interazioni e gerarchie visive che convertono.",
  },
  {
    title: "Brand & Visual System",
    description:
      "Palette, tipografia e motion design per un’identità coerente e memorabile.",
  },
  {
    title: "Sviluppo veloce",
    description:
      "Next.js, performance e SEO per crescere subito con un sito rapido e stabile.",
  },
  {
    title: "Campagne & Growth",
    description:
      "Landing dinamiche, funnel e tracciamenti per trasformare traffico in contatti.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Strategia creativa",
    description:
      "Workshop, moodboard e posizionamento: definiamo un’identità digitale unica.",
  },
  {
    step: "02",
    title: "Design ad alto impatto",
    description:
      "Wireframe, UI system, prototipi animati e storytelling visivo.",
  },
  {
    step: "03",
    title: "Sviluppo & go live",
    description:
      "Build veloce, SEO tecnico, integrazioni e pubblicazione assistita.",
  },
];

const showcase = [
  "Siti vetrina premium",
  "E-commerce su misura",
  "Landing ad alta conversione",
  "Gestionali web interni",
  "Brand kit & contenuti",
  "Analytics & tracciamenti",
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
        <section className="py-14">
          <Container>
            <SectionHeading
              eyebrow="Focus creativo"
              title="Soluzioni digitali che fanno la differenza"
              description="Ti offriamo visual identity, UI/UX e sviluppo full-stack per ottenere un sito scenografico, veloce e misurabile."
              tone="dark"
            />
          </Container>
          <Container className="mt-8 grid gap-6 md:grid-cols-2">
            {focusAreas.map((item) => (
              <div
                key={item.title}
                className="lux-card rounded-3xl p-7 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(14,116,144,0.2)]"
              >
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-8">
          <Container className="lux-panel rounded-3xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Stack tecnologico
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Tecnologie solide per il tuo progetto
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Scegliamo lo stack più adatto ai tuoi obiettivi, con performance e
                  manutenzione semplificata.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Next.js",
                  "React",
                  "Vite",
                  "Vue.js",
                  "Angular",
                  "Parcel",
                  "PHP",
                  "HTML5",
                  "CSS",
                  "JavaScript",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div className="lux-panel rounded-3xl p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
                Processo creativo
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                Dal tuo obiettivo al lancio, senza perdere impatto visivo.
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Metodo chiaro e ritmo veloce: mockup realistici, test e ottimizzazione
                continua per darti risultati misurabili.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {["Brand strategy", "UX flow", "Motion", "Deploy"].map((pill) => (
                  <span key={pill} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {processSteps.map((step) => (
                <div key={step.step} className="lux-card rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600/10 text-xs font-semibold text-cyan-700">
                      {step.step}
                    </span>
                    <p className="text-base font-semibold text-slate-900">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="lux-card rounded-3xl p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Cosa realizziamo
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {showcase.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-4xl p-8">
              <h3 className="text-2xl font-semibold text-white">
                Vuoi un sito con stile forte?
              </h3>
              <p className="mt-3 text-sm text-slate-200">
                Ti diamo un progetto con estetica ricca, colori decisi e UX che guida
                l’utente all’azione.
              </p>
              <Link
                href="/contatti"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Parliamone subito
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-16">
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
