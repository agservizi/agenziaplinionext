export type PaymentServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
};

export const paymentServiceDetails: PaymentServiceDetail[] = [
  {
    slug: "bollettini-postali",
    title: "Bollettini postali",
    shortDescription: "Pagamento bollettini bianchi e premarcati in sede, con ricevuta immediata.",
    heroDescription:
      "Gestiamo il pagamento di bollettini postali bianchi e premarcati con verifica dei dati principali prima della conferma.",
    customerBenefits: [
      "Supporto nella compilazione dei campi principali.",
      "Conferma operazione e ricevuta al termine del pagamento.",
      "Servizio utile per utenze, contributi e versamenti ricorrenti.",
    ],
    requiredInfo: [
      "Bollettino cartaceo o dati del bollettino.",
      "Importo da versare.",
      "Documento valido per eventuali verifiche.",
    ],
    notes: [
      "I tempi di registrazione dipendono dal beneficiario.",
      "Conserva sempre la ricevuta dell'operazione.",
    ],
  },
  {
    slug: "pagopa",
    title: "Bollettini PagoPA",
    shortDescription: "Pagamento avvisi PagoPA verso enti pubblici e soggetti aderenti.",
    heroDescription:
      "Puoi pagare avvisi PagoPA per tasse, tributi, multe, ticket e altri servizi verso Pubblica Amministrazione ed enti aderenti.",
    customerBenefits: [
      "Procedura guidata con controllo codice avviso.",
      "Ricevuta pagamento rilasciata subito.",
      "Supporto in sede per evitare errori di digitazione.",
    ],
    requiredInfo: [
      "Avviso PagoPA (cartaceo o digitale).",
      "Codice avviso e importo.",
      "Metodo di pagamento disponibile al momento.",
    ],
    notes: [
      "Verifica sempre la data di scadenza dell'avviso.",
      "In caso di dubbi sull'ente creditore, ti aiutiamo in fase di controllo.",
    ],
  },
  {
    slug: "f24",
    title: "Deleghe F24",
    shortDescription: "Pagamento F24 per imposte, contributi e altri adempimenti fiscali.",
    heroDescription:
      "Eseguiamo pagamenti tramite modello F24 per imposte e contributi, con verifica preliminare della delega prima dell'invio.",
    customerBenefits: [
      "Supporto sulla correttezza dei dati inseriti nel modello.",
      "Gestione operativa più rapida in un unico punto.",
      "Ricevuta utile per archivio personale o aziendale.",
    ],
    requiredInfo: [
      "Modello F24 compilato.",
      "Dati anagrafici/fiscali coerenti con la delega.",
      "Importi e codici tributo già definiti.",
    ],
    notes: [
      "Non sostituisce consulenza fiscale professionale.",
      "Per compilazioni complesse consigliamo verifica con commercialista/CAF.",
    ],
  },
  {
    slug: "bollettini-bancari",
    title: "Bollettini bancari",
    shortDescription: "Pagamento bollettini verso fatturatori con IBAN bancario o postale.",
    heroDescription:
      "Gestiamo pagamenti verso beneficiari con coordinate bancarie o postali, con controllo dati e conferma dell'operazione.",
    customerBenefits: [
      "Assistenza in sede nella lettura dei riferimenti pagamento.",
      "Riduzione errori su causale e dati beneficiario.",
      "Ricevuta immediata da conservare.",
    ],
    requiredInfo: [
      "Documento di pagamento con IBAN e riferimenti.",
      "Importo dovuto.",
      "Dati identificativi richiesti dal beneficiario.",
    ],
    notes: [
      "Alcuni fatturatori possono avere tempi tecnici di registrazione.",
      "Porta sempre eventuali codici cliente/contratto presenti in bolletta.",
    ],
  },
  {
    slug: "mav-rav",
    title: "Bollettini MAV e RAV",
    shortDescription: "Pagamento avvisi MAV e RAV con assistenza operativa in agenzia.",
    heroDescription:
      "Eseguiamo pagamenti MAV e RAV verificando i riferimenti principali prima della conferma dell'operazione.",
    customerBenefits: [
      "Supporto diretto per identificare correttamente il codice avviso.",
      "Pagamento rapido senza procedure online complesse.",
      "Ricevuta rilasciata a fine operazione.",
    ],
    requiredInfo: [
      "Avviso MAV/RAV.",
      "Importo indicato nell'avviso.",
      "Documento per eventuali verifiche operative.",
    ],
    notes: [
      "Per importi elevati è consigliato verificare due volte i dati prima del pagamento.",
      "Conserva la ricevuta fino a conferma della posizione debitoria.",
    ],
  },
  {
    slug: "bollo-auto",
    title: "Bollo auto",
    shortDescription: "Pagamento bollo auto con verifica dei dati veicolo e scadenza.",
    heroDescription:
      "Puoi pagare il bollo auto in agenzia con supporto sul controllo dati principali del veicolo e dell'annualità di riferimento.",
    customerBenefits: [
      "Pagamento assistito senza passaggi complessi.",
      "Controllo operativo dei dati prima della conferma.",
      "Ricevuta utile per archivio personale.",
    ],
    requiredInfo: [
      "Targa del veicolo.",
      "Regione di riferimento (se richiesta dal circuito).",
      "Dati intestatario quando necessari.",
    ],
    notes: [
      "Verifica sempre l'annualità corretta prima del pagamento.",
      "In caso di casi particolari (esenzioni, riduzioni) è utile un controllo preventivo.",
    ],
  },
  {
    slug: "bonifici",
    title: "Bonifici bancari",
    shortDescription: "Supporto in sede per disposizioni di bonifico con controllo dati.",
    heroDescription:
      "Ti assistiamo nella disposizione di bonifici con verifica dei dati principali del beneficiario e della causale.",
    customerBenefits: [
      "Controllo operativo dei campi essenziali prima dell'invio.",
      "Maggiore tranquillità per importi importanti.",
      "Supporto locale in caso di dubbi sui dati.",
    ],
    requiredInfo: [
      "IBAN beneficiario.",
      "Intestatario e causale.",
      "Importo da trasferire.",
    ],
    notes: [
      "I tempi di accredito dipendono dal circuito bancario.",
      "Controlla sempre IBAN e intestatario prima della conferma.",
    ],
  },
];

export function getPaymentServiceBySlug(slug: string) {
  return paymentServiceDetails.find((item) => item.slug === slug) ?? null;
}

const paymentSlugByCatalogTitle: Record<string, string> = {
  "Bollettini (123 – 451 – 674 – 896)": "bollettini-postali",
  "Bonifici bancari": "bonifici",
  F24: "f24",
  PagoPA: "pagopa",
  "Tassa di possesso": "bollo-auto",
};

export function getPaymentServiceSlugByCatalogTitle(title: string) {
  return paymentSlugByCatalogTitle[title] ?? "";
}
