export type PhoneServiceDetail = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
  officialSources?: Array<{
    label: string;
    url: string;
  }>;
};

export const phoneServiceDetails: PhoneServiceDetail[] = [
  {
    slug: "iliad-space",
    title: "Iliad Space",
    shortDescription: "Supporto su offerte iliad mobile e iliad fibra con assistenza in sede.",
    heroDescription:
      "In sede ti supportiamo sia sulle offerte iliad per la telefonia mobile sia sull'attivazione iliad fibra, con verifica pratica dei requisiti e dei passaggi operativi.",
    customerBenefits: [
      "Analisi guidata delle offerte mobile iliad (bundle voce/SMS/dati e opzioni disponibili).",
      "Verifica copertura e fattibilità per iliad fibra FTTH prima dell'attivazione.",
      "Supporto pratico sul vantaggio Fibra + Mobile quando applicabile.",
      "Assistenza locale su portabilità numero e passaggi amministrativi iniziali.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero da portare (se richiesta portabilità).",
      "Per fibra: indirizzo completo e contatto per eventuale intervento tecnico.",
    ],
    notes: [
      "Per il mobile, disponibilità 5G legata a copertura area e dispositivo compatibile.",
      "Per la fibra, disponibilità legata a copertura FTTH (EPON/GPON) nella tua zona.",
      "Le condizioni economiche possono variare nel tempo in base alle offerte ufficiali iliad.it.",
      "Per portabilità, verifica che il numero sia intestato correttamente e che i dati siano allineati.",
    ],
    officialSources: [
      {
        label: "Offerte mobile iliad (es. TOP 250 PLUS)",
        url: "https://www.iliad.it/offerta-iliad-top250plus-999.html",
      },
      {
        label: "Offerta fibra iliad (iliadbox Wi-Fi 7 e condizioni)",
        url: "https://www.iliad.it/offerte-iliad-fibra.html",
      },
      {
        label: "Verifica copertura fibra",
        url: "https://fibra.iliad.it/",
      },
      {
        label: "Informazioni copertura 5G iliad",
        url: "https://5g.iliad.it/",
      },
    ],
  },
  {
    slug: "windtre",
    title: "WindTre",
    shortDescription:
      "Supporto completo su offerte WindTre mobile e rete fissa/fibra con assistenza in sede.",
    heroDescription:
      "Ti assistiamo nella scelta e attivazione delle offerte WindTre per telefonia mobile e connessione casa, con verifica pratica di copertura, portabilità e documentazione.",
    customerBenefits: [
      "Confronto guidato tra offerte mobile WindTre in base a minuti, GB e priorità d'uso.",
      "Verifica preliminare copertura per linea fissa/fibra prima di avviare la pratica.",
      "Assistenza su portabilità numero mobile e migrazione linea fissa.",
      "Supporto locale su passaggi operativi, tempistiche e attivazione servizi inclusi.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero da portare e dati intestatario in caso di portabilità mobile.",
      "Per linea casa: indirizzo completo e, se disponibile, codice migrazione operatore attuale.",
    ],
    notes: [
      "Per le offerte mobili, copertura 5G soggetta a disponibilità area e dispositivo compatibile.",
      "Per il fisso, l'attivazione dipende dalla tecnologia disponibile all'indirizzo (FTTH/FTTC/FWA).",
      "Le condizioni economiche possono variare in base al periodo e alle campagne commerciali attive.",
      "In caso di migrazione, dati anagrafici e linea devono risultare coerenti per evitare ritardi.",
    ],
    officialSources: [
      {
        label: "Offerte mobile WindTre",
        url: "https://www.windtre.it/offerte-mobile/",
      },
      {
        label: "Offerte internet casa WindTre",
        url: "https://www.windtre.it/offerte-internet-casa/",
      },
      {
        label: "Verifica copertura rete fissa",
        url: "https://www.windtre.it/verifica-copertura/",
      },
      {
        label: "Copertura rete mobile",
        url: "https://www.windtre.it/copertura/",
      },
    ],
  },
  {
    slug: "fastweb",
    title: "Fastweb",
    shortDescription:
      "Supporto completo su offerte Fastweb mobile e internet casa con assistenza in sede.",
    heroDescription:
      "Ti accompagniamo nella scelta delle offerte Fastweb per linea mobile e connettività casa/ufficio, con supporto pratico su copertura, migrazione e attivazione.",
    customerBenefits: [
      "Analisi guidata delle opzioni Fastweb mobile in base a consumo dati e uso quotidiano.",
      "Valutazione delle offerte internet casa con verifica preliminare della copertura disponibile.",
      "Assistenza su portabilità numero e migrazione linea fissa da altro operatore.",
      "Supporto locale su documentazione, passaggi tecnici e tempi stimati di attivazione.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero di telefono attuale per portabilità mobile.",
      "Per linea casa: indirizzo completo e codice migrazione, se disponibile.",
    ],
    notes: [
      "Copertura mobile e qualità servizio possono variare in base alla zona e al terminale.",
      "Per il fisso, la tecnologia attivabile dipende dalla copertura disponibile all'indirizzo.",
      "Condizioni economiche e promozioni possono cambiare nel tempo.",
      "Per migrazione/portabilità è importante che intestazione e dati anagrafici coincidano.",
    ],
    officialSources: [
      {
        label: "Offerte Fastweb mobile",
        url: "https://www.fastweb.it/mobile/",
      },
      {
        label: "Offerte Fastweb internet casa",
        url: "https://www.fastweb.it/internet-casa/",
      },
      {
        label: "Sito ufficiale Fastweb",
        url: "https://www.fastweb.it/",
      },
    ],
  },
  {
    slug: "very-mobile",
    title: "Very Mobile",
    shortDescription:
      "Supporto Very Mobile per attivazioni SIM, offerte dati e portabilità numero.",
    heroDescription:
      "Gestiamo attivazioni Very Mobile con assistenza su scelta tariffa, passaggi operativi e portabilità del numero.",
    customerBenefits: [
      "Procedura guidata per attivazione nuova SIM o cambio operatore verso Very.",
      "Supporto nel confronto tra offerte in base al profilo di utilizzo dati/voce.",
      "Assistenza locale per ridurre errori su ICCID e dati anagrafici.",
      "Verifica pratica dei passaggi chiave prima di confermare la richiesta.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero da trasferire e ICCID della SIM attuale (se richiesta portabilità).",
    ],
    notes: [
      "L'ICCID va controllato con attenzione per evitare scarti in portabilità.",
      "Copertura e prestazioni dipendono dall'area e dal dispositivo utilizzato.",
      "Le offerte possono variare in base al profilo cliente e alle campagne attive.",
      "Alcune promozioni richiedono specifici requisiti di provenienza.",
    ],
    officialSources: [
      {
        label: "Offerte Very Mobile",
        url: "https://www.verymobile.it/offerte/",
      },
      {
        label: "Sito ufficiale Very Mobile",
        url: "https://www.verymobile.it/",
      },
    ],
  },
  {
    slug: "ho-mobile",
    title: "Ho. Mobile",
    shortDescription:
      "Assistenza su offerte ho. Mobile, attivazione SIM e passaggio operatore.",
    heroDescription:
      "Ti supportiamo nelle pratiche ho. Mobile: dalla scelta dell'offerta all'attivazione e alla portabilità del numero.",
    customerBenefits: [
      "Supporto operativo rapido per nuova SIM o passaggio da altro operatore.",
      "Verifica guidata dei dati richiesti prima dell'invio pratica.",
      "Assistenza locale su attivazione, tempistiche e primi step post-attivazione.",
      "Aiuto nella lettura delle condizioni principali dell'offerta scelta.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero da trasferire e dati linea attuale in caso di portabilità.",
    ],
    notes: [
      "I tempi di portabilità dipendono dall'operatore di provenienza e dalla correttezza dati.",
      "Copertura e qualità di rete variano in base all'area geografica.",
      "Le promozioni possono essere soggette a condizioni specifiche di attivazione.",
      "Verifica eventuali vincoli o costi di uscita del vecchio contratto.",
    ],
    officialSources: [
      {
        label: "Offerte ho. Mobile",
        url: "https://www.ho-mobile.it/offerte.html",
      },
      {
        label: "Copertura ho. Mobile",
        url: "https://www.ho-mobile.it/copertura.html",
      },
      {
        label: "Sito ufficiale ho. Mobile",
        url: "https://www.ho-mobile.it/",
      },
    ],
  },
  {
    slug: "digi-mobile",
    title: "Digi Mobile",
    shortDescription:
      "Supporto su offerte DIGI Mobil, attivazione SIM e portabilità numero.",
    heroDescription:
      "Ti seguiamo nelle pratiche DIGI Mobil con assistenza locale su attivazione, scelta piano e trasferimento numero.",
    customerBenefits: [
      "Assistenza in sede su attivazione e configurazione iniziale della linea.",
      "Supporto nella scelta del piano in base alle esigenze reali di utilizzo.",
      "Aiuto operativo su portabilità numero e controllo dati richiesti.",
      "Punto di riferimento locale per chiarimenti e supporto post-attivazione.",
    ],
    requiredInfo: [
      "Documento di identità valido.",
      "Codice fiscale.",
      "Numero attuale e dati linea in caso di passaggio operatore.",
    ],
    notes: [
      "La disponibilità del servizio dipende dalla copertura nella tua area.",
      "Per portabilità è necessario inserire correttamente i dati della linea corrente.",
      "Le condizioni commerciali possono cambiare in base al periodo promozionale.",
      "Prima della conferma finale è utile verificare eventuali limiti o vincoli dell'offerta.",
    ],
    officialSources: [
      {
        label: "Sito ufficiale DIGI Mobil",
        url: "https://www.digimobil.it/",
      },
      {
        label: "Offerte DIGI Mobil",
        url: "https://www.digimobil.it/offerte/",
      },
    ],
  },
];

export function getPhoneServiceBySlug(slug: string) {
  return phoneServiceDetails.find((item) => item.slug === slug) ?? null;
}

const phoneSlugByCatalogTitle: Record<string, string> = {
  "Iliad Space": "iliad-space",
  WindTre: "windtre",
  Fastweb: "fastweb",
  "Very Mobile": "very-mobile",
  "Ho. Mobile": "ho-mobile",
  "Digi Mobile": "digi-mobile",
};

export function getPhoneServiceSlugByCatalogTitle(title: string) {
  return phoneSlugByCatalogTitle[title] ?? "";
}
