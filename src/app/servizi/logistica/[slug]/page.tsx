import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/lib/seo";
import { getCmsLogisticsServices } from "@/lib/cms/server";

function getLogisticsServiceBySlug(slug: string) {
  return getCmsLogisticsServices().find((item) => item.slug === slug) ?? null;
}

const logisticsServiceDetails = getCmsLogisticsServices();

type LogisticsServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return logisticsServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: LogisticsServiceDetailPageProps) {
  const resolved = await params;
  const service = getLogisticsServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio logistico",
      description: "Dettaglio servizio logistico AG SERVIZI.",
      path: "/servizi/logistica",
    });
  }

  return buildMetadata({
    title: `${service.title} a Castellammare di Stabia`,
    description: service.shortDescription,
    path: `/servizi/logistica/${service.slug}`,
  });
}

export default async function LogisticsServiceDetailPage({ params }: LogisticsServiceDetailPageProps) {
  const resolved = await params;
  const service = getLogisticsServiceBySlug(resolved.slug);
  if (!service) notFound();

  const relatedServices = logisticsServiceDetails.filter((item) => item.slug !== service.slug).slice(0, 4);

  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: "Servizi", href: "/servizi" },
      { name: "Logistica", href: "/servizi/logistica" },
      { name: service.title, href: `/servizi/logistica/${service.slug}` },
    ]} />
    <div className="pb-24">
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] pt-40 pb-16 text-[var(--ink)]">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Servizi Logistici</p>
          <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">{service.title}</h1>
          <p className="max-w-3xl text-base text-[var(--ink)]/40 md:text-lg">{service.heroDescription}</p>
          <div className="flex flex-wrap gap-4">
            {service.slug === "fermo-deposito" ? (
              <Link href="/fermo-deposito" className="cta-glass cta-glass-md cta-glass-primary-light">
                Prenota fermo deposito
              </Link>
            ) : service.slug === "deposito-bagagli" ? (
              <Link href="/deposito-bagagli" className="cta-glass cta-glass-md cta-glass-primary-light">
                Prenota deposito bagagli
              </Link>
            ) : (
              <Link href="/consulenza?service=logistica" className="cta-glass cta-glass-md cta-glass-primary-light">
                Richiedi supporto
              </Link>
            )}
            <Link href="/servizi/logistica" className="cta-glass cta-glass-md cta-glass-secondary">Torna a logistica</Link>
          </div>
        </Container>
      </section>

      <div className="bg-[var(--paper)] pb-20 text-[var(--ink)]">
        <section className="py-10">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">Vantaggi</h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--ink)]/65">
                {service.customerBenefits.map((item) => (
                  <li key={item} className="rounded-xl bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3">{item}</li>
                ))}
              </ul>
            </article>
            <aside className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">Cosa portare</h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--ink)]/65">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600" /><span>{item}</span></li>
                ))}
              </ul>
            </aside>
          </Container>
        </section>
<section className="py-4">
          <Container>
            <div className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">Note operative</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {service.notes.map((item) => (
                  <li key={item} className="rounded-xl border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3 text-sm text-[var(--ink)]/65">{item}</li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {relatedServices.map((item) => (
                  <Link key={item.slug} href={`/servizi/logistica/${item.slug}`} className="rounded-xl border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3 text-sm font-medium text-[var(--ink)]/65 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
    </>
  );
}
