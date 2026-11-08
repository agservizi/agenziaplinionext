/**
 * Callers: GestiioPracticeWorkspace, area-clienti pages (contratti-energia|telefonia).
 * API: form fields → POST /api/client-area/gestiio/practices → GestiiO segnalazione AG00062.
 * Schema: ClientAreaField ids map to Contratto* payload (gestore_id, tipo_contratto_id, CF…).
 * User: "contratti telefonia e luce e gas(energia) in area clienti dovrebbero seguire il workflow per le segnalazioni presente in gestiio su operatore AG00062"
 */
export type ClientAreaKey =
  | "contratti-telefonia"
  | "contratti-energia"
  | "simula-bolletta"
  | "caf-patronato"
  | "send"
  | "visure"
  | "deposito-bagagli"
  | "locker-point";

export type ClientAreaServiceOption = {
  value: string;
  label: string;
  description: string;
};

/** Used by GestiioPracticeWorkspace forms. User plan: select luce/gas/dual. */
export type ClientAreaField = {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
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
  /** Solo tracking / consultazione, senza nuova pratica self-service. */
  readOnly?: boolean;
};

export const clientAreas: ClientAreaConfig[] = [
  {
    key: "contratti-telefonia",
    title: "Contratti telefonia",
    subtitle: "Carichi i dati, firmi dove serve e segui la pratica fino all’attivazione.",
    description:
      "Vuoi un nuovo contratto o un passaggio operatore? Compili il modulo, carichi i documenti e tieni tutto sotto controllo dall’area clienti.",
    path: "/area-clienti/contratti-telefonia",
    eyebrow: "Telefonia",
    cta: "Avvia contratto telefonia",
    highlights: ["Mobile e fissa", "Upload documenti", "Stato pratica in tempo reale"],
    serviceOptions: [
      {
        value: "nuova-attivazione",
        label: "Nuova attivazione",
        description: "Linea nuova con documenti e recapito in sede se serve.",
      },
      {
        value: "cambio-operatore",
        label: "Cambio operatore",
        description: "Portabilità o passaggio: ti diciamo cosa serve.",
      },
    ],
    fields: [
      {
        id: "service_type",
        label: "Tipo richiesta",
        placeholder: "Scegli",
        type: "select",
        required: true,
        options: [
          { value: "nuova-attivazione", label: "Nuova attivazione" },
          { value: "cambio-operatore", label: "Cambio operatore / portabilità" },
        ],
      },
      {
        id: "tipo_contratto_id",
        label: "Prodotto / offerta",
        placeholder: "Scegli il prodotto (se disponibile)",
        type: "select",
        required: false,
        options: [],
      },
      { id: "nome", label: "Nome", placeholder: "Nome", required: true },
      { id: "cognome", label: "Cognome", placeholder: "Cognome", required: true },
      { id: "tax_code", label: "Codice fiscale", placeholder: "Codice fiscale", required: true },
      { id: "phone", label: "Cellulare", placeholder: "333…", required: true },
      { id: "email", label: "Email", placeholder: "tua@email.it", required: true },
      { id: "current_operator", label: "Operatore attuale", placeholder: "Es. TIM, Vodafone (se cambio)" },
      { id: "notes", label: "Note / offerta desiderata", placeholder: "Mobile, fissa, bundle…" },
    ],
  },
  {
    key: "contratti-energia",
    title: "Contratti luce e gas",
    subtitle: "Attivazioni e voltura: una pratica, un punto dove vedere come va.",
    description:
      "Luce, gas o entrambi: inserisci POD/PDR e i dati del punto fornitura. Ti ricontattiamo se manca qualcosa e vedi gli aggiornamenti online.",
    path: "/area-clienti/contratti-energia",
    eyebrow: "Energia",
    cta: "Apri contratti energia",
    highlights: ["Luce, gas o dual", "Voltura e subentro", "Documenti e stato pratica"],
    serviceOptions: [
      { value: "luce", label: "Solo luce", description: "Attivazione o cambio fornitore luce." },
      { value: "gas", label: "Solo gas", description: "Attivazione o cambio fornitore gas." },
      { value: "dual", label: "Luce e gas", description: "Un’unica pratica per entrambe le utenze." },
    ],
    fields: [
      {
        id: "service_type",
        label: "Tipo utenza",
        placeholder: "Scegli",
        type: "select",
        required: true,
        options: [
          { value: "luce", label: "Solo luce" },
          { value: "gas", label: "Solo gas" },
          { value: "dual", label: "Luce e gas" },
        ],
      },
      {
        id: "gestore_id",
        label: "Gestore",
        placeholder: "Scegli il gestore (se disponibile)",
        type: "select",
        required: false,
        options: [],
      },
      { id: "nome", label: "Nome", placeholder: "Nome", required: true },
      { id: "cognome", label: "Cognome", placeholder: "Cognome", required: true },
      { id: "tax_code", label: "Codice fiscale", placeholder: "CF intestatario", required: true },
      { id: "supply_address", label: "Indirizzo fornitura", placeholder: "Via, CAP, città", required: true },
      { id: "pod_pdr", label: "POD o PDR", placeholder: "Se lo hai già a mano" },
      { id: "phone", label: "Cellulare", placeholder: "333…", required: true },
      { id: "email", label: "Email", placeholder: "tua@email.it", required: true },
      { id: "notes", label: "Note", placeholder: "Voltura, subentro, offerta vista in simulazione…" },
    ],
  },
  {
    key: "simula-bolletta",
    title: "Simula la bolletta",
    subtitle: "Inserisci i consumi a mano: vedi subito un confronto chiaro.",
    description:
      "Prima di cambiare fornitore vuoi capire quanto spenderesti? Metti i kWh o i Smc e ottieni un ranking leggibile, senza impegno.",
    path: "/area-clienti/simula-bolletta",
    eyebrow: "Simulazione",
    cta: "Simula ora",
    highlights: ["Luce e gas", "Consumi a mano", "Nessun impegno"],
    serviceOptions: [
      { value: "simula-luce", label: "Simula luce", description: "Stima in base ai consumi annui." },
      { value: "simula-gas", label: "Simula gas", description: "Stima gas con i tuoi Smc." },
    ],
    fields: [
      { id: "utility_type", label: "Utenza", placeholder: "Luce, gas o entrambe", required: true },
      { id: "annual_consumption", label: "Consumo annuo", placeholder: "kWh o Smc", type: "number" },
      { id: "email", label: "Email per invio esito", placeholder: "tua@email.it", required: true },
    ],
  },
  {
    key: "caf-patronato",
    title: "CAF e patronato",
    subtitle: "Apri la pratica da casa: ti mandiamo la lista documenti e gli aggiornamenti.",
    description:
      "ISEE, 730, pensione o patronato: scegli il servizio, carichi quello che hai e noi ti diciamo cosa manca prima del passaggio in sede.",
    path: "/area-clienti/caf-patronato",
    eyebrow: "CAF e Patronato",
    cta: "Apri area CAF",
    highlights: ["ISEE e dichiarazioni", "Patronato INPS", "Checklist documenti"],
    serviceOptions: [
      { value: "isee", label: "ISEE", description: "DSU e attestazione con assistenza." },
      { value: "730", label: "730 / dichiarazione", description: "Modello redditi con revisione." },
      { value: "patronato", label: "Pratica patronato", description: "Pensione, invalidità, ricorsi." },
    ],
    fields: [
      { id: "practice_type", label: "Tipo pratica", placeholder: "Es. ISEE 2025", required: true },
      { id: "preferred_contact", label: "Come ricontattarti", placeholder: "Telefono o email", required: true },
      { id: "documents_ready", label: "Documenti già pronti", placeholder: "Elenco rapido" },
    ],
  },
  {
    key: "send",
    title: "Notifiche SEND",
    subtitle: "Carichi l’avviso, paghi online e seguiamo la pratica fino all’esito.",
    description:
      "Per le comunicazioni digitali via SEND: allega avviso e documenti, paga se previsto e controlla ogni step senza dover ripassare in agenzia ogni volta.",
    path: "/area-clienti/send",
    eyebrow: "SEND",
    cta: "Apri pratica SEND",
    highlights: ["Upload avvisi e allegati", "Pagamento online", "Timeline pratica"],
    serviceOptions: [
      { value: "notifica-send", label: "Invio notifica", description: "Pratica SEND con documenti e recapito." },
    ],
    fields: [
      { id: "recipient", label: "Destinatario notifica", placeholder: "Nome o ragione sociale", required: true },
      { id: "fiscal_code", label: "Codice fiscale destinatario", placeholder: "CF o P. IVA", required: true },
      { id: "notes", label: "Note per l’operatore", placeholder: "Urgenze o riferimenti" },
    ],
  },
  {
    key: "visure",
    title: "Visure e estratti",
    subtitle: "Chiedi la visura, paghi online e scarichi il documento quando è pronto.",
    description:
      "Camerali, catastali, PRA, CRIF: selezioni il tipo, inserisci i dati del soggetto e segui lo stato. Ti avvisiamo appena il file è disponibile.",
    path: "/area-clienti/visure",
    eyebrow: "Visure",
    cta: "Richiedi visura",
    highlights: ["Camerali e catastali", "PRA e CRIF", "Download sicuro"],
    serviceOptions: [
      { value: "visura-camerale", label: "Visura camerale", description: "Dati azienda da Camera di Commercio." },
      { value: "visura-catastale", label: "Visura catastale", description: "Immobili e terreni." },
      { value: "visura-pra", label: "Visura PRA", description: "Dati veicolo e intestazione." },
    ],
    fields: [
      { id: "subject_name", label: "Soggetto", placeholder: "Nome o ragione sociale", required: true },
      { id: "tax_code", label: "Codice fiscale / P. IVA", placeholder: "Riferimento fiscale", required: true },
      { id: "reference_note", label: "Riferimento", placeholder: "Targa, immobile, sede" },
    ],
  },
  {
    key: "deposito-bagagli",
    title: "Deposito bagagli",
    subtitle: "Prenoti online, depositi in agenzia e paghi a giornata.",
    description:
      "Hai valigie o borse da lasciare qualche ora? Scegli data e fascia oraria, ricevi il codice prenotazione e passi in sede senza sorprese sul prezzo.",
    path: "/area-clienti/deposito-bagagli",
    eyebrow: "Deposito",
    cta: "Prenota deposito",
    highlights: ["Prenotazione con orario", "Tariffa a giornata", "Ritiro con codice"],
    serviceOptions: [
      { value: "deposito-giornaliero", label: "Deposito giornaliero", description: "Uno o più bagagli per la giornata." },
    ],
    fields: [
      { id: "checkin_date", label: "Data deposito", placeholder: "GG/MM/AAAA", type: "date", required: true },
      { id: "pieces", label: "Numero bagagli", placeholder: "Es. 2", type: "number", required: true },
      { id: "contact_phone", label: "Telefono", placeholder: "Per conferma", required: true },
    ],
  },
  {
    key: "locker-point",
    title: "Fermo deposito / Locker Point",
    subtitle: "Custodia pacchi con codice LP: attivi online e ritiri quando vuoi.",
    description:
      "Aspetti un corriere o non puoi stare a casa? Attivi il fermo deposito, ricevi il codice locker e gestisci ritiro o proroga dall’area clienti.",
    path: "/area-clienti/locker-point",
    eyebrow: "Locker Point",
    cta: "Attiva fermo deposito",
    highlights: ["Codice LP dedicato", "Tariffa giornaliera", "Proroga online"],
    serviceOptions: [
      { value: "fermo-deposito", label: "Fermo deposito", description: "Custodia pacco in agenzia con codice LP." },
    ],
    fields: [
      { id: "recipient_name", label: "Nome destinatario", placeholder: "Chi ritira", required: true },
      { id: "carrier", label: "Corriere", placeholder: "Es. BRT, GLS" },
      { id: "expected_days", label: "Giorni stimati", placeholder: "Es. 3", type: "number" },
    ],
  },
];

export function getClientAreaConfig(key: string): ClientAreaConfig | null {
  return clientAreas.find((area) => area.key === key) ?? null;
}

export function requireClientAreaConfig(key: ClientAreaKey): ClientAreaConfig {
  const config = getClientAreaConfig(key);
  if (!config) {
    throw new Error(`Config area clienti mancante: ${key}`);
  }
  return config;
}

export function isClientAreaKey(key: string): key is ClientAreaKey {
  return clientAreas.some((area) => area.key === key);
}
