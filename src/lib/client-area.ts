export type ClientAreaKey =
  | "spedizioni"
  | "visure"
  | "caf-patronato"
  | "consulenza-utenze"
  | "fotocopie-online";

export type ClientAreaServiceOption = {
  value: string;
  label: string;
  description: string;
};

export type ClientAreaField = {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "date";
  required?: boolean;
};

export type ClientAreaConfig = {
  key: ClientAreaKey;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  eyebrow: string;
  cta: string;
  highlights: string[];
  serviceOptions: ClientAreaServiceOption[];
  fields: ClientAreaField[];
};

export const clientAreas: ClientAreaConfig[] = [
  {
    key: "spedizioni",
    title: "Spedizioni da casa in area dedicata",
    subtitle: "Richiedi ritiro, acquista la spedizione e ricevi assistenza operativa.",
    description:
      "Un flusso unico per preparare spedizioni nazionali e internazionali senza passare in sede. Inserisci i dati, invia la richiesta e ricevi il riepilogo operativo.",
    path: "/area-clienti/spedizioni",
    eyebrow: "Spedizioni",
    cta: "Apri area spedizioni",
    highlights: [
      "Richiesta ritiro a domicilio",
      "Gestione colli e misure",
      "Supporto su tracking e documentazione",
    ],
    serviceOptions: [
      {
        value: "ritiro-nazionale",
        label: "Spedizione nazionale",
        description: "Ritiro in Italia con assistenza operativa e aggiornamento pratica.",
      },
      {
        value: "ritiro-internazionale",
        label: "Spedizione internazionale",
        description: "Gestione richieste con dati doganali e supporto documentale.",
      },
    ],
    fields: [
      { id: "pickup_address", label: "Indirizzo ritiro", placeholder: "Via, civico, CAP, citta", required: true },
      { id: "destination_city", label: "Citta destinazione", placeholder: "Dove deve arrivare il pacco", required: true },
      { id: "package_count", label: "Numero colli", placeholder: "Es. 2", type: "number", required: true },
      { id: "package_weight", label: "Peso totale stimato (kg)", placeholder: "Es. 8", type: "number", required: true },
    ],
  },
  {
    key: "visure",
    title: "Richiesta visure in area dedicata",
    subtitle: "Apertura pratica, documenti richiesti e consegna in un unico spazio.",
    description:
      "Gestiamo richieste di visure con presa in carico dedicata. Il cliente invia i dati, allega eventuali documenti e riceve aggiornamenti sullo stato pratica.",
    path: "/area-clienti/visure",
    eyebrow: "Visure",
    cta: "Apri area visure",
    highlights: [
      "Visure camerali e catastali",
      "Visure PRA, CR e CRIF",
      "Gestione documenti e stato richiesta",
    ],
    serviceOptions: [
      {
        value: "visura-camerale",
        label: "Visura camerale",
        description: "Richiesta dati aziendali e documentazione camerale.",
      },
      {
        value: "visura-catastale",
        label: "Visura catastale",
        description: "Richiesta immobili, terreni e riferimenti catastali.",
      },
      {
        value: "visura-pra",
        label: "Visura PRA",
        description: "Verifica intestazione e dati del veicolo.",
      },
      {
        value: "visura-crif",
        label: "Visura CRIF",
        description: "Richiesta soggetta a verifica documentale e consenso.",
      },
      {
        value: "visura-cr",
        label: "Visura CR",
        description: "Presa in carico con controllo preliminare dei dati.",
      },
    ],
    fields: [
      { id: "subject_name", label: "Intestatario / Ragione sociale", placeholder: "Nome o ragione sociale", required: true },
      { id: "tax_code", label: "Codice fiscale / P. IVA", placeholder: "Inserisci il riferimento fiscale", required: true },
      { id: "reference_note", label: "Riferimento pratica", placeholder: "Targa, immobile, azienda o altro" },
    ],
  },
  {
    key: "caf-patronato",
    title: "Pratiche CAF e patronato in area dedicata",
    subtitle: "Apri la richiesta, indica il servizio e ricevi checklist e assistenza.",
    description:
      "Il cliente può avviare la pratica online, indicare la tipologia di servizio e ricevere supporto su documenti, integrazioni e appuntamenti.",
    path: "/area-clienti/caf-patronato",
    eyebrow: "CAF e Patronato",
    cta: "Apri area CAF e patronato",
    highlights: [
      "ISEE, 730 e pratiche fiscali",
      "Patronato e pratiche previdenziali",
      "Checklist documenti e supporto dedicato",
    ],
    serviceOptions: [
      {
        value: "isee",
        label: "ISEE",
        description: "Apertura pratica con raccolta dati e documenti richiesti.",
      },
      {
        value: "730",
        label: "730 / dichiarazione",
        description: "Richiesta assistenza fiscale con presa in carico operativa.",
      },
      {
        value: "invalidita-pensione",
        label: "Pensione / invalidita",
        description: "Pratiche previdenziali e supporto patronato.",
      },
      {
        value: "bonus-agevolazioni",
        label: "Bonus e agevolazioni",
        description: "Verifica preliminare e raccolta documentazione.",
      },
    ],
    fields: [
      { id: "practice_priority", label: "Urgenza pratica", placeholder: "Es. entro 7 giorni" },
      { id: "documents_ready", label: "Documenti gia disponibili", placeholder: "Es. CUD, DSU, carta identita" },
      { id: "preferred_date", label: "Data preferita per contatto", placeholder: "Scegli una data", type: "date" },
    ],
  },
  {
    key: "fotocopie-online",
    title: "Fotocopie online con ritiro in agenzia",
    subtitle: "Carichi il PDF, paghi in base alle pagine e ritiri in sede.",
    description:
      "Servizio riservato ai residenti di Castellammare di Stabia: carichi il file PDF da stampare, il sistema calcola automaticamente le pagine e paghi online con Stripe.",
    path: "/area-clienti/fotocopie",
    eyebrow: "Fotocopie Online",
    cta: "Apri modulo fotocopie",
    highlights: [
      "Upload PDF e conteggio pagine automatico",
      "Prezzo calcolato per fascia pagine",
      "Ritiro solo in agenzia AG SERVIZI",
    ],
    serviceOptions: [
      {
        value: "fotocopie-online",
        label: "Fotocopie online",
        description: "Stampa PDF con ritiro in sede a Castellammare di Stabia.",
      },
    ],
    fields: [
      {
        id: "city",
        label: "Città di residenza",
        placeholder: "Castellammare di Stabia",
        required: true,
      },
      {
        id: "pickup_mode",
        label: "Modalità consegna",
        placeholder: "Ritiro in agenzia",
        required: true,
      },
      {
        id: "pdf_pages",
        label: "Numero pagine PDF",
        placeholder: "Conteggio automatico",
        required: true,
      },
    ],
  },
  {
    key: "consulenza-utenze",
    title: "Consulenza telefonia, luce e gas in area dedicata",
    subtitle: "Richiedi analisi personalizzata e trasforma la richiesta in lead tracciata.",
    description:
      "Compili un modulo unico, indichi operatore e spesa attuale e il team commerciale prende in carico la lead con priorità e stato aggiornato.",
    path: "/area-clienti/consulenza-utenze",
    eyebrow: "Consulenza Utenze",
    cta: "Apri area consulenza",
    highlights: [
      "Telefonia mobile e fissa",
      "Contratti luce e gas",
      "Lead qualificate con storico dedicato",
    ],
    serviceOptions: [
      {
        value: "telefonia",
        label: "Consulenza telefonia",
        description: "Analisi offerte mobile/fibra e ottimizzazione costi attuali.",
      },
      {
        value: "luce",
        label: "Consulenza luce",
        description: "Confronto fornitori e condizioni in base ai consumi reali.",
      },
      {
        value: "gas",
        label: "Consulenza gas",
        description: "Supporto cambio fornitore e verifica costi di fornitura.",
      },
    ],
    fields: [
      {
        id: "current_provider",
        label: "Operatore/Fornitore attuale",
        placeholder: "Es. Fastweb, Enel Energia, A2A",
      },
      {
        id: "monthly_spend",
        label: "Spesa media mensile (€)",
        placeholder: "Es. 85",
        type: "number",
      },
      {
        id: "city",
        label: "Città di fornitura",
        placeholder: "Inserisci la città",
      },
    ],
  },
];

export function getClientAreaConfig(key: string) {
  return clientAreas.find((area) => area.key === key) ?? null;
}
