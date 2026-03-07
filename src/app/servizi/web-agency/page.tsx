import Link from "next/link";
import Container from "@/components/Container";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import { webAgencyServiceDetails } from "@/lib/web-agency-services";

export function generateMetadata() {
  return buildMetadata({
    title: "Web Agency su misura",
    description:
      "AG SERVIZI: realizzazione siti web e gestionali su misura con supporto strategico e operativo.",
    path: "/servizi/web-agency",
  });
}

export default function WebAgencyPage() {
  const category = serviceCategories.find((item) => item.id === "web-agency");
  const cardLinksByTitle = Object.fromEntries(
    webAgencyServiceDetails.map((service) => [service.title, `/servizi/web-agency/${service.slug}`]),
  );

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Web Agency
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Web Agency su misura
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Progetti digitali su misura: siti web performanti e gestionali personalizzati.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=web-agency"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi una consulenza
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
              Progetti su misura
            </p>
            <p className="mt-3 text-base text-slate-200">
              Analisi obiettivi, UX e sviluppo con focus su performance e posizionamento locale.
            </p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="py-10">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Soluzioni disponibili</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                  Apri la scheda servizio web agency
                </h2>
              </div>
              <Link
                href="/consulenza?service=web-agency"
                className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
              >
                Analisi progetto
              </Link>
            </div>
          </Container>
        </section>

        <section className="py-2">
          <Container className="grid gap-5 md:grid-cols-2">
            {category?.items.map((item, index) => (
              <Link
                key={item.title}
                href={cardLinksByTitle[item.title] || "/servizi/web-agency"}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_24px_60px_rgba(8,47,73,0.14)]"
              >
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition group-hover:border-cyan-300 group-hover:text-cyan-700">
                  Apri scheda
                </span>
              </Link>
            ))}
          </Container>
        </section>

        <section className="py-12">
          <Container className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "1. Analisi obiettivi",
                description: "Raccogliamo esigenze, target e priorità del progetto digitale.",
              },
              {
                title: "2. Proposta soluzione",
                description: "Definiamo struttura, funzionalità e percorso operativo.",
              },
              {
                title: "3. Sviluppo e supporto",
                description: "Implementazione con assistenza locale e miglioramenti progressivi.",
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
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {webAgencyServiceDetails.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/servizi/web-agency/${service.slug}`}
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
