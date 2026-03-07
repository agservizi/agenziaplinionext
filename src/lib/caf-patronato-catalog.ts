export type CafPatronatoScope = "caf" | "patronato";

export type CafPatronatoService = {
  value: string;
  label: string;
  description: string;
  priceEUR: number;
};

export type CafPatronatoCategory = {
  id: string;
  scope: CafPatronatoScope;
  title: string;
  icon: string;
  services: CafPatronatoService[];
};

export const CAF_PATRONATO_CATALOG: CafPatronatoCategory[] = [
  {
    id: "caf-fiscale",
    scope: "caf",
    title: "Fiscale e dichiarazioni",
    icon: "💰",
    services: [
      { value: "730", label: "730", description: "Assistenza completa per dichiarazione dei redditi.", priceEUR: 30 },
      { value: "730-congiunto", label: "730 Congiunto", description: "Gestione pratica congiunta e verifica completa dei documenti.", priceEUR: 60 },
      { value: "isee", label: "ISEE", description: "Indicatore economico con apertura pratica rapida.", priceEUR: 10 },
      { value: "modello-red", label: "Modello RED", description: "Dichiarazione reddituale per prestazioni collegate.", priceEUR: 6 },
      { value: "stampa-cu-inps", label: "Stampa CU INPS", description: "Recupero e stampa certificazione INPS.", priceEUR: 5 },
      { value: "stampa-obis-m", label: "Stampa Modello Obis-M INPS", description: "Recupero e stampa modello pensionistico.", priceEUR: 5 },
    ],
  },
  {
    id: "caf-casa-tributi",
    scope: "caf",
    title: "Casa e tributi",
    icon: "🏠",
    services: [
      { value: "imu", label: "IMU", description: "Calcolo e predisposizione adempimenti IMU.", priceEUR: 30 },
      { value: "tasi", label: "TASI", description: "Supporto quando il tributo è previsto.", priceEUR: 30 },
      { value: "controllo-imu", label: "Controllo IMU", description: "Controllo importi, scadenze e correzioni.", priceEUR: 10 },
      { value: "contratti-locazione", label: "Contratti di Locazione", description: "Impostazione e assistenza pratica contrattuale.", priceEUR: 75 },
      { value: "chiusura-contratto-locazione", label: "Chiusura Contratto Locazione", description: "Gestione chiusura e adempimenti finali.", priceEUR: 50 },
      { value: "rateizzo-ader", label: "Rateizzo Agenzia delle Entrate Riscossione", description: "Predisposizione pratica di rateizzazione.", priceEUR: 50 },
      { value: "rottamazione-cartelle", label: "Rottamazione Cartelle Agenzia delle Entrate Riscossione", description: "Supporto pratica di definizione agevolata.", priceEUR: 50 },
    ],
  },
  {
    id: "caf-documenti-dichiarazioni",
    scope: "caf",
    title: "Documenti e dichiarazioni",
    icon: "📄",
    services: [
      { value: "dichiarazione-detrazioni-lavoratori", label: "Dichiarazione Detrazioni Lavoratori Dipendenti", description: "Predisposizione e controllo della dichiarazione detrazioni.", priceEUR: 10 },
      { value: "dichiarazione-detrazioni-imposta", label: "Dichiarazione per il Diritto alle Detrazioni d’Imposta", description: "Supporto su reddito e carichi di famiglia.", priceEUR: 15 },
      { value: "dimissioni-volontarie", label: "Dimissioni Volontarie", description: "Invio telematico e verifica della procedura.", priceEUR: 15 },
    ],
  },
  {
    id: "patronato-famiglia-bonus",
    scope: "patronato",
    title: "Famiglia e sostegni",
    icon: "👨‍👩‍👧",
    services: [
      { value: "assegno-inclusione", label: "Assegno di Inclusione", description: "Apertura pratica e verifica requisiti.", priceEUR: 15 },
      { value: "assegno-vedovanza", label: "Assegno di Vedovanza", description: "Richiesta e controllo documentale.", priceEUR: 0 },
      { value: "assegno-unico", label: "Assegno Unico", description: "Richiesta e aggiornamento pratica.", priceEUR: 10 },
      { value: "bonus-mamme-2025", label: "Bonus Mamme 2025", description: "Presa in carico domanda e allegati.", priceEUR: 7 },
      { value: "bonus-nido", label: "Bonus Nido", description: "Gestione pratica e caricamento documenti richiesti.", priceEUR: 20 },
      { value: "congedo-parentale", label: "Congedo Parentale", description: "Predisposizione richiesta e supporto tempi.", priceEUR: 10 },
      { value: "maternita-obbligatoria", label: "Maternità Obbligatoria", description: "Assistenza su domanda e documentazione.", priceEUR: 20 },
      { value: "sfl", label: "SFL - Supporto Formazione e Lavoro", description: "Apertura pratica e verifica requisiti.", priceEUR: 15 },
    ],
  },
  {
    id: "patronato-pensioni",
    scope: "patronato",
    title: "Pensioni",
    icon: "👴",
    services: [
      { value: "assegno-ordinario-inabilita", label: "Assegno Ordinario / Pensione di Inabilità INPS", description: "Pratica previdenziale e verifica requisiti.", priceEUR: 25 },
      { value: "assegno-sociale", label: "Assegno Sociale", description: "Apertura e gestione pratica assistenziale.", priceEUR: 20 },
      { value: "pensione-anticipata", label: "Pensione Anticipata", description: "Assistenza su requisiti, decorrenza e pratica.", priceEUR: 20 },
      { value: "pensione-anzianita", label: "Pensione di Anzianità", description: "Verifica contributiva e avvio domanda.", priceEUR: 20 },
      { value: "pensione-reversibilita", label: "Pensione di Reversibilità", description: "Richiesta e gestione documenti collegati.", priceEUR: 20 },
      { value: "pensione-vecchiaia", label: "Pensione Vecchiaia", description: "Verifica requisiti e avvio domanda.", priceEUR: 20 },
      { value: "ricostituzione-pensione", label: "Ricostituzione Pensione", description: "Ricalcolo pensione e recupero variazioni.", priceEUR: 10 },
      { value: "simulazione-pensione", label: "Simulazione Pensione", description: "Valutazione economica e percorso pensionistico.", priceEUR: 50 },
      { value: "variazione-ufficio-pagatore", label: "Variazione Ufficio Pagatore", description: "Aggiornamento ente pagatore e posizione.", priceEUR: 7 },
    ],
  },
  {
    id: "patronato-contributi-lavoro",
    scope: "patronato",
    title: "Contributi e lavoro",
    icon: "👷",
    services: [
      { value: "collocamento-mirato-68-99", label: "Collocamento Mirato, Legge 68/99", description: "Presa in carico pratica e verifica requisiti.", priceEUR: 20 },
      { value: "conteggio-contributi", label: "Conteggio Contributi", description: "Analisi posizione contributiva e verifica requisiti.", priceEUR: 25 },
      { value: "estratto-conto-certificativo", label: "Estratto Conto Certificativo (Ecocert ed Ecomar)", description: "Recupero e controllo certificazione contributiva.", priceEUR: 5 },
      { value: "estratto-contributivo", label: "Estratto Contributivo", description: "Recupero e verifica posizione contributiva.", priceEUR: 5 },
      { value: "naspi", label: "NASpI", description: "Presa in carico completa della domanda di disoccupazione.", priceEUR: 10 },
    ],
  },
  {
    id: "patronato-invalidita-tutele",
    scope: "patronato",
    title: "Invalidità e tutele",
    icon: "🏥",
    services: [
      { value: "invalidita-civile-legge104-collocamento", label: "Invalidità Civile - Indennità di Accompagnamento - Legge 104/92 - Collocamento Mirato", description: "Presa in carico completa delle principali tutele assistenziali.", priceEUR: 25 },
      { value: "congedo-straordinario-104", label: "Congedo Straordinario L.104/92", description: "Gestione domanda e documenti richiesti.", priceEUR: 20 },
      { value: "permessi-104", label: "Permessi L.104/92", description: "Assistenza su richiesta e aggiornamenti posizione.", priceEUR: 20 },
    ],
  },
];

export const CAF_PATRONATO_SERVICES = CAF_PATRONATO_CATALOG.flatMap((category) =>
  category.services.map((service) => ({
    ...service,
    scope: category.scope,
    categoryId: category.id,
    categoryTitle: category.title,
    categoryIcon: category.icon,
  })),
);

export function getCafPatronatoService(serviceType: string) {
  return CAF_PATRONATO_SERVICES.find((service) => service.value === serviceType) ?? null;
}

export function getCafPatronatoScopeLabel(scope: CafPatronatoScope) {
  return scope === "caf" ? "Servizi CAF" : "Servizi Patronato";
}

export function getCafPatronatoServicePrice(serviceType: string) {
  const service = getCafPatronatoService(serviceType);
  if (!service) {
    return null;
  }

  return {
    amountCents: Math.round(service.priceEUR * 100),
    label: `${service.label} CAF/Patronato`,
    service,
  };
}
