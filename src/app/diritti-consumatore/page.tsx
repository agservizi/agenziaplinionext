import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { company } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Diritti del consumatore, recesso e abbonamenti",
  description:
    "Informazioni su prezzo, pagamenti one-shot, assenza di rinnovo automatico e come esercitare il recesso presso AG SERVIZI.",
  path: "/diritti-consumatore",
});

export default function DirittiConsumatorePage() {
  return (
    <div className="pb-24 pt-32">
      <Container className="max-w-3xl space-y-10">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#5E0ED7]">
            Trasparenza
          </p>
          <h1 className="display-type mt-3 text-4xl text-[var(--ink)] md:text-5xl">
            Diritti del consumatore
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink)]/65">
            Questa pagina riassume come funzionano pagamenti e recesso sui servizi online di{" "}
            {company.name}. Non sostituisce le condizioni contrattuali specifiche del singolo
            servizio né una consulenza legale.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Prezzo e pagamento</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--ink)]/70">
            <li>
              Prima di andare a Stripe vedi sempre l&apos;importo totale del servizio (in euro,
              IVA inclusa se applicabile al caso).
            </li>
            <li>
              I checkout online usano Stripe in modalità <strong>pagamento unico</strong> (non
              abbonamento).
            </li>
            <li>
              Non risultano, nel sistema attuale, contratti a rinnovo automatico con addebito
              ricorrente gestiti dalla piattaforma.
            </li>
          </ul>
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Recesso e art. 54-bis Codice del consumo
          </h2>
          <p className="text-sm leading-relaxed text-[var(--ink)]/70">
            Dal 19 giugno 2026, per i contratti a distanza con rinnovo automatico, la legge
            italiana richiede un percorso di disdetta online chiaro. Poiché oggi non attiviamo
            abbonamenti a rinnovo automatico via Stripe, non c&apos;è un pulsante “disdici
            abbonamento”. Se in futuro verranno introdotti, questa pagina indicherà il flusso
            dedicato.
          </p>
          <p className="text-sm leading-relaxed text-[var(--ink)]/70">
            Per esercitare il recesso sui servizi a distanza (quando spettante) o per qualsiasi
            richiesta su un pagamento già effettuato:
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--ink)]/70">
            <li>
              Scrivi a{" "}
              <a className="text-[#5E0ED7] underline" href="mailto:info@agenziaplinio.it">
                info@agenziaplinio.it
              </a>{" "}
              oppure usa{" "}
              <Link href="/contatti" className="text-[#5E0ED7] underline">
                Contatti
              </Link>
              .
            </li>
            <li>Indica nome, email usata al pagamento, data e importo (o codice pratica).</li>
            <li>Ti rispondiamo con conferma e istruzioni (rimborso/annullo se dovuto).</li>
          </ol>
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Contatti titolare</h2>
          <p className="text-sm text-[var(--ink)]/70">
            {company.legalName}
            <br />
            {company.address}
            <br />
            P.IVA {company.vat} · SDI {company.sdi}
            <br />
            Tel. {company.phone}
          </p>
        </section>
      </Container>
    </div>
  );
}
