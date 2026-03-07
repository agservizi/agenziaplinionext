export type DigitalServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
};

export const digitalServiceDetails: DigitalServiceDetail[] = [
  {
    slug: "spid",
    title: "SPID",
    shortDescription: "Attivazione e supporto SPID con assistenza in sede.",
    heroDescription:
      "Ti guidiamo nell'attivazione SPID e nelle verifiche necessarie per ottenere credenziali valide per i principali servizi online.",
    customerBenefits: [
      "Procedura assistita passo-passo in sede.",
      "Riduzione errori in fase di identificazione.",
      "Supporto iniziale all'uso dei servizi digitali.",
    ],
    requiredInfo: ["Documento di identità valido.", "Codice fiscale.", "Email e numero di telefono personale."],
    notes: ["I requisiti possono variare in base al provider scelto.", "Le credenziali SPID sono personali e non cedibili."],
  },
  {
    slug: "pec",
    title: "PEC",
    shortDescription: "Attivazione caselle PEC per privati, professionisti e aziende.",
    heroDescription:
      "Supportiamo l'apertura e configurazione della PEC con indicazioni pratiche su uso, ricezione e invio comunicazioni certificate.",
    customerBenefits: ["Attivazione guidata.", "Supporto configurazione base.", "Assistenza su rinnovo e gestione operativa."],
    requiredInfo: ["Documento di identità.", "Codice fiscale o partita IVA.", "Email e telefono di riferimento."],
    notes: ["La PEC ha valore legale nelle comunicazioni ufficiali.", "Conserva sempre credenziali e ricevute invio/consegna."],
  },
  {
    slug: "firma-digitale",
    title: "Firma Digitale",
    shortDescription: "Richiesta e attivazione firma digitale con supporto operativo.",
    heroDescription:
      "Ti affianchiamo nella richiesta della firma digitale e nella configurazione iniziale per firmare documenti in modo conforme.",
    customerBenefits: ["Assistenza all'attivazione.", "Supporto sui primi utilizzi.", "Maggiore velocità nei processi documentali."],
    requiredInfo: ["Documento valido.", "Codice fiscale.", "Email e numero mobile."],
    notes: ["Dispositivo e modalità dipendono dalla soluzione scelta.", "Verifica la scadenza del certificato di firma."],
  },
  {
    slug: "partner-ufficiale-namirial",
    title: "Partner ufficiale Namirial",
    shortDescription: "Servizi digitali certificati Namirial con assistenza locale.",
    heroDescription:
      "Gestiamo servizi digitali in partnership con Namirial per attivazioni affidabili e supporto operativo in sede.",
    customerBenefits: ["Canale assistito locale.", "Servizi certificati.", "Supporto su pratiche digitali ricorrenti."],
    requiredInfo: ["Documento di identità.", "Codice fiscale.", "Contatto email e telefono."],
    notes: ["Disponibilità e condizioni dipendono dal servizio richiesto.", "Per pratiche avanzate possono servire verifiche aggiuntive."],
  },
  {
    slug: "posta-telematica",
    title: "Posta Telematica",
    shortDescription: "Supporto su gestione posta telematica e comunicazioni digitali.",
    heroDescription:
      "Ti aiutiamo a gestire comunicazioni telematiche con procedure semplici e assistenza locale sulle operazioni principali.",
    customerBenefits: ["Riduzione errori di invio.", "Supporto su formati e allegati.", "Assistenza pratica in sede."],
    requiredInfo: ["Dati destinatario.", "Documenti/allegati da inviare.", "Recapito per eventuali feedback."],
    notes: ["Verifica sempre indirizzi e oggetto prima dell'invio.", "Conserva ricevute e conferme quando disponibili."],
  },
  {
    slug: "invio-pec",
    title: "Invio PEC",
    shortDescription: "Invio comunicazioni PEC con supporto operativo dedicato.",
    heroDescription:
      "Assistiamo l'invio PEC con controllo preliminare dati e allegati per ridurre errori formali.",
    customerBenefits: ["Supporto su composizione messaggio.", "Controllo allegati e destinatario.", "Gestione operativa in sede."],
    requiredInfo: ["Testo o documento da inviare.", "Indirizzo PEC destinatario.", "Allegati corretti e completi."],
    notes: ["Le ricevute PEC sono parte della prova di invio/consegna.", "Controlla sempre formato e dimensione allegati."],
  },
  {
    slug: "invio-email",
    title: "Invio Email",
    shortDescription: "Supporto invio email operative e comunicazioni assistite.",
    heroDescription:
      "Ti aiutiamo a preparare e inviare email operative, con attenzione a contenuto, allegati e destinatari.",
    customerBenefits: ["Supporto pratico su invii singoli o ripetitivi.", "Controllo qualità prima dell'invio.", "Assistenza in sede."],
    requiredInfo: ["Contenuto messaggio.", "Indirizzi destinatari.", "Allegati da inviare."],
    notes: ["Verifica sempre gli indirizzi prima dell'invio.", "Per contenuti sensibili valuta canali certificati (PEC)."],
  },
];

export function getDigitalServiceBySlug(slug: string) {
  return digitalServiceDetails.find((item) => item.slug === slug) ?? null;
}

const digitalSlugByCatalogTitle: Record<string, string> = {
  SPID: "spid",
  PEC: "pec",
  "Firma Digitale": "firma-digitale",
  "Partner ufficiale Namirial": "partner-ufficiale-namirial",
  "Posta Telematica": "posta-telematica",
  "Invio PEC": "invio-pec",
  "Invio Email": "invio-email",
};

export function getDigitalServiceSlugByCatalogTitle(title: string) {
  return digitalSlugByCatalogTitle[title] ?? "";
}
