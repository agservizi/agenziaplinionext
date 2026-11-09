/**
 * Callers: sitemap, SEO hub. API: none. Schema: guideArticles[].
 * User plan: “/guide + 3 articoli”.
 */
import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { guideArticles } from "@/lib/guide-articles";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guide pratiche | AG SERVIZI Castellammare di Stabia",
  description:
    "Guide su SPID, PagoPA e spedizioni BRT/InPost a Castellammare di Stabia: documenti, tempi e cosa portare.",
  path: "/guide",
});

export default function GuideIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Guide", href: "/guide" }]} />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-10">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              Editoriale
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">Guide</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">
              Risposte chiare prima di venire in sede: documenti, tempi e passi pratici.
            </p>
          </header>
          <ul className="divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/15 bg-white">
            {guideArticles.map((article) => (
              <li key={article.slug} className="p-5 md:p-6">
                <Link href={`/guide/${article.slug}`} className="group block space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/40">
                    {article.updatedLabel}
                  </p>
                  <h2 className="text-lg font-semibold text-[var(--ink)] group-hover:text-[#5E0ED7]">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[var(--ink)]/60">{article.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </>
  );
}
