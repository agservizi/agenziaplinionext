/**
 * Callers: /zone index + sitemap. API: none. Schema: SeoZone from seo-zones.ts.
 * User plan: “/zone + 6 landing — template unico + dati in seo-zones.ts”.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { company, getOpeningHours } from "@/lib/site-data";
import { getSeoZoneBySlug, seoZones } from "@/lib/seo-zones";
import { buildMetadata } from "@/lib/seo";

type ZonePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return seoZones.map((z) => ({ slug: z.slug }));
}

export async function generateMetadata({ params }: ZonePageProps) {
  const { slug } = await params;
  const zone = getSeoZoneBySlug(slug);
  if (!zone) {
    return buildMetadata({ title: "Zona", description: "Area servita AG SERVIZI.", path: "/zone" });
  }
  return buildMetadata({
    title: `Servizi a ${zone.name} | AG SERVIZI Castellammare`,
    description: zone.intro,
    path: `/zone/${zone.slug}`,
  });
}

export default async function ZoneDetailPage({ params }: ZonePageProps) {
  const { slug } = await params;
  const zone = getSeoZoneBySlug(slug);
  if (!zone) notFound();
  const hours = getOpeningHours();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Zone", href: "/zone" },
          { name: zone.name, href: `/zone/${zone.slug}` },
        ]}
      />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-10">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              {zone.name} ({zone.provinceHint})
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">
              AG SERVIZI per {zone.name}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">{zone.intro}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/prenota"
                className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
              >
                Prenota
              </Link>
              <Link
                href="/contatti"
                className="inline-flex border border-[var(--ink)]/20 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)]"
              >
                Contatti
              </Link>
            </div>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Servizi più richiesti</h2>
            <ul className="grid gap-px bg-[var(--ink)]/10 sm:grid-cols-2">
              {zone.servicesFocus.map((item) => (
                <li key={item.href} className="bg-white p-5">
                  <Link href={item.href} className="block space-y-1 hover:text-[#5E0ED7]">
                    <p className="font-semibold text-[var(--ink)]">{item.title}</p>
                    <p className="text-sm text-[var(--ink)]/60">{item.blurb}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-6 text-sm text-[var(--ink)]/70">
            <h2 className="text-lg font-semibold text-[var(--ink)]">NAP</h2>
            <p className="mt-2">{company.address}</p>
            <p className="mt-1">
              Tel{" "}
              <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-[#5E0ED7]">
                {company.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${company.email}`} className="text-[#5E0ED7]">
                {company.email}
              </a>
            </p>
            <ul className="mt-3 space-y-1">
              {hours.map((row) => (
                <li key={row.day}>
                  {row.day}: {row.hours}
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </div>
    </>
  );
}
