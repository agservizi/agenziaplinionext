/**
 * Callers: sitemap, SEO hub links. API: none. Schema: publicPriceRows.
 * User plan: “Pagine /prezzi, /zone x6, /guide x3, Plenitude/Sentra”.
 */
import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { publicPriceRows, publicPricingDisclaimer } from "@/lib/public-pricing";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Prezzi orientativi | AG SERVIZI Castellammare di Stabia",
  description:
    "Listino orientativo SPID, PEC, PagoPA, spedizioni, deposito bagagli e fermo deposito. Conferma sempre in sede.",
  path: "/prezzi",
});

export default function PrezziPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Prezzi", href: "/prezzi" }]} />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-10">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              Listino
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">Prezzi</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">
              {publicPricingDisclaimer}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/prenota"
                className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
              >
                Prenota
              </Link>
              <Link
                href="/contatti"
                className="inline-flex border border-[var(--ink)]/20 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Contatti
              </Link>
            </div>
          </header>

          <div className="overflow-x-auto border border-[var(--ink)]/15 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]/55">
                <tr>
                  <th className="px-4 py-3">Servizio</th>
                  <th className="px-4 py-3">Da</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ink)]/10">
                {publicPriceRows.map((row) => (
                  <tr key={row.service}>
                    <td className="px-4 py-4">
                      <Link href={row.href} className="font-semibold text-[var(--ink)] hover:text-[#5E0ED7]">
                        {row.service}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-[var(--ink)]/80">{row.fromLabel}</td>
                    <td className="px-4 py-4 text-[var(--ink)]/60">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </div>
    </>
  );
}
