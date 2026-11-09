/**
 * Callers: Footer, /recensioni, ReviewInvite, confirmation UIs, sitemap.
 * API: reuses POST /api/contatti via ContactForm; GBP link + QR asset.
 * User plan: “Creare /recensioni e /lascia-un-feedback + QR/GBP + link trust”.
 */
import Image from "next/image";
import type { Metadata } from "next";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Lascia un feedback | AG SERVIZI Castellammare",
  description:
    "Racconta la tua esperienza su Google o inviaci un feedback privato. Nessun incentivo a stelle: solo ascolto.",
  path: "/lascia-un-feedback",
});

export default function LasciaUnFeedbackPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Lascia un feedback", href: "/lascia-un-feedback" }]} />
      <div className="pb-24 pt-32">
        <Container className="max-w-4xl space-y-12">
          <header className="space-y-4 border-b border-[var(--ink)]/15 pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
              Feedback
            </p>
            <h1 className="display-type text-4xl text-[var(--ink)] md:text-5xl">
              Lascia un feedback
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/65">
              Se sei soddisfatto, una recensione su Google aiuta chi cerca un&apos;agenzia
              affidabile a Castellammare. Se qualcosa non è andato, scrivici in privato: niente
              sconti o premi legati alle stelle (policy Google).
            </p>
          </header>

          <section className="grid gap-8 border border-[var(--ink)]/15 bg-white p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--ink)]">Recensione su Google</h2>
              <p className="text-sm leading-relaxed text-[var(--ink)]/65">
                Apri la scheda Google Business Profile e lascia un commento onesto. Il QR qui a
                fianco punta allo stesso link.
              </p>
              <a
                href={company.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-cta-ink inline-flex bg-[var(--ink)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#5E0ED7]"
              >
                Apri Google Business
              </a>
              <p className="text-xs text-[var(--ink)]/45">
                Link: {company.googleBusinessUrl}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 border border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_90%,white)] p-4">
              <Image
                src="/qr-google-recensione.svg"
                alt="QR code verso la scheda Google Business di AG SERVIZI"
                width={180}
                height={180}
                className="h-[180px] w-[180px]"
              />
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/45">
                Scansiona per recensire
              </p>
            </div>
          </section>

          <section className="space-y-5 border border-[var(--ink)]/15 bg-[var(--paper)] p-6 md:p-8">
            <div className="space-y-2 border-b border-[var(--ink)]/10 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
                Privato
              </p>
              <h2 className="display-type text-2xl text-[var(--ink)] md:text-3xl">
                Feedback privato
              </h2>
              <p className="text-sm leading-relaxed text-[var(--ink)]/65">
                Preferisci dirci qualcosa senza pubblicarlo? Compila il form: arriva in agenzia
                come un messaggio di contatto.
              </p>
            </div>
            <ContactForm
              tone="light"
              initialService="Feedback privato"
              initialMessage="Vorrei lasciare un feedback su: "
              submitLabel="Invia feedback"
            />
          </section>
        </Container>
      </div>
    </>
  );
}
