import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { energyServiceDetails, getEnergyServiceBySlug } from "@/lib/energy-services";

type EnergyServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return energyServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: EnergyServiceDetailPageProps) {
  const resolved = await params;
  const service = getEnergyServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio energia",
      description: "Dettaglio servizio energia AG SERVIZI.",
      path: "/servizi/energia",
    });
  }

  return buildMetadata({
    title: `${service.title} a Castellammare di Stabia`,
    description: service.shortDescription,
    path: `/servizi/energia/${service.slug}`,
  });
}

export default async function EnergyServiceDetailPage({ params }: EnergyServiceDetailPageProps) {
  const resolved = await params;
  const service = getEnergyServiceBySlug(resolved.slug);

  if (!service) {
    notFound();
  }

  const relatedServices = energyServiceDetails
    .filter((item) => item.slug !== service.slug)
    .slice(0, 4);

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Energia
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{service.title}</h1>
            <p className="text-base text-slate-300 md:text-lg">{service.heroDescription}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=energia"
                className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Richiedi consulenza
              </Link>
              <Link
                href="/servizi/energia"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Torna a energia
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Info rapide</p>
            <p className="mt-3 text-sm text-slate-200">{service.shortDescription}</p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="-mt-8 py-6">
          <Container>
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Categoria</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Energia</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Modalità</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Attivazione assistita</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Supporto</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">In sede</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Vantaggi cliente finale
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Perché scegliere questa soluzione</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.customerBenefits.map((item) => (
                  <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Cosa portare
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Checklist pratica</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </Container>
        </section>

        <section className="py-4">
          <Container className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Verifica dati fornitura",
                text: "Controllo anagrafica, indirizzo, POD/PDR e documenti disponibili.",
              },
              {
                title: "2. Scelta soluzione",
                text: "Analisi guidata dell'offerta più adatta al profilo consumi.",
              },
              {
                title: "3. Avvio pratica",
                text: "Invio e supporto operativo fino alla conferma attivazione.",
              },
            ].map((step) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Note operative</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Informazioni utili</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {service.notes.map((item) => (
                  <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="py-4">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Operatori collegati</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Altri servizi energia</h2>
                </div>
                <Link
                  href="/servizi/energia"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  Vedi tutti
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {relatedServices.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/servizi/energia/${item.slug}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {item.title}
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
