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
    shortDescription: "Gestione spedizioni in Italia con supporto operativo e tracciamento.",
    heroDescription:
      "Ti assistiamo nella preparazione e nell'invio di spedizioni nazionali con controllo dati, etichette e supporto sul tracciamento.",
    customerBenefits: [
      "Assistenza in sede su compilazione spedizione e dati destinatario.",
      "Supporto su scelta servizio in base a urgenza e tipologia collo.",
      "Tracciamento disponibile con supporto locale in caso di anomalie.",
    ],
    requiredInfo: [
      "Dati completi mittente e destinatario.",
      "Peso e dimensioni indicative del collo.",
      "Contenuto dichiarato e recapito telefonico.",
    ],
    notes: [
      "Imballaggio corretto essenziale per evitare danni o ritardi.",
      "Tempi di consegna variabili in base a zona e periodo.",
    ],
  },
  {
    slug: "spedizioni-internazionali",
    title: "Spedizioni internazionali",
    shortDescription: "Spedizioni estere con supporto documentale e gestione passaggi principali.",
    heroDescription:
      "Seguiamo spedizioni internazionali con assistenza su dati, documentazione e requisiti operativi per ridurre errori e blocchi.",
    customerBenefits: [
      "Supporto pratico su compilazione dati per spedizioni extra-Italia.",
      "Assistenza su documentazione richiesta dal vettore.",
      "Monitoraggio e supporto in caso di stati tracking anomali.",
    ],
    requiredInfo: [
      "Dati completi destinatario estero (indirizzo, CAP, nazione).",
      "Contenuto spedizione e valore dichiarato quando richiesto.",
      "Peso e dimensioni del collo.",
    ],
    notes: [
      "Per alcune destinazioni possono essere richiesti documenti aggiuntivi.",
      "Tempi e costi possono variare in base a paese di destinazione e periodo.",
    ],
  },
];

export function getLogisticsServiceBySlug(slug: string) {
  return logisticsServiceDetails.find((item) => item.slug === slug) ?? null;
}

const logisticsSlugByCatalogTitle: Record<string, string> = {
  "Spedizioni nazionali": "spedizioni-nazionali",
  "Spedizioni internazionali": "spedizioni-internazionali",
};

export function getLogisticsServiceSlugByCatalogTitle(title: string) {
  return logisticsSlugByCatalogTitle[title] ?? "";
}
