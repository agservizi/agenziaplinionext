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
    shortDescription: "Attivazione SPID in sede. Vieni con un documento, esci con lo SPID attivo.",
    heroDescription:
      "Lo SPID lo facciamo in 20 minuti, in agenzia. Ti guidiamo in ogni passaggio e controllo, cosi non devi ripetere la procedura.",
    customerBenefits: [
      "Facciamo tutto insieme in sede, passo dopo passo.",
      "Controlliamo i dati prima dell'invio, cosi non ci sono scarti.",
      "Se e la prima volta che usi i servizi online della PA, ti spieghiamo come funzionano.",
    ],
    requiredInfo: ["Documento di identita valido.", "Codice fiscale.", "Email e numero di telefono personale."],
    notes: ["I requisiti possono variare in base al provider scelto.", "Le credenziali SPID sono personali e non cedibili."],
  },
  {
    slug: "pec",
    title: "PEC",
    shortDescription: "Apriamo e configuriamo la tua casella PEC, per privati e aziende.",
    heroDescription:
      "Ti serve una PEC? Vieni in sede, la attiviamo e ti spieghiamo come usarla per inviare e ricevere comunicazioni certificate.",
    customerBenefits: ["Ti attiviamo la casella e ti mostriamo come accedere.", "Se non sai configurarla, lo facciamo noi.", "Quando scade, ti aiutiamo col rinnovo."],
    requiredInfo: ["Documento di identita.", "Codice fiscale o partita IVA.", "Email e telefono di riferimento."],
    notes: ["La PEC ha valore legale nelle comunicazioni ufficiali.", "Conserva sempre credenziali e ricevute invio/consegna."],
  },
  {
    slug: "firma-digitale",
    title: "Firma Digitale",
    shortDescription: "Attivazione firma digitale in agenzia, con spiegazione dei primi utilizzi.",
    heroDescription:
      "Attiviamo la firma digitale e ti mostriamo come usarla. Cosi puoi firmare documenti dal tuo computer senza stampare niente.",
    customerBenefits: ["Ti attiviamo la firma e verifichiamo che funzioni.", "Ti facciamo vedere come firmare i primi documenti.", "Non devi piu stampare, firmare a mano e scannerizzare."],
    requiredInfo: ["Documento valido.", "Codice fiscale.", "Email e numero mobile."],
    notes: ["Dispositivo e modalita dipendono dalla soluzione scelta.", "Verifica la scadenza del certificato di firma."],
  },
  {
    slug: "partner-ufficiale-namirial",
    title: "Partner ufficiale Namirial",
    shortDescription: "Siamo punto autorizzato Namirial per SPID, PEC e firma digitale.",
    heroDescription:
      "Come partner Namirial, attiviamo i servizi digitali direttamente in sede. Un unico posto per SPID, PEC e firma digitale.",
    customerBenefits: ["Fai tutto in un unico punto, senza rimbalzi tra siti e call center.", "Servizi certificati Namirial.", "Se hai bisogno di rinnovi o assistenza, torna da noi."],
    requiredInfo: ["Documento di identita.", "Codice fiscale.", "Contatto email e telefono."],
    notes: ["Disponibilita e condizioni dipendono dal servizio richiesto.", "Per pratiche avanzate possono servire verifiche aggiuntive."],
  },
  {
    slug: "posta-telematica",
    title: "Posta Telematica",
    shortDescription: "Ti aiutiamo a inviare e gestire comunicazioni telematiche.",
    heroDescription:
      "Se devi inviare qualcosa per via telematica e non sai come fare, vieni in sede. Controlliamo tutto e lo inviamo insieme.",
    customerBenefits: ["Controlliamo indirizzi e allegati prima di inviare.", "Ti aiutiamo con i formati e le dimensioni dei file.", "Se qualcosa non va, lo vediamo subito."],
    requiredInfo: ["Dati destinatario.", "Documenti/allegati da inviare.", "Recapito per eventuali feedback."],
    notes: ["Verifica sempre indirizzi e oggetto prima dell'invio.", "Conserva ricevute e conferme quando disponibili."],
  },
  {
    slug: "invio-pec",
    title: "Invio PEC",
    shortDescription: "Devi mandare una PEC? Controlliamo i dati e la inviamo in sede.",
    heroDescription:
      "Prima di inviare la PEC, controlliamo destinatario, allegati e contenuto. Cosi eviti errori che poi sono difficili da correggere.",
    customerBenefits: ["Ti aiutiamo a scrivere il messaggio, se serve.", "Controlliamo che l'indirizzo PEC sia corretto.", "Inviamo da sede e ti diamo la ricevuta."],
    requiredInfo: ["Testo o documento da inviare.", "Indirizzo PEC destinatario.", "Allegati corretti e completi."],
    notes: ["Le ricevute PEC sono la prova che hai inviato e che il destinatario ha ricevuto.", "Controlla formato e dimensione degli allegati."],
  },
  {
    slug: "invio-email",
    title: "Invio Email",
    shortDescription: "Ti aiutiamo a preparare e inviare email, singole o in blocco.",
    heroDescription:
      "Se devi mandare una email importante o tante email insieme, vieni in sede. Controlliamo tutto prima di cliccare Invia.",
    customerBenefits: ["Invii singoli o ripetitivi, ti aiutiamo con entrambi.", "Rileggiamo il contenuto prima di inviare.", "Se non hai un computer, usiamo il nostro."],
    requiredInfo: ["Contenuto messaggio.", "Indirizzi destinatari.", "Allegati da inviare."],
    notes: ["Verifica sempre gli indirizzi prima dell'invio.", "Per contenuti sensibili, meglio usare la PEC."],
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
