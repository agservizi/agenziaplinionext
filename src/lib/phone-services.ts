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
    shortDescription: "Ti aiutiamo a scegliere tra le offerte iliad mobile e fibra, direttamente in sede.",
    heroDescription:
      "Vieni in agenzia e vediamo insieme quale offerta iliad fa al caso tuo. Controlliamo la copertura, ti spieghiamo le differenze tra i piani e gestiamo la pratica.",
    customerBenefits: [
      "Ti spieghiamo le offerte mobile iliad e quale conviene per come usi il telefono.",
      "Controlliamo se la fibra FTTH arriva al tuo indirizzo prima di procedere.",
      "Se hai gia il mobile iliad, vediamo se conviene aggiungere la fibra.",
      "Gestiamo la portabilita del numero e i documenti.",
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
      "Mobile, casa e fibra WindTre. Ti aiutiamo a scegliere e gestiamo tutto noi.",
    heroDescription:
      "Ci dici come usi il telefono e internet, noi ti facciamo vedere le offerte WindTre che hanno senso. Poi gestiamo portabilita, documenti e attivazione.",
    customerBenefits: [
      "Confrontiamo le offerte mobile in base a quanto navighi e chiami.",
      "Controlliamo la copertura fibra al tuo indirizzo prima di partire.",
      "Ci occupiamo noi della portabilita e della migrazione della linea fissa.",
      "Ti diciamo i tempi reali e seguiamo la pratica fino all'attivazione.",
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
      "Offerte Fastweb mobile e internet casa. Vediamo insieme cosa conviene.",
    heroDescription:
      "Portiamo avanti la pratica Fastweb per te: scelta piano, verifica copertura, portabilita e attivazione. Tu ci dici cosa ti serve, al resto pensiamo noi.",
    customerBenefits: [
      "Ti facciamo vedere le offerte mobile in base a quanti giga usi davvero.",
      "Controlliamo che tipo di fibra arriva a casa tua prima di procedere.",
      "Gestiamo portabilita del numero e migrazione da altro operatore.",
      "Ti aggiorniamo su tempi e stato della pratica fino all'attivazione.",
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
      "Attivazione SIM Very Mobile e portabilita del numero, con assistenza in sede.",
    heroDescription:
      "Vuoi passare a Very Mobile? Vieni in agenzia: ti aiutiamo a scegliere il piano giusto, controlliamo i dati e facciamo partire la pratica.",
    customerBenefits: [
      "Ti guidiamo nell'attivazione, sia per nuova SIM che per cambio operatore.",
      "Confrontiamo le offerte in base a come usi voce e dati.",
      "Controlliamo ICCID e documenti per evitare errori nella portabilita.",
      "Verifichiamo tutto insieme prima di confermare.",
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
      "Attivazione ho. Mobile e portabilita numero. Ci pensiamo noi in sede.",
    heroDescription:
      "Vuoi attivare ho. Mobile o portare il tuo numero? Vieni da noi, controlliamo i dati e avviamo la pratica. Ci metti pochi minuti.",
    customerBenefits: [
      "Nuova SIM o cambio operatore, lo facciamo direttamente in sede.",
      "Controlliamo documenti e dati prima di inviare la richiesta.",
      "Ti diciamo i tempi reali di attivazione e cosa fare dopo.",
      "Se hai dubbi sulle condizioni dell'offerta, te le spieghiamo.",
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
      "Attivazione DIGI Mobil e portabilita numero, con assistenza in agenzia.",
    heroDescription:
      "Ti aiutiamo ad attivare DIGI Mobil: scegliamo il piano giusto, controlliamo i documenti e seguiamo la pratica. Se qualcosa non va dopo, ci trovi sempre qui.",
    customerBenefits: [
      "Attivazione e configurazione della linea, fatta insieme in sede.",
      "Ti consigliamo il piano in base a come usi il telefono davvero.",
      "Controlliamo i dati per la portabilita prima di confermare.",
      "Se hai un problema dopo l'attivazione, ci trovi allo stesso numero.",
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
