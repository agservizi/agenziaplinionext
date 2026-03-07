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
                href="/consulenza"
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

      <div className="lux-surface text-slate-900">
        {/* ── Indice rapido ─────────────────────────────────────── */}
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Aree di servizio"
              title="Esplora tutte le categorie"
              description="Clicca su una categoria per visualizzare i servizi disponibili."
              tone="dark"
              align="center"
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {serviceCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-400 hover:text-cyan-700"
                >
                  {cat.title}
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Categorie servizi ─────────────────────────────────── */}
        <section className="space-y-8 py-10">
          <Container className="space-y-8">
            {serviceCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <ServiceCategory category={category} tone="light" />
              </div>
            ))}
          </Container>
        </section>

        {/* ── Punti di forza ────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <Container className="space-y-8">
            <SectionHeading
              eyebrow="Perché AG SERVIZI"
              title="Un partner operativo e affidabile"
              description="Competenza locale, processi chiari e supporto continuo per ogni servizio attivato."
              tone="dark"
              align="center"
            />
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Attivi dal", value: "2016" },
                { label: "Servizi gestiti", value: "30+" },
                { label: "Supporto", value: "Locale" },
                { label: "Clienti attivi", value: "500+" },
              ].map((stat) => (
                <div key={stat.label} className="lux-card rounded-2xl p-5 text-center">
                  <p className="text-3xl font-bold text-cyan-600">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── CTA finale ────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="lux-panel rounded-3xl p-10 md:p-14">
              <div className="mx-auto max-w-2xl space-y-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Hai trovato il servizio che cerchi?
                </p>
                <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  Parliamone insieme
                </h2>
                <p className="text-base text-slate-600">
                  Contattaci per una consulenza gratuita oppure accedi direttamente
                  alla tua area riservata per gestire pratiche e richieste online.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link
                    href="/consulenza"
                    className="rounded-full bg-cyan-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                  >
                    Richiedi consulenza
                  </Link>
                  <Link
                    href="/area-clienti"
                    className="rounded-full border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                  >
                    {"Accedi all'Area Clienti"}
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>

    </div>
  );
}
