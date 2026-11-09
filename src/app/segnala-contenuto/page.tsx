import type { Metadata } from "next";
import Container from "@/components/Container";
import ContentReportForm from "@/components/compliance/ContentReportForm";
import { company } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Segnala un contenuto illecito",
  description:
    "Modulo di segnalazione contenuti illeciti (Digital Services Act). AG SERVIZI valuta e rimuove se necessario.",
  path: "/segnala-contenuto",
});

export default function SegnalaContenutoPage() {
  return (
    <div className="pb-24 pt-32">
      <Container className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
          Digital Services Act
        </p>
        <h1 className="display-type mt-3 text-4xl text-[var(--ink)] md:text-5xl">
          Segnala un contenuto
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ink)]/65">
          Se ritieni che un contenuto pubblicato o reso disponibile tramite i nostri servizi
          online sia illecito (diritti d&apos;autore, privacy, odio, frode, ecc.), segnalacelo.
          Valutiamo la segnalazione e, se opportuno, lo rimuoviamo o lo disabilitiamo.
        </p>
        <p className="mt-3 text-sm text-[var(--ink)]/55">
          Punto di contatto: {company.legalName} ·{" "}
          <a className="text-[#5E0ED7] underline" href="mailto:info@agenziaplinio.it">
            info@agenziaplinio.it
          </a>{" "}
          · {company.phone}
        </p>
        <ContentReportForm />
      </Container>
    </div>
  );
}
