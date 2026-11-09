/**
 * Callers: sitemap, LocalBusiness areaServed links. API: none. Schema: seoZones[].
 * User plan: “Pagine /prezzi, /zone x6, /guide x3, Plenitude/Sentra”.
 */
import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/lib/site-data";
import { seoZones } from "@/lib/seo-zones";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Zone servite | AG SERVIZI Castellammare e hinterland",
  description:
    "AG SERVIZI serve Castellammare di Stabia, Gragnano, Pompei, Torre Annunziata, Vico Equense e Piano di Sorrento.",
  path: "/zone",
});

export default function ZoneIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Zone", href: "/zone" }]} />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-10">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              Area
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">Zone servite</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">
              Sede unica in {company.address}. Da questi comuni arrivi facilmente per SPID,
              pagamenti, spedizioni ed energia.
            </p>
          </header>
          <ul className="grid gap-px bg-[var(--ink)]/10 sm:grid-cols-2">
            {seoZones.map((zone) => (
              <li key={zone.slug} className="bg-[var(--paper)] p-5">
                <Link href={`/zone/${zone.slug}`} className="group block space-y-2">
                  <h2 className="text-lg font-semibold text-[var(--ink)] group-hover:text-[#5E0ED7]">
                    {zone.name}
                  </h2>
                  <p className="line-clamp-2 text-sm text-[var(--ink)]/60">{zone.intro}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}
