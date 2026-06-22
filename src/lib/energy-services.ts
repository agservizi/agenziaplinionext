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
    slug: "windtre-luce-gas",
    title: "WindTre Luce e Gas",
    shortDescription: "Luce e gas WindTre. Se hai gia WindTre mobile, vediamo se conviene il pacchetto.",
    heroDescription:
      "Ti aiutiamo con le offerte WindTre per luce e gas. Se hai gia la linea mobile, controlliamo se ci sono vantaggi ad avere tutto insieme.",
    customerBenefits: [
      "Se hai gia WindTre, vediamo se il pacchetto integrato ti fa risparmiare.",
      "Controlliamo i passaggi contrattuali prima di procedere.",
      "Ti seguiamo dall'inizio alla fine dell'attivazione.",
    ],
    requiredInfo: [
      "Documento di identita e codice fiscale.",
      "Indirizzo di fornitura e recapiti aggiornati.",
      "Bolletta precedente con dati POD/PDR.",
    ],
    notes: [
      "Promozioni e condizioni possono cambiare nel tempo.",
      "Controlla se ci sono servizi opzionali inclusi nell'offerta.",
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
