export type EnergyServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
};

export const energyServiceDetails: EnergyServiceDetail[] = [
  {
    slug: "enel-energia",
    title: "Enel Energia",
    shortDescription: "Supporto locale su offerte luce e gas Enel Energia per casa e business.",
    heroDescription:
      "Ti assistiamo nella valutazione delle offerte Enel Energia, nella gestione della pratica e nei passaggi operativi di attivazione o cambio fornitore.",
    customerBenefits: [
      "Confronto guidato delle opzioni luce e gas in base ai consumi reali.",
      "Assistenza pratica su attivazione, subentro e voltura.",
      "Supporto locale sulla documentazione necessaria.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "Indirizzo completo di fornitura.",
      "POD/PDR e ultima bolletta, se disponibili.",
    ],
    notes: [
      "Le condizioni economiche dipendono dal profilo di consumo e dal periodo.",
      "Dati anagrafici e fornitura devono essere coerenti per evitare ritardi.",
    ],
  },
  {
    slug: "a2a-energia",
    title: "A2A Energia",
    shortDescription: "Assistenza su offerte A2A luce e gas con gestione pratica in sede.",
    heroDescription:
      "Con A2A Energia ti supportiamo dalla scelta del piano fino al completamento della pratica, con verifica guidata dei dati principali.",
    customerBenefits: [
      "Supporto su cambio fornitore con riduzione errori operativi.",
      "Analisi di base della bolletta attuale per orientare la scelta.",
      "Assistenza in sede su tempistiche e stato pratica.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "POD/PDR o bolletta attuale.",
      "Recapito email e telefono per comunicazioni pratica.",
    ],
    notes: [
      "Le attivazioni dipendono dalla corretta disponibilità dei dati contrattuali.",
      "In caso di cambio intestazione, possono servire documenti aggiuntivi.",
    ],
  },
  {
    slug: "windtre-luce-gas",
    title: "WindTre Luce e Gas",
    shortDescription: "Supporto su soluzioni energia WindTre con gestione integrata delle pratiche.",
    heroDescription:
      "Gestiamo pratiche WindTre Luce e Gas con assistenza operativa in sede per attivazioni, cambi fornitore e supporto documentale.",
    customerBenefits: [
      "Supporto su offerte integrate dove previste.",
      "Verifica guidata dei passaggi contrattuali principali.",
      "Assistenza locale durante tutto il flusso di attivazione.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "Indirizzo di fornitura e recapiti aggiornati.",
      "Bolletta precedente con dati POD/PDR.",
    ],
    notes: [
      "Promozioni e condizioni possono variare nel tempo.",
      "Verifica sempre eventuali servizi opzionali inclusi nell'offerta.",
    ],
  },
  {
    slug: "fastweb-energia",
    title: "Fastweb Energia",
    shortDescription: "Consulenza e attivazione Fastweb Energia con supporto pratico in sede.",
    heroDescription:
      "Ti seguiamo nella valutazione di Fastweb Energia e nella gestione dei dati necessari per avviare correttamente la pratica.",
    customerBenefits: [
      "Assistenza su configurazione pratica luce/gas in base ai bisogni reali.",
      "Supporto operativo su documenti e riferimenti fornitura.",
      "Interfaccia locale per chiarimenti e aggiornamenti pratica.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "POD/PDR e indirizzo utenza.",
      "Ultima bolletta utile per verifica dati.",
    ],
    notes: [
      "Tempi e condizioni dipendono dall'esito della procedura di switching.",
      "Controllare sempre la correttezza dei dati di contatto per notifiche.",
    ],
  },
];

export function getEnergyServiceBySlug(slug: string) {
  return energyServiceDetails.find((item) => item.slug === slug) ?? null;
}

const energySlugByCatalogTitle: Record<string, string> = {
  "Enel Energia": "enel-energia",
  "A2A Energia": "a2a-energia",
  "WindTre Luce e Gas": "windtre-luce-gas",
  "Fastweb Energia": "fastweb-energia",
};

export function getEnergyServiceSlugByCatalogTitle(title: string) {
  return energySlugByCatalogTitle[title] ?? "";
}
