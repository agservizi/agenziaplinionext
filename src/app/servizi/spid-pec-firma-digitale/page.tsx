import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  const meta = buildMetadata({
    title: "SPID, PEC e Firma Digitale a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: attivazioni SPID, PEC e Firma Digitale con supporto Namirial e assistenza in sede.",
    path: "/servizi/spid-pec-firma-digitale",
  });

  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      canonical: "https://agenziaplinio.it/servizi/digitali",
    },
  };
}

export default function SpidPecFirmaPage() {
  const category = serviceCategories.find((item) => item.id === "digitali");

  return (
    <div className="pb-24">
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] pt-40 pb-16 text-[var(--ink)]">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Servizi digitali
            </p>
            <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">
              SPID, PEC e Firma Digitale a Castellammare di Stabia
            </h1>
            <p className="text-base text-[var(--ink)]/40 md:text-lg">
              Attivazioni rapide, assistenza Namirial e supporto completo per
              identità digitale, PEC e firma elettronica.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=digitali"
                className="cta-glass cta-glass-md cta-glass-primary-light"
              >
                Richiedi assistenza
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/40">
              Partner Namirial
            </p>
            <p className="mt-3 text-base text-[var(--ink)]/55">
              Attivazioni certificate, verifica documentale e supporto post
              attivazione per servizi digitali.
            </p>
          </div>
        </Container>
      </section>

      <div className="bg-[var(--paper)] pt-10 text-[var(--ink)]">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Identità digitale"
              title="SPID, PEC e firma digitale con supporto locale"
              description="Procedura assistita, tempi rapidi e consulenza dedicata in sede."
              tone="dark"
            />
          </Container>
        </section>

        <section className="py-6">
          <Container className="grid gap-6 md:grid-cols-2">
            {category?.items.map((item) => (
              <div key={item.title} className="lux-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--ink)]">{item.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink)]/65">{item.description}</p>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-12">
          <Container className="lux-panel rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              Servizi digitali a Castellammare di Stabia
            </h2>
            <p className="mt-3 text-sm text-[var(--ink)]/65">
              Supporto completo su attivazioni, rinnovi e gestione dei servizi
              digitali essenziali per privati e aziende.
            </p>
          </Container>
        </section>
      </div>
    </div>
  );
}
