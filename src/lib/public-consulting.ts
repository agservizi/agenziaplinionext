export type PublicConsultingService = {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  focusQuestions: string[];
};

export const publicConsultingServices: PublicConsultingService[] = [
  {
    key: "pagamenti",
    label: "Pagamenti e bollettini",
    shortLabel: "Pagamenti",
    description: "Bollettini, F24, PagoPA, bollo auto. Porti il foglio e ci pensiamo noi.",
    focusQuestions: ["Tipo pratica", "Frequenza", "Urgenza operativa"],
  },
  {
    key: "telefonia",
    label: "Telefonia e internet",
    shortLabel: "Telefonia",
    description: "Ti aiutiamo a scegliere l'offerta giusta e a cambiare operatore.",
    focusQuestions: ["Operatore attuale", "Spesa media", "Numero linee"],
  },
  {
    key: "energia",
    label: "Luce e gas",
    shortLabel: "Energia",
    description: "Guardiamo la bolletta e vediamo se puoi spendere meno.",
    focusQuestions: ["Fornitore attuale", "Spesa media", "Comune fornitura"],
  },
  {
    key: "digitali",
    label: "SPID, PEC e firma digitale",
    shortLabel: "Servizi digitali",
    description: "Li attiviamo in sede, in pochi minuti. Vieni con un documento.",
    focusQuestions: ["Servizio richiesto", "Documenti pronti", "Scadenza"],
  },
  {
    key: "web-agency",
    label: "Web agency",
    shortLabel: "Web Agency",
    description: "Siti web, e-commerce e gestionali. Ti diciamo quanto costa prima di partire.",
    focusQuestions: ["Obiettivo progetto", "Budget", "Tempistiche"],
  },
  {
    key: "spedizioni",
    label: "Spedizioni e logistica",
    shortLabel: "Spedizioni",
    description: "Italia ed estero. Prepariamo l'etichetta e organizziamo il ritiro.",
    focusQuestions: ["Destinazioni", "Volume mensile", "Tempi ritiro"],
  },
  {
    key: "visure",
    label: "Visure e pratiche documentali",
    shortLabel: "Visure",
    description: "Camerali, catastali, PRA. Apriamo la pratica e ti aggiorniamo.",
    focusQuestions: ["Tipologia visura", "Riferimento pratica", "Urgenza"],
  },
  {
    key: "caf-patronato",
    label: "CAF e Patronato",
    shortLabel: "CAF/Patronato",
    description: "ISEE, 730, pensione, bonus. Ti diciamo quali documenti servono e li raccogliamo.",
    focusQuestions: ["Tipologia pratica", "Documenti disponibili", "Scadenza"],
  },
];

export const publicConsultingServiceKeys = new Set(publicConsultingServices.map((service) => service.key));

export function getPublicConsultingService(value: string) {
  return publicConsultingServices.find((service) => service.key === value) || null;
}

