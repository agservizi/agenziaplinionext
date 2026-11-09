/**
 * Callers: Footer, /recensioni, ReviewInvite, confirmation UIs, sitemap.
 * API: reuses POST /api/contatti via ContactForm; GBP link + QR asset.
 * User plan: “Creare /recensioni e /lascia-un-feedback + QR/GBP + link trust”.
 */
import Image from "next/image";
import Link from "next/link";
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

const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
  "Ciao, vorrei lasciare un feedback su AG SERVIZI.",
)}`;
const smsLink = `sms:${company.phone.replace(/\s/g, "")}?body=${encodeURIComponent(
  "Feedback AG SERVIZI: ",
)}`;

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

          <section className="space-y-4 border border-[var(--ink)]/15 bg-white p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[var(--ink)]">Feedback privato</h2>
            <p className="text-sm leading-relaxed text-[var(--ink)]/65">
              Preferisci dirci qualcosa senza pubblicarlo? Compila il form: arriva in agenzia
              come un messaggio di contatto.
            </p>
            <ContactForm
              tone="light"
              initialService="Feedback privato"
              initialMessage="Vorrei lasciare un feedback su: "
              submitLabel="Invia feedback"
            />
          </section>

          <section className="space-y-4 border border-[var(--ink)]/15 p-6 print:border-black">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
              Script WA / SMS / email (per stampa o staff)
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ink)]/65">
              Messaggio policy-safe da inviare dopo un servizio riuscito (24–48h), senza chiedere
              stelle:
            </p>
            <blockquote className="border-l-2 border-[#5E0ED7] bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3 text-sm italic text-[var(--ink)]/75">
              “Ciao, grazie di essere passato da AG SERVIZI. Se vuoi, puoi raccontare la tua
              esperienza su Google o scriverci in privato da agenziaplinio.it/lascia-un-feedback.
              Solo se ti va.”
            </blockquote>
            <ul className="space-y-2 text-sm text-[var(--ink)]/70">
              <li>
                WhatsApp:{" "}
                <a href={waLink} className="text-[#5E0ED7] underline" target="_blank" rel="noopener noreferrer">
                  apri chat
                </a>
              </li>
              <li>
                SMS:{" "}
                <a href={smsLink} className="text-[#5E0ED7] underline">
                  {company.phone}
                </a>
              </li>
              <li>
                Email:{" "}
                <a href={`mailto:${company.email}`} className="text-[#5E0ED7] underline">
                  {company.email}
                </a>
              </li>
              <li>
                Pagina pubblica:{" "}
                <Link href="/recensioni" className="text-[#5E0ED7] underline">
                  /recensioni
                </Link>
              </li>
            </ul>
          </section>
        </Container>
      </div>
    </>
  );
}
