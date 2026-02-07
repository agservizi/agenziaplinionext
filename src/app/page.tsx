import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ServiceCategory from "@/components/ServiceCategory";
import { serviceCategories, values } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section className="hero-gradient min-h-screen py-16">
        <Container className="grid min-h-[calc(100vh-64px)] gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Agenzia di servizi dal 2016
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Consulenze affidabili per telefonia, energia e servizi digitali.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              AG SERVIZI supporta privati e aziende con soluzioni personalizzate,
              rapide e trasparenti, combinando competenza locale e innovazione
              digitale.
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
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Focus strategico
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Un unico partner per servizi essenziali e digitalizzazione.
              </h2>
              <p className="text-sm text-slate-300">
                Ottimizzazione contratti, supporto operativo e soluzioni su
                misura per ridurre tempi di gestione e aumentare la serenità
                operativa.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Analisi dei consumi e consulenza trasparente.</li>
                <li>• Presenza locale con supporto continuativo.</li>
                <li>• Servizi digitali per aziende e privati.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface text-slate-900">
        <section className="py-16 md:py-20">
          <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-cyan-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Cosa facciamo
                </p>
              </div>
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Servizi essenziali gestiti con metodo e trasparenza
              </h2>
              <p className="text-base text-slate-600 md:text-lg">
                Riduciamo complessità e tempi di gestione con un’esperienza chiara e
                guidata, costruita sulle reali esigenze del cliente.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {[
                  "Analisi immediata",
                  "Consulenza su misura",
                  "Assistenza continuativa",
                  "Presenza locale",
                ].map((pill) => (
                  <span key={pill} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {[
                {
                  title: "Attivazioni guidate",
                  description: "Supporto dedicato per ogni richiesta, senza passaggi inutili.",
                },
                {
                  title: "Soluzioni personalizzate",
                  description: "Analisi e proposte costruite su consumi reali.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="lux-card rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
                >
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
          <Container className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { label: "Attivi dal", value: "2016" },
              { label: "Servizi gestiti", value: "30+" },
              { label: "Supporto", value: "Locale" },
            ].map((item) => (
              <div key={item.label} className="lux-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container className="space-y-6 md:space-y-8">
            <SectionHeading
              eyebrow="Metodo di lavoro"
              title="Tre fasi per una consulenza efficace"
              description="Un processo lineare per decisioni rapide e risultati affidabili."
              tone="dark"
              align="center"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Analisi delle esigenze",
                  description: "Raccolta dati e obiettivi chiari.",
                },
                {
                  title: "Proposta ottimizzata",
                  description: "Confronto soluzioni e scelta guidata.",
                },
                {
                  title: "Supporto continuo",
                  description: "Assistenza post-attivazione dedicata.",
                },
              ].map((step, index) => (
                <div key={step.title} className="lux-card rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600/10 text-xs font-semibold text-cyan-700">
                      0{index + 1}
                    </span>
                    <p className="text-base font-semibold text-slate-900">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container className="grid gap-8 md:gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div className="lux-panel rounded-3xl p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                Focus servizi
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                Telefonia, energia, digitale e pagamenti in un unico hub
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Gestiamo servizi essenziali con un team esperto e partner affidabili, per offrire continuità operativa.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {[
                  "Telefonia",
                  "Energia",
                  "Pagamenti",
                  "Servizi digitali",
                  "Logistica",
                  "Web Agency",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-4">
              {serviceCategories.slice(0, 1).map((category) => (
                <ServiceCategory
                  key={category.id}
                  category={category}
                  compact
                  tone="light"
                />
              ))}
              <Link
                href="/servizi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-600"
              >
                Scopri tutti i servizi →
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-16 md:py-20">
          <Container className="grid gap-8 md:gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <SectionHeading
              eyebrow="Pronto a iniziare"
              title="Porta efficienza e innovazione nei tuoi servizi quotidiani"
              description="Parla con i nostri consulenti e ricevi una proposta mirata."
              tone="dark"
            />
            <div className="lux-panel rounded-3xl p-8">
              <p className="text-sm text-slate-600">
                Affidati ad AG SERVIZI per gestire attivazioni, pagamenti e servizi
                digitali in modo semplice e professionale.
              </p>
              <Link
                href="/contatti"
                className="mt-6 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                Richiedi una consulenza
              </Link>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return buildMetadata({
    title: "AG SERVIZI | Pagamenti, Telefonia, Luce e Gas a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: pagamenti bollettini, SPID, PEC, telefonia, luce e gas. Consulenza professionale dal 2016.",
    path: "/",
  });
}
