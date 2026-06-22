export type ClientAreaKey =
  | "spedizioni"
  | "visure"
  | "caf-patronato"
  | "consulenza-utenze"
  | "web-agency"
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
    title: "Spedizioni senza passare in sede",
    subtitle: "Inserisci i dati, paga online e ti organizziamo il ritiro.",
    description:
      "Puoi preparare una spedizione nazionale o internazionale direttamente da qui. Metti i dati, scegli il servizio e noi facciamo il resto.",
    path: "/area-clienti/spedizioni",
    eyebrow: "Spedizioni",
    cta: "Apri area spedizioni",
    highlights: [
      "Ritiro a domicilio o consegna in sede",
      "Peso, misure e numero colli",
      "Tracking e assistenza se qualcosa non va",
    ],
    serviceOptions: [
      {
        value: "ritiro-nazionale",
        label: "Spedizione nazionale",
        description: "Ritiro in Italia. Ti seguiamo fino alla consegna.",
      },
      {
        value: "ritiro-internazionale",
        label: "Spedizione internazionale",
        description: "Estero, con documenti e tracking inclusi.",
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
    title: "Richiedi una visura online",
    subtitle: "Mandi i dati, apriamo la pratica e ti aggiorniamo sullo stato.",
    description:
      "Puoi richiedere visure camerali, catastali, PRA e altre direttamente da qui. Ci mandi i dati, noi apriamo la pratica e ti avvisiamo quando e pronta.",
    path: "/area-clienti/visure",
    eyebrow: "Visure",
    cta: "Apri area visure",
    highlights: [
      "Camerali e catastali",
      "PRA, CR e CRIF",
      "Stato pratica sempre aggiornato",
    ],
    serviceOptions: [
      {
        value: "visura-camerale",
        label: "Visura camerale",
        description: "Dati aziendali e documentazione dalla Camera di Commercio.",
      },
      {
        value: "visura-catastale",
        label: "Visura catastale",
        description: "Dati su immobili, terreni e riferimenti catastali.",
      },
      {
        value: "visura-pra",
        label: "Visura PRA",
        description: "Intestazione e dati del veicolo.",
      },
      {
        value: "visura-crif",
        label: "Visura CRIF",
        description: "Serve il consenso e una verifica dei documenti.",
      },
      {
        value: "visura-cr",
        label: "Visura CR",
        description: "Controlliamo i dati prima di procedere.",
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
    title: "Pratiche CAF e Patronato",
    subtitle: "Dicci cosa ti serve, ti diciamo quali documenti portare.",
    description:
      "Puoi avviare la pratica da qui: scegli il tipo di servizio e ti mandiamo la lista dei documenti necessari. Poi ci pensiamo noi.",
    path: "/area-clienti/caf-patronato",
    eyebrow: "CAF e Patronato",
    cta: "Apri area CAF e patronato",
    highlights: [
      "ISEE, 730 e dichiarazioni",
      "Pensione, invalidita e patronato",
      "Lista documenti e aggiornamenti sullo stato",
    ],
    serviceOptions: [
      {
        value: "isee",
        label: "ISEE",
        description: "Ti diciamo cosa portare e apriamo la pratica.",
      },
      {
        value: "730",
        label: "730 / dichiarazione",
        description: "Dichiarazione dei redditi con assistenza fiscale.",
      },
      {
        value: "invalidita-pensione",
        label: "Pensione / invalidita",
        description: "Pratiche previdenziali tramite patronato.",
      },
      {
        value: "bonus-agevolazioni",
        label: "Bonus e agevolazioni",
        description: "Vediamo a cosa hai diritto e raccogliamo i documenti.",
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
    title: "Fotocopie online, ritiro in agenzia",
    subtitle: "Carichi il PDF, paghi online e passi a ritirare.",
    description:
      "Solo per residenti a Castellammare di Stabia: carichi il PDF, il sistema conta le pagine e calcola il prezzo. Paghi online e ritiri in sede.",
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
    title: "Consulenza telefonia, luce e gas",
    subtitle: "Dicci quanto spendi e con chi stai, vediamo se si puo fare meglio.",
    description:
      "Compila il modulo con operatore e spesa attuale. Ti ricontattiamo per dirti se ci sono offerte migliori.",
    path: "/area-clienti/consulenza-utenze",
    eyebrow: "Consulenza Utenze",
    cta: "Apri area consulenza",
    highlights: [
      "Telefonia mobile e fissa",
      "Contratti luce e gas",
      "Ti ricontattiamo con la proposta",
    ],
    serviceOptions: [
      {
        value: "telefonia",
        label: "Consulenza telefonia",
        description: "Vediamo se c'e un'offerta migliore per come usi il telefono.",
      },
      {
        value: "luce",
        label: "Consulenza luce",
        description: "Confrontiamo i fornitori partendo dai tuoi consumi.",
      },
      {
        value: "gas",
        label: "Consulenza gas",
        description: "Vediamo se conviene cambiare fornitore.",
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
  {
    key: "web-agency",
    title: "Web Agency e progetti digitali",
    subtitle: "Raccontaci il progetto, ti mandiamo la proposta e segui lo stato da qui.",
    description:
      "Se ti serve un sito, un e-commerce, una landing page o un gestionale, parti da qui. Ci descrivi cosa vuoi, noi prepariamo la proposta.",
    path: "/area-clienti/web-agency",
    eyebrow: "Web Agency",
    cta: "Apri area web agency",
    highlights: [
      "Descrivi il progetto, ti guidiamo noi",
      "Ricevi la proposta commerciale",
      "Segui lo stato del progetto",
    ],
    serviceOptions: [
      {
        value: "sito-vetrina",
        label: "Sito vetrina",
        description: "Un sito per presentarti online e farti contattare.",
      },
      {
        value: "ecommerce",
        label: "E-commerce",
        description: "Vendi online con catalogo, carrello e pagamento.",
      },
      {
        value: "seo-local",
        label: "SEO e posizionamento locale",
        description: "Fatti trovare su Google da chi cerca i tuoi servizi in zona.",
      },
      {
        value: "gestionale",
        label: "Gestionale su misura",
        description: "Software fatto su come lavori tu, non su un modello generico.",
      },
      {
        value: "landing-page",
        label: "Landing page",
        description: "Una pagina sola, fatta per portarti contatti o vendite.",
      },
    ],
    fields: [
      {
        id: "project_goal",
        label: "Obiettivo principale",
        placeholder: "Es. più contatti, vendite online, prenotazioni, brand",
      },
      {
        id: "budget_range",
        label: "Budget indicativo",
        placeholder: "Es. 1500-3000 EUR",
      },
      {
        id: "timeline",
        label: "Tempistica desiderata",
        placeholder: "Es. entro 30 giorni",
      },
    ],
  },
];

export function getClientAreaConfig(key: string) {
  return clientAreas.find((area) => area.key === key) ?? null;
}
