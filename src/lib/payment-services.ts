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
    shortDescription: "Porti il bollettino, lo compiliamo e lo paghi in sede. Ricevuta subito.",
    heroDescription:
      "Portaci il bollettino, bianco o premarcato. Lo compiliamo insieme, controlliamo i dati e lo paghi direttamente. Ricevuta in mano.",
    customerBenefits: [
      "Se non sai come compilarlo, lo facciamo noi.",
      "Ti diamo la ricevuta subito, da conservare.",
      "Utenze, contributi, affitti, versamenti ricorrenti: li gestiamo tutti.",
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
    shortDescription: "Multe, tasse, ticket sanitari. Porti l'avviso PagoPA e lo paghi qui.",
    heroDescription:
      "Hai un avviso PagoPA? Portalo in agenzia. Lo paghiamo in pochi minuti e ti diamo subito la ricevuta. Niente app, niente SPID.",
    customerBenefits: [
      "Controlliamo il codice avviso e l'importo prima di pagare.",
      "Ricevuta in mano subito dopo il pagamento.",
      "Se il codice non funziona o hai dubbi sull'ente, ci pensiamo noi.",
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
    shortDescription: "Porti il modello F24 compilato, controlliamo i dati e lo paghiamo in sede.",
    heroDescription:
      "Portaci il tuo F24. Controlliamo che i dati siano corretti e lo paghiamo. Ricevuta per il tuo archivio.",
    customerBenefits: [
      "Diamo un'occhiata ai dati prima di pagare, per sicurezza.",
      "Lo fai in un unico posto, senza passare dalla banca.",
      "Ti diamo la ricevuta da tenere per il commercialista.",
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
    shortDescription: "Pagamento con IBAN o coordinate bancarie. Controlliamo i dati insieme.",
    heroDescription:
      "Devi pagare qualcosa con un IBAN? Portaci il foglio con i dati. Controlliamo causale e coordinate e facciamo il pagamento.",
    customerBenefits: [
      "Se non capisci i riferimenti sul foglio, te li spieghiamo.",
      "Controlliamo IBAN e causale prima di pagare.",
      "Ricevuta subito, da conservare.",
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
    shortDescription: "Porti il MAV o il RAV, controlliamo il codice e lo paghi in agenzia.",
    heroDescription:
      "Hai un MAV o un RAV da pagare? Portalo da noi. Controlliamo il codice avviso e l'importo, e lo paghiamo in pochi minuti.",
    customerBenefits: [
      "Se non trovi il codice avviso, ti aiutiamo a identificarlo.",
      "Lo paghi qui, senza dover andare online o in banca.",
      "Ricevuta in mano a fine operazione.",
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
    shortDescription: "Paghi il bollo auto in agenzia. Basta la targa.",
    heroDescription:
      "Porta la targa, controlliamo l'annualita e l'importo, e paghi il bollo auto direttamente in sede. Pochi minuti.",
    customerBenefits: [
      "Non devi fare niente online, lo fai qui.",
      "Controlliamo targa, importo e annualita prima di confermare.",
      "Ricevuta da conservare.",
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
    shortDescription: "Devi fare un bonifico? Controlliamo IBAN e causale e lo facciamo insieme.",
    heroDescription:
      "Portaci i dati del beneficiario. Controlliamo l'IBAN, la causale e l'importo prima di inviare. Se qualcosa non ti torna, ne parliamo.",
    customerBenefits: [
      "Controlliamo IBAN, intestatario e causale prima di confermare.",
      "Se l'importo e alto e vuoi essere sicuro, facciamo tutto con calma.",
      "Se hai dubbi su un dato, ti aiutiamo a verificarlo.",
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
  {
    slug: "versamento-passaporto",
    title: "Versamento passaporto",
    shortDescription: "Pagamento del bollettino per rilascio o rinnovo del passaporto, direttamente in sede.",
    heroDescription:
      "Devi fare il versamento per il passaporto? Vieni in agenzia con un documento. Paghiamo il bollettino e ti diamo la ricevuta da portare in Questura.",
    customerBenefits: [
      "Non devi cercare l'importo o il conto corrente, lo sappiamo gia.",
      "Paghiamo il bollettino e ti diamo subito la ricevuta.",
      "Se hai dubbi su cosa serve per la richiesta del passaporto, ti diamo le indicazioni.",
    ],
    requiredInfo: [
      "Documento di identita valido.",
      "Codice fiscale.",
      "Dati per la compilazione del bollettino (te li forniamo noi se non li hai).",
    ],
    notes: [
      "L'importo del versamento e stabilito dal Ministero e puo variare.",
      "Conserva la ricevuta: serve per la pratica in Questura o al Comune.",
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
  "Versamento passaporto": "versamento-passaporto",
};

export function getPaymentServiceSlugByCatalogTitle(title: string) {
  return paymentSlugByCatalogTitle[title] ?? "";
}
