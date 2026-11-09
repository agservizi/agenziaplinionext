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
    shortDescription: "Offerte luce e gas Enel Energia. Guardiamo la tua bolletta e vediamo se conviene.",
    heroDescription:
      "Porta la tua bolletta in agenzia. Confrontiamo i costi con le offerte Enel Energia e, se conviene cambiare, gestiamo tutta la pratica.",
    customerBenefits: [
      "Confrontiamo le offerte luce e gas guardando i tuoi consumi reali.",
      "Se devi fare attivazione, subentro o voltura, ci pensiamo noi.",
      "Ti diciamo quali documenti servono e li controlliamo insieme.",
    ],
    requiredInfo: [
      "Documento di identita e codice fiscale.",
      "Indirizzo completo di fornitura.",
      "POD/PDR e ultima bolletta, se li hai.",
    ],
    notes: [
      "I prezzi dipendono dal profilo di consumo e dal periodo.",
      "Dati anagrafici e fornitura devono corrispondere, altrimenti la pratica si blocca.",
    ],
  },
  {
    slug: "a2a-energia",
    title: "A2A Energia",
    shortDescription: "Luce e gas A2A. Ti aiutiamo col cambio fornitore, senza errori.",
    heroDescription:
      "Vediamo insieme le offerte A2A, controlliamo i dati della bolletta attuale e gestiamo il passaggio. Se qualcosa non torna, lo risolviamo prima di inviare.",
    customerBenefits: [
      "Gestiamo il cambio fornitore e controlliamo i dati per evitare scarti.",
      "Guardiamo la tua bolletta attuale per capire se conviene davvero.",
      "Ti aggiorniamo sullo stato della pratica.",
    ],
    requiredInfo: [
      "Documento di identita e codice fiscale.",
      "POD/PDR o bolletta attuale.",
      "Email e telefono per aggiornamenti sulla pratica.",
    ],
    notes: [
      "Le attivazioni dipendono dalla correttezza dei dati contrattuali.",
      "Se cambi intestatario, possono servire documenti aggiuntivi.",
    ],
  },
  {
    slug: "fastweb-energia",
    title: "Fastweb Energia",
    shortDescription: "Fastweb Energia per luce e gas. Vediamo i costi e gestiamo la pratica.",
    heroDescription:
      "Ti interessa Fastweb Energia? Vieni in sede, vediamo insieme le offerte e, se vuoi andare avanti, prepariamo noi tutti i documenti.",
    customerBenefits: [
      "Ti facciamo vedere i costi in base ai tuoi consumi reali.",
      "Controlliamo documenti e riferimenti fornitura prima di inviare.",
      "Se hai domande durante la pratica, ci trovi in sede o al telefono.",
    ],
    requiredInfo: [
      "Documento di identita e codice fiscale.",
      "POD/PDR e indirizzo utenza.",
      "Ultima bolletta per verificare i dati.",
    ],
    notes: [
      "Tempi e condizioni dipendono dalla procedura di switching.",
      "Controlla che email e telefono siano corretti per ricevere le notifiche.",
    ],
  },
  {
    slug: "plenitude",
    title: "Plenitude",
    shortDescription:
      "Offerte luce e gas Plenitude. Confrontiamo la bolletta e gestiamo il cambio fornitore.",
    heroDescription:
      "Porta la bolletta in Via Plinio 72: confrontiamo Plenitude con i tuoi consumi reali e, se conviene, prepariamo la pratica.",
    customerBenefits: [
      "Confronto chiaro su costi e condizioni prima di firmare.",
      "Gestione attivazione, subentro o voltura con controllo documenti.",
      "Aggiornamenti sullo stato della pratica in sede o al telefono.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "POD/PDR e indirizzo di fornitura.",
      "Ultima bolletta, se disponibile.",
    ],
    notes: [
      "Le condizioni dipendono dal profilo di consumo e dal periodo.",
      "Dati anagrafici e fornitura devono corrispondere.",
    ],
  },
  {
    slug: "sentra",
    title: "Sentra Energia",
    shortDescription:
      "Sentra Energia per luce e gas: analisi bolletta e cambio fornitore assistito in sede.",
    heroDescription:
      "Ti interessa Sentra? Vediamo insieme se conviene rispetto alla tua bolletta attuale e gestiamo i documenti per il passaggio.",
    customerBenefits: [
      "Analisi dei consumi prima di proporre un cambio.",
      "Controllo POD/PDR e anagrafica per ridurre scarti.",
      "Supporto fino all'attivazione.",
    ],
    requiredInfo: [
      "Documento di identità e codice fiscale.",
      "POD/PDR o bolletta attuale.",
      "Email e telefono per le comunicazioni.",
    ],
    notes: [
      "Tempi di switching dipendono dal distributore e dai dati inviati.",
      "Eventuali cambi intestatario possono richiedere documenti extra.",
    ],
  },
];

export function getEnergyServiceBySlug(slug: string) {
  return energyServiceDetails.find((item) => item.slug === slug) ?? null;
}

const energySlugByCatalogTitle: Record<string, string> = {
  "Enel Energia": "enel-energia",
  "A2A Energia": "a2a-energia",
  "Fastweb Energia": "fastweb-energia",
  Plenitude: "plenitude",
  "Sentra Energia": "sentra",
};

export function getEnergyServiceSlugByCatalogTitle(title: string) {
  return energySlugByCatalogTitle[title] ?? "";
}
