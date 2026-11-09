/**
 * Callers: /guide index + sitemap. API: none. Schema: GuideArticle + FAQ JSON-LD.
 * User plan: “/guide + 3 articoli … FAQ H2/H3 + FaqJsonLd”.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ItemsFaqJsonLd from "@/components/seo/ItemsFaqJsonLd";
import { getGuideBySlug, guideArticles } from "@/lib/guide-articles";
import { buildMetadata } from "@/lib/seo";

type GuidePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guideArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) {
    return buildMetadata({ title: "Guida", description: "Guide AG SERVIZI.", path: "/guide" });
  }
  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/guide/${article.slug}`,
  });
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Guide", href: "/guide" },
          { name: article.title, href: `/guide/${article.slug}` },
        ]}
      />
      <ItemsFaqJsonLd items={article.faqs} />
      <div className="pb-24 pt-32">
        <Container className="max-w-3xl space-y-10">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              {article.updatedLabel}
            </p>
            <h1 className="display-type text-3xl text-[var(--ink)] md:text-4xl">{article.title}</h1>
            <p className="text-sm leading-relaxed text-[var(--ink)]/65">{article.description}</p>
          </header>

          {article.sections.map((section) => (
            <section key={section.h2} className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--ink)]">{section.h2}</h2>
              {section.body.map((p) => (
                <p key={p.slice(0, 48)} className="text-sm leading-relaxed text-[var(--ink)]/70">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section className="space-y-4 border border-[var(--ink)]/15 bg-white p-6">
            <h2 className="text-xl font-semibold text-[var(--ink)]">FAQ</h2>
            {article.faqs.map((faq) => (
              <div
                key={faq.q}
                className="space-y-1 border-t border-[var(--ink)]/10 pt-4 first:border-0 first:pt-0"
              >
                <h3 className="text-sm font-semibold text-[var(--ink)]">{faq.q}</h3>
                <p className="text-sm text-[var(--ink)]/65">{faq.a}</p>
              </div>
            ))}
          </section>

          <p className="text-sm">
            <Link href="/prenota" className="font-medium text-[#5E0ED7] underline-offset-2 hover:underline">
              Prenota in sede
            </Link>
            {" · "}
            <Link href="/guide" className="text-[var(--ink)]/55 underline-offset-2 hover:underline">
              Tutte le guide
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
