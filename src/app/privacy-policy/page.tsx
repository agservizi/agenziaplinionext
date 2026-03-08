import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { company } from "@/lib/site-data";

export function generateMetadata() {
  return buildMetadata({
    title: "Privacy Policy | AG SERVIZI",
    description:
      "Informativa privacy AG SERVIZI: trattamento dati, cookie e consenso secondo GDPR.",
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="lux-surface pb-20 pt-20 text-slate-900">
      <Container className="space-y-8">
        <div className="lux-panel rounded-3xl p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Informativa Privacy</h1>
          <p className="mt-3 text-sm text-slate-600">
            Questa informativa descrive come vengono trattati i dati personali degli utenti che
            navigano il sito, compilano i moduli di contatto, usano l’area clienti o richiedono i
            servizi offerti da AG SERVIZI, ai sensi del Regolamento UE 2016/679 (GDPR).
          </p>
        </div>

        <div className="lux-panel rounded-3xl p-8">
          <div className="space-y-6 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Titolare del trattamento</h2>
              <p className="mt-2">
                Il Titolare del trattamento è <strong>{company.legalName}</strong>, con sede in{" "}
                <strong>{company.address}</strong>.
              </p>
              <p>
                P. IVA: <strong>{company.vat}</strong> · Codice SDI: <strong>{company.sdi}</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Dati trattati</h2>
              <p className="mt-2">
                Possono essere trattati dati identificativi e di contatto come nome, cognome,
                email, numero di telefono, dati inseriti nei moduli, dati necessari alla gestione
                di pratiche, prenotazioni, spedizioni, visure, servizi CAF e Patronato, oltre ai
                dati tecnici di navigazione e ai consensi privacy/cookie.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Finalità del trattamento</h2>
              <p className="mt-2">I dati vengono trattati per:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>rispondere a richieste di contatto e di assistenza;</li>
                <li>gestire appuntamenti, pratiche e servizi richiesti dal cliente;</li>
                <li>consentire l’accesso all’area clienti e all’area amministrativa;</li>
                <li>gestire pagamenti, documenti, comunicazioni operative e fatturazione;</li>
                <li>adempiere a obblighi di legge, fiscali, amministrativi e di sicurezza.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Base giuridica</h2>
              <p className="mt-2">
                Il trattamento si basa sull’esecuzione di misure precontrattuali richieste
                dall’interessato, sull’esecuzione di un contratto o servizio richiesto, su obblighi
                di legge e, dove necessario, sul consenso espresso dall’utente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Modalità di trattamento</h2>
              <p className="mt-2">
                I dati sono trattati con strumenti elettronici e organizzativi adeguati a garantire
                riservatezza, integrità e disponibilità. L’accesso è limitato ai soli soggetti
                autorizzati o ai fornitori tecnici strettamente necessari all’erogazione dei
                servizi.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Conservazione dei dati</h2>
              <p className="mt-2">
                I dati sono conservati per il tempo strettamente necessario alla gestione della
                richiesta o del servizio, e comunque per i periodi previsti dalla normativa civile,
                fiscale, contabile e di tutela dei diritti del Titolare.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Comunicazione dei dati</h2>
              <p className="mt-2">
                I dati possono essere comunicati a fornitori e partner tecnici coinvolti
                nell’erogazione dei servizi (ad esempio hosting, pagamenti, email operative,
                integrazioni logistiche o provider di servizi richiesti), solo nei limiti necessari
                alla finalità del trattamento e nel rispetto della normativa applicabile.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Diritti dell’interessato</h2>
              <p className="mt-2">
                L’interessato può esercitare i diritti previsti dagli articoli 15-22 del GDPR,
                inclusi accesso, rettifica, cancellazione, limitazione, opposizione e portabilità,
                oltre al diritto di revocare il consenso quando previsto e di proporre reclamo
                all’Autorità Garante competente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Cookie e tracciamenti</h2>
              <p className="mt-2">
                Per quanto riguarda i cookie e gli strumenti di tracciamento utilizzati nel sito, si
                rimanda alla relativa{" "}
                <a href="/cookie-policy" className="font-semibold text-cyan-700 hover:text-cyan-600">
                  Cookie Policy
                </a>
                . Le preferenze possono essere aggiornate in qualunque momento tramite il pannello
                “Gestisci cookie”.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
