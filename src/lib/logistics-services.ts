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
    shortDescription: "Prenota online il deposito bagagli e ritira in agenzia a Castellammare di Stabia.",
    heroDescription:
      "Devi lasciare le valigie per qualche ora? Prenota online, deposita in Via Plinio il Vecchio 72 e ritira quando vuoi. Paghi a giornata.",
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
];

export function getLogisticsServiceBySlug(slug: string) {
  return logisticsServiceDetails.find((item) => item.slug === slug) ?? null;
}

const logisticsSlugByCatalogTitle: Record<string, string> = {
  "Spedizioni nazionali": "spedizioni-nazionali",
  "Spedizioni internazionali": "spedizioni-internazionali",
  "Deposito bagagli": "deposito-bagagli",
};

export function getLogisticsServiceSlugByCatalogTitle(title: string) {
  return logisticsSlugByCatalogTitle[title] ?? "";
}
