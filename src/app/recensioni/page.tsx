/**
 * Callers: Footer, HomeReviews, zone pages, sitemap.
 * API/schema: BreadcrumbJsonLd + googleReviews content; no REST.
 * User plan: “Creare /recensioni e /lascia-un-feedback + QR/GBP + link trust”.
 */
import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/lib/site-data";
import { googleReviews, googleReviewsCount } from "@/lib/google-reviews";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Recensioni Google | AG SERVIZI Castellammare di Stabia",
  description:
    "Cosa dicono i clienti di AG SERVIZI su Google: spedizioni, SPID, pagamenti e assistenza in Via Plinio 72.",
  path: "/recensioni",
});

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} su 5 stelle`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 13.8 5.2 16.4l.9-5.4L2.2 7.2l5.4-.8L10 1.5z"
            fill={i <= rating ? "#f59e0b" : "none"}
            stroke={i <= rating ? "#f59e0b" : "currentColor"}
            strokeWidth="1"
            className={i <= rating ? "" : "text-[var(--ink)]/20"}
          />
        </svg>
      ))}
    </span>
  );
}

export default function RecensioniPage() {
  const withText = googleReviews.filter((r) => r.text);

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Recensioni", href: "/recensioni" }]} />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-12">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              Trust
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">
              Recensioni
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">
              {googleReviewsCount} recensioni su Google per {company.name} a Castellammare di
              Stabia. Qui sotto i commenti pubblici; se sei passato in sede, puoi lasciare la
              tua quando vuoi.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={company.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-cta-ink inline-flex items-center bg-[var(--ink)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
              >
                Vedi su Google
              </a>
              <Link
                href="/lascia-un-feedback"
                className="inline-flex items-center border border-[var(--ink)]/20 bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
              >
                Lascia un feedback
              </Link>
            </div>
          </header>

          <ul className="divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/15 bg-white">
            {withText.map((review) => (
              <li key={review.name} className="space-y-3 p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">{review.name}</p>
                  <StarRow rating={review.rating} />
                </div>
                <p className="text-sm leading-relaxed text-[var(--ink)]/70">
                  &ldquo;{review.text}&rdquo;
                </p>
              </li>
            ))}
          </ul>

          <section className="border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Vuoi scrivere la tua?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]/65">
              Su Google la recensione è pubblica. Se preferisci dirci qualcosa in privato
              (anche un problema), usa la pagina feedback: niente incentivi, solo ascolto.
            </p>
            <Link
              href="/lascia-un-feedback"
              className="mt-4 inline-flex text-sm font-medium text-[#5E0ED7] underline-offset-2 hover:underline"
            >
              Vai a lascia un feedback →
            </Link>
          </section>
        </Container>
      </div>
    </>
  );
}
