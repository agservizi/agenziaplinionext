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
    shortDescription: "Ti facciamo il sito. Pensato per farti trovare dai clienti e farti contattare.",
    heroDescription:
      "Costruiamo siti web che funzionano: veloci, facili da trovare su Google e pensati per il tuo tipo di attivita. Ti diciamo i costi prima di iniziare.",
    customerBenefits: [
      "Il sito lo progettiamo partendo da cosa vuoi ottenere, non da un template.",
      "Lo facciamo veloce e visibile su Google.",
      "Dopo la pubblicazione ci siamo ancora, non spariscano.",
    ],
    requiredInfo: [
      "Raccontaci cosa fai e cosa vuoi ottenere col sito.",
      "Se hai logo, testi o foto, portali. Altrimenti ci arrangiamo.",
      "Dicci quali servizi o prodotti vuoi mettere in evidenza.",
    ],
    notes: [
      "I tempi dipendono dalla complessita e dai materiali che hai gia pronti.",
      "Un sito va aggiornato ogni tanto. Ti spieghiamo come o lo facciamo noi.",
    ],
  },
  {
    slug: "gestionali-su-misura",
    title: "Gestionali su misura",
    shortDescription: "Software costruito sul tuo modo di lavorare, non il contrario.",
    heroDescription:
      "Se usi ancora fogli Excel, post-it o metodi che non funzionano, costruiamo uno strumento fatto apposta per la tua attivita. Ti semplifica il lavoro di tutti i giorni.",
    customerBenefits: [
      "Funziona come lavori tu, non come dice il software.",
      "Fai meno cose a mano e perdi meno tempo.",
      "Si puo espandere nel tempo, un pezzo alla volta.",
    ],
    requiredInfo: [
      "Spiegaci come lavori adesso e cosa non funziona.",
      "Chi lo usera e con quale ruolo.",
      "Cosa vorresti che il gestionale facesse, anche a grandi linee.",
    ],
    notes: [
      "Serve una fase iniziale dove capiamo bene come lavori. Non si salta.",
      "Se in futuro servono funzioni nuove, le aggiungiamo senza rifare tutto.",
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
