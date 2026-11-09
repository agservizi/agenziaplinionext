import Link from "next/link";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import { getCmsLogisticsServices } from "@/lib/cms/server";
const logisticsServiceDetails = getCmsLogisticsServices();

export function generateMetadata() {
  return buildMetadata({
    title: "Servizi logistici a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: spedizioni nazionali e internazionali con supporto operativo e tracciamento.",
    path: "/servizi/logistica",
  });
}

export default function LogisticaPage() {
  const category = serviceCategories.find((item) => item.id === "logistica");
  const cardLinksByTitle: Record<string, string> = {
    ...Object.fromEntries(
      logisticsServiceDetails.map((service) => [service.title, `/servizi/logistica/${service.slug}`]),
    ),
    "Deposito bagagli": "/deposito-bagagli",
    "Fermo deposito pacchi": "/fermo-deposito",
  };

  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: "Servizi", href: "/servizi" },
      { name: "Logistica", href: "/servizi/logistica" },
    ]} />
    <div className="pb-24">
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] pt-40 pb-16 text-[var(--ink)]">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Servizi Logistici</p>
            <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">Spedizioni assistite</h1>
            <p className="text-base text-[var(--ink)]/40 md:text-lg">
              Ti supportiamo su spedizioni nazionali e internazionali con controllo dati, gestione pratica e tracciamento.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=logistica"
                className="cta-glass cta-glass-md cta-glass-primary-light"
              >
                Richiedi supporto
              </Link>
              <Link
                href="/servizi"
                className="cta-glass cta-glass-md cta-glass-secondary"
              >
                Tutti i servizi
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/40">Operatività locale</p>
            <p className="mt-3 text-base text-[var(--ink)]/55">
              Ti aiutiamo a preparare la spedizione correttamente e a gestire eventuali criticità operative.
            </p>
          </div>
        </Container>
      </section>

      <div className="bg-[var(--paper)] pb-20 text-[var(--ink)]">
        <section className="py-10">
          <Container className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Tipologie disponibili</p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)] md:text-4xl">Apri la scheda servizio</h2>
            </div>
          </Container>
        </section>

        <section className="py-2">
          <Container className="grid gap-5 md:grid-cols-2">
            {category?.items.map((item, index) => (
              <Link
                key={item.title}
                href={cardLinksByTitle[item.title] || "/servizi/logistica"}
                className="group relative overflow-hidden rounded-3xl border border-[var(--ink)]/15 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_24px_60px_rgba(8,47,73,0.14)]"
              >
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--ink)] px-2 text-xs font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink)]/65">{item.description}</p>
                <span className="mt-5 inline-flex items-center rounded-full border border-[var(--ink)]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--ink)]/65 transition group-hover:border-cyan-300 group-hover:text-cyan-700">
                  Apri scheda
                </span>
              </Link>
            ))}
          </Container>
        </section>
      </div>
    </div>
    </>
  );
}
