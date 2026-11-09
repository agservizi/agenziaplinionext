export type LogisticsServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
};

export const logisticsServiceDetails: LogisticsServiceDetail[] = [
  {
    slug: "spedizioni-nazionali",
    title: "Spedizioni nazionali",
    shortDescription: "Spedisci in tutta Italia. Prepariamo l'etichetta e organizziamo il ritiro.",
    heroDescription:
      "Devi spedire un pacco in Italia? Vieni in sede o usa l'area clienti online. Ti prepariamo l'etichetta, organizziamo il ritiro e puoi seguire il tracking.",
    customerBenefits: [
      "Ti aiutiamo a compilare i dati della spedizione e del destinatario.",
      "Scegliamo insieme il servizio giusto in base a urgenza e peso.",
      "Se il pacco si blocca o c'e un problema, lo seguiamo noi.",
    ],
    requiredInfo: [
      "Dati completi di chi spedisce e di chi riceve.",
      "Peso e dimensioni del collo, anche approssimative.",
      "Contenuto dichiarato e un numero di telefono.",
    ],
    notes: [
      "Imballa bene il pacco. Se l'imballaggio e scarso, il corriere puo rifiutarlo.",
      "I tempi di consegna cambiano in base alla zona e al periodo.",
    ],
  },
  {
    slug: "spedizioni-internazionali",
    title: "Spedizioni internazionali",
    shortDescription: "Spedizioni all'estero con documenti e tracking. Ci pensiamo noi.",
    heroDescription:
      "Devi mandare un pacco all'estero? Ti aiutiamo con i dati, la documentazione e i passaggi necessari. Se il pacco si ferma in dogana, lo seguiamo.",
    customerBenefits: [
      "Ti aiutiamo a compilare i dati per la spedizione internazionale.",
      "Prepariamo la documentazione richiesta dal corriere.",
      "Se il tracking mostra qualcosa di strano, ce ne occupiamo noi.",
    ],
    requiredInfo: [
      "Indirizzo completo del destinatario (con CAP e nazione).",
      "Contenuto della spedizione e valore dichiarato, se richiesto.",
      "Peso e dimensioni del collo.",
    ],
    notes: [
      "Per alcune destinazioni servono documenti aggiuntivi.",
      "Tempi e costi cambiano in base al paese e al periodo.",
    ],
  },
  {
    slug: "deposito-bagagli",
    title: "Deposito bagagli",
    shortDescription:
      "Informazioni sul deposito bagagli in agenzia: orari, documenti e come funziona. La prenotazione è sul modulo dedicato.",
    heroDescription:
      "Qui trovi come funziona il deposito in Via Plinio 72. Per prenotare e pagare usa il modulo prodotto dedicato.",
    customerBenefits: [
      "Prenoti online in un minuto, senza chiamare.",
      "Depositi e ritiri in agenzia, negli orari di apertura.",
      "Paghi solo per i giorni di deposito.",
    ],
    requiredInfo: [
      "Nome e cognome.",
      "Email per la conferma.",
      "Numero di borse o valigie.",
      "Data del deposito.",
    ],
    notes: [
      "Il deposito e disponibile negli orari di apertura dell'agenzia.",
      "La tariffa e giornaliera, per borsa.",
    ],
  },
  {
    slug: "invio-pratiche-send",
    title: "Invio pratiche SEND",
    shortDescription:
      "Guida al servizio SEND: documenti, IUN e cosa controlliamo. L'invio e il pagamento sono sul modulo /send.",
    heroDescription:
      "Questa pagina spiega il servizio. Per caricare documenti e completare il pagamento vai al modulo SEND dedicato.",
    customerBenefits: [
      "Controlliamo IUN, scadenze e documenti richiesti.",
      "Verifichiamo identità e deleghe prima dell'invio.",
      "Tracciamento della richiesta fino alla chiusura.",
    ],
    requiredInfo: [
      "Avviso o documento con codice IUN.",
      "Documento di identità del richiedente.",
      "Eventuali deleghe o allegati richiesti.",
    ],
    notes: [
      "Puoi procedere come ospite o dall'area clienti.",
      "Il pagamento avviene online prima dell'invio definitivo.",
    ],
  },
  {
    slug: "fermo-deposito",
    title: "Fermo deposito pacchi",
    shortDescription:
      "Custodia pacchi in agenzia da 0,50€ al giorno. Prenota online e ritira con codice LP.",
    heroDescription:
      "Hai un pacco in arrivo e non puoi ritirarlo? Prenota il fermo deposito: lo custodiamo in Via Plinio il Vecchio 72 fino al ritiro. Da 0,50 euro al giorno.",
    customerBenefits: [
      "Prenoti online e ricevi subito il codice LP.",
      "Custodiamo il pacco in agenzia fino al ritiro.",
      "Tariffa giornaliera chiara, a partire da 0,50€.",
    ],
    requiredInfo: [
      "Nome e cognome del destinatario.",
      "Data di ritiro prevista.",
      "Telefono o email (consigliati).",
      "Corriere e tracking, se li hai.",
    ],
    notes: [
      "Il servizio e disponibile negli orari di apertura dell'agenzia.",
      "La tariffa e giornaliera, per pacco.",
    ],
  },
];

export function getLogisticsServiceBySlug(slug: string) {
  return logisticsServiceDetails.find((item) => item.slug === slug) ?? null;
}

const logisticsSlugByCatalogTitle: Record<string, string> = {
  "Spedizioni nazionali": "spedizioni-nazionali",
  "Spedizioni internazionali": "spedizioni-internazionali",
  "Deposito bagagli": "deposito-bagagli",
  "Fermo deposito pacchi": "fermo-deposito",
  "Invio pratiche SEND": "invio-pratiche-send",
};

export function getLogisticsServiceSlugByCatalogTitle(title: string) {
  return logisticsSlugByCatalogTitle[title] ?? "";
}
