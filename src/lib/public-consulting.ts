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
    description: "Supporto operativo su pagamenti, pratiche amministrative e gestione ricorrenze.",
    focusQuestions: ["Tipo pratica", "Frequenza", "Urgenza operativa"],
  },
  {
    key: "telefonia",
    label: "Telefonia e internet",
    shortLabel: "Telefonia",
    description: "Confronto offerte mobile/fibra e analisi costi su linee attive.",
    focusQuestions: ["Operatore attuale", "Spesa media", "Numero linee"],
  },
  {
    key: "energia",
    label: "Luce e gas",
    shortLabel: "Energia",
    description: "Analisi fornitura e possibili ottimizzazioni economiche.",
    focusQuestions: ["Fornitore attuale", "Spesa media", "Comune fornitura"],
  },
  {
    key: "digitali",
    label: "SPID, PEC e firma digitale",
    shortLabel: "Servizi digitali",
    description: "Attivazioni e assistenza su identità digitale e comunicazioni certificate.",
    focusQuestions: ["Servizio richiesto", "Documenti pronti", "Scadenza"],
  },
  {
    key: "web-agency",
    label: "Web agency",
    shortLabel: "Web Agency",
    description: "Consulenza per sito, funnel, e-commerce e strumenti digitali aziendali.",
    focusQuestions: ["Obiettivo progetto", "Budget", "Tempistiche"],
  },
  {
    key: "spedizioni",
    label: "Spedizioni e logistica",
    shortLabel: "Spedizioni",
    description: "Supporto su ritiri, volumi e flussi logistici ricorrenti.",
    focusQuestions: ["Destinazioni", "Volume mensile", "Tempi ritiro"],
  },
  {
    key: "visure",
    label: "Visure e pratiche documentali",
    shortLabel: "Visure",
    description: "Presa in carico pratiche visure con verifica preliminare dati.",
    focusQuestions: ["Tipologia visura", "Riferimento pratica", "Urgenza"],
  },
  {
    key: "caf-patronato",
    label: "CAF e Patronato",
    shortLabel: "CAF/Patronato",
    description: "Assistenza su pratiche fiscali e previdenziali con checklist dedicata.",
    focusQuestions: ["Tipologia pratica", "Documenti disponibili", "Scadenza"],
  },
];

export const publicConsultingServiceKeys = new Set(publicConsultingServices.map((service) => service.key));

export function getPublicConsultingService(value: string) {
  return publicConsultingServices.find((service) => service.key === value) || null;
}

