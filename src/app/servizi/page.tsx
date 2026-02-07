import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ServiceCategory from "@/components/ServiceCategory";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Servizi a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: pagamenti, telefonia, luce e gas, SPID, PEC, firma digitale e web agency con consulenza locale.",
    path: "/servizi",
  });
}

export default function ServiziPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Servizi
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Soluzioni complete per privati e aziende.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Ogni categoria è gestita con consulenza dedicata, attivazioni rapide
              e assistenza continua, con un unico partner di riferimento.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contatti"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi info
              </Link>
              <Link
                href="/chi-siamo"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Il nostro metodo
              </Link>
            </div>
            <div className="grid gap-4 pt-6 md:grid-cols-3">
              {[
                {
                  title: "Consulenza dedicata",
                  description: "Un referente per ogni esigenza.",
                },
                {
                  title: "Partner selezionati",
                  description: "Solo operatori affidabili e certificati.",
                },
                {
                  title: "Supporto locale",
                  description: "Presenza sul territorio e assistenza continua.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="premium-panel rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,47,73,0.45)]"
                >
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Focus consulenza
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Un unico punto di riferimento per servizi essenziali
              </h2>
              <p className="text-sm text-slate-300">
                Coordinamento, gestione e assistenza continua per garantire
                efficienza operativa e decisioni consapevoli.
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Analisi bisogni e obiettivi.</li>
                <li>• Proposte su misura.</li>
                <li>• Supporto post-attivazione.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Aree di servizio"
              title="Categorie organizzate per esigenza"
              description="Ogni area è seguita da consulenti specializzati e processi chiari."
              tone="dark"
            />
          </Container>
        </section>

        <section className="py-6">
          <Container className="space-y-10">
            {serviceCategories.map((category) => (
              <ServiceCategory key={category.id} category={category} tone="light" />
            ))}
          </Container>
        </section>

        <section className="py-6">
          <Container className="grid gap-4 md:grid-cols-2">
            <Link
              href="/servizi/pagamenti"
              className="lux-card rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pagamenti
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Bollettini, F24 e PagoPA
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Supporto locale per operazioni di pagamento rapide e assistite.
              </p>
            </Link>
            <Link
              href="/servizi/telefonia"
              className="lux-card rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Telefonia
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Iliad, WindTre e Fastweb
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Attivazioni e consulenza in sede a Castellammare di Stabia.
              </p>
            </Link>
            <Link
              href="/servizi/energia"
              className="lux-card rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Energia
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Luce e gas con offerte ottimizzate
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Confronto tariffe e pratiche gestite localmente.
              </p>
            </Link>
            <Link
              href="/servizi/spid-pec-firma-digitale"
              className="lux-card rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Servizi digitali
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                SPID, PEC e firma digitale
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Attivazioni rapide con supporto Namirial.
              </p>
            </Link>
            <Link
              href="/servizi/web-agency"
              className="lux-card rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Web Agency
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                Siti web e gestionali su misura
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Progetti digitali pensati per aziende locali.
              </p>
            </Link>
          </Container>
        </section>

        <section className="py-16">
          <Container className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Attivazioni rapide", value: "Processi ottimizzati" },
              { label: "Consulenza su misura", value: "Soluzioni personalizzate" },
              { label: "Supporto continuo", value: "Sempre disponibile" },
            ].map((item) => (
              <div key={item.label} className="lux-card rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </Container>
        </section>
      </div>
    </div>
  );
}
