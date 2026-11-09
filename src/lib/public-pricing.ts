/**
 * Callers: /prezzi page. Orientative public listino (not contractual quote).
 * User plan: SEO /prezzi.
 */
export type PublicPriceRow = {
  service: string;
  fromLabel: string;
  note: string;
  href: string;
};

export const publicPricingDisclaimer =
  "Importi orientativi in agenzia. Il totale definitivo dipende da documenti, destinazione, provider e periodo. Chiedi conferma in sede o in prenotazione.";

export const publicPriceRows: PublicPriceRow[] = [
  {
    service: "SPID",
    fromLabel: "Su preventivo in sede",
    note: "Tempi e costi dipendono dal provider e dalla pratica.",
    href: "/servizi/digitali/spid",
  },
  {
    service: "PEC / Firma digitale",
    fromLabel: "Su listino Namirial",
    note: "Attivazione e rinnovo con assistenza in Via Plinio 72.",
    href: "/servizi/spid-pec-firma-digitale",
  },
  {
    service: "PagoPA e bollettini",
    fromLabel: "Importo ente + diritto sportello",
    note: "Paghi l’importo dovuto all’ente; ti diciamo il diritto di agenzia prima di procedere.",
    href: "/servizi/pagamenti/pagopa",
  },
  {
    service: "Spedizioni nazionali",
    fromLabel: "Da preventivo peso/zona",
    note: "BRT / InPost in base a destinazione e collo.",
    href: "/servizi/logistica/spedizioni-nazionali",
  },
  {
    service: "Deposito bagagli",
    fromLabel: "Tariffa giornaliera / borsa",
    note: "Prenota online: il totale si calcola in fase di prenotazione.",
    href: "/deposito-bagagli",
  },
  {
    service: "Fermo deposito pacchi",
    fromLabel: "Da 0,50 € / giorno",
    note: "Custodia in agenzia fino al ritiro con codice LP.",
    href: "/fermo-deposito",
  },
  {
    service: "Pratiche SEND",
    fromLabel: "Preventivo in base all’avviso",
    note: "Carichi documenti e paghi online prima dell’invio.",
    href: "/send",
  },
  {
    service: "Consulenza telefonia / energia",
    fromLabel: "Consulenza gratuita",
    note: "Analizziamo offerte e documenti senza impegno iniziale.",
    href: "/consulenza",
  },
];
