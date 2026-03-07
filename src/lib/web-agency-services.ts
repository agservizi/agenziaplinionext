export type WebAgencyServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
};

export const webAgencyServiceDetails: WebAgencyServiceDetail[] = [
  {
    slug: "realizzazione-siti-web",
    title: "Realizzazione siti web",
    shortDescription: "Siti web su misura orientati a performance, conversione e posizionamento locale.",
    heroDescription:
      "Progettiamo e sviluppiamo siti web moderni, veloci e orientati ai risultati, con supporto strategico e operativo continuativo.",
    customerBenefits: [
      "Sito progettato su obiettivi reali di business.",
      "Struttura SEO base e performance ottimizzate.",
      "Supporto locale post-pubblicazione.",
    ],
    requiredInfo: [
      "Descrizione attività e obiettivi del sito.",
      "Materiali disponibili (logo, testi, foto).",
      "Riferimenti servizi/prodotti da valorizzare.",
    ],
    notes: [
      "Tempistiche variabili in base a complessità e materiali forniti.",
      "È consigliato prevedere aggiornamenti periodici contenuti e pagine.",
    ],
  },
  {
    slug: "gestionali-su-misura",
    title: "Gestionali su misura",
    shortDescription: "Sviluppo strumenti gestionali personalizzati per flussi interni e operatività.",
    heroDescription:
      "Realizziamo soluzioni gestionali su misura per semplificare processi, centralizzare dati e migliorare l'efficienza operativa.",
    customerBenefits: [
      "Processi adattati al tuo modo reale di lavorare.",
      "Riduzione attività manuali ripetitive.",
      "Scalabilità progressiva del progetto.",
    ],
    requiredInfo: [
      "Mappa dei processi attuali da ottimizzare.",
      "Utenti coinvolti e ruoli operativi.",
      "Obiettivi principali del gestionale.",
    ],
    notes: [
      "I progetti gestionali richiedono una fase iniziale di analisi dettagliata.",
      "Evoluzioni e moduli aggiuntivi possono essere pianificati in step successivi.",
    ],
  },
];

export function getWebAgencyServiceBySlug(slug: string) {
  return webAgencyServiceDetails.find((item) => item.slug === slug) ?? null;
}

const webAgencySlugByCatalogTitle: Record<string, string> = {
  "Realizzazione siti web": "realizzazione-siti-web",
  "Gestionali su misura": "gestionali-su-misura",
};

export function getWebAgencyServiceSlugByCatalogTitle(title: string) {
  return webAgencySlugByCatalogTitle[title] ?? "";
}
