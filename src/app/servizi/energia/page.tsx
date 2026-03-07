import Link from "next/link";
import Container from "@/components/Container";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import { energyServiceDetails, getEnergyServiceSlugByCatalogTitle } from "@/lib/energy-services";

export function generateMetadata() {
  return buildMetadata({
    title: "Luce e gas a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: attivazioni luce e gas, confronto tariffe e supporto locale per privati e aziende.",
    path: "/servizi/energia",
  });
}

export default function EnergiaPage() {
  const category = serviceCategories.find((item) => item.id === "energia");
  const cardLinksByTitle = Object.fromEntries(
    energyServiceDetails.map((service) => [service.title, `/servizi/energia/${service.slug}`]),
  );

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Energia
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Energia Luce e Gas
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Attivazioni, volture e cambio fornitore con assistenza locale per
              privati e aziende.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=energia"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi consulenza
              </Link>
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Tutti i servizi
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Partner energia
            </p>
            <p className="mt-3 text-base text-slate-200">
              Ti supportiamo nella scelta tra più operatori, con un percorso
              operativo guidato in sede.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="-mt-8 py-6">
          <Container>
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:grid-cols-4">
              {[
                { label: "Operatori", value: `${energyServiceDetails.length}` },
                { label: "Servizi", value: "Luce + Gas" },
                { label: "Supporto", value: "In sede" },
                { label: "Pratiche", value: "Assistite" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-700">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Operatori e offerte</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                  Apri la scheda della tipologia energia
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-slate-600">
                  Ogni card è cliccabile: trovi vantaggi cliente finale, documenti richiesti e note pratiche operative.
                </p>
              </div>
              <Link
                href="/consulenza?service=energia"
                className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
              >
                Consulenza energetica guidata
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-2">
          <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {category?.items.map((item, index) => {
              const mappedSlug = getEnergyServiceSlugByCatalogTitle(item.title);
              const targetHref = cardLinksByTitle[item.title] || (mappedSlug ? `/servizi/energia/${mappedSlug}` : "/servizi/energia");

              return (
                <Link
                  key={item.title}
                  href={targetHref}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_24px_60px_rgba(8,47,73,0.14)]"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-cyan-100 to-transparent" />
                  <div className="relative">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                    <span className="mt-5 inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition group-hover:border-cyan-300 group-hover:text-cyan-700">
                      Apri scheda
                    </span>
                  </div>
                </Link>
              );
            })}
          </Container>
        </section>

        <section className="py-12">
          <Container className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "1. Analisi consumi",
                description: "Valutiamo situazione attuale e obiettivi su luce e gas.",
              },
              {
                title: "2. Scelta offerta",
                description: "Confronto guidato tra opzioni disponibili e supporto decisionale.",
              },
              {
                title: "3. Gestione pratica",
                description: "Attivazione, voltura o cambio fornitore con assistenza locale.",
              },
            ].map((step) => (
              <article key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-cyan-700">{step.title}</p>
                <p className="mt-3 text-sm text-slate-600">{step.description}</p>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-4">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Tutte le tipologie disponibili</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {energyServiceDetails.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/servizi/energia/${service.slug}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
