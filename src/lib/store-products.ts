export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  amountCents: number;
  currency: string;
  checkoutUrl: string;
};

export const storeProducts: StoreProduct[] = [
  {
    id: "spid",
    name: "Attivazione SPID",
    description: "Attivazione guidata SPID con verifica documenti e supporto completo.",
    priceLabel: "€29",
    amountCents: 2900,
    currency: "eur",
    checkoutUrl: "/checkout?product=spid",
  },
  {
    id: "pec",
    name: "Attivazione PEC",
    description: "Attivazione e configurazione casella PEC per privati e professionisti.",
    priceLabel: "€19",
    amountCents: 1900,
    currency: "eur",
    checkoutUrl: "/checkout?product=pec",
  },
  {
    id: "firma-digitale",
    name: "Firma Digitale",
    description: "Richiesta e attivazione firma digitale con assistenza operativa.",
    priceLabel: "€39",
    amountCents: 3900,
    currency: "eur",
    checkoutUrl: "/checkout?product=firma-digitale",
  },
  {
    id: "telefonia",
    name: "Consulenza Telefonia",
    description: "Analisi e attivazione della migliore offerta mobile/fisso.",
    priceLabel: "€25",
    amountCents: 2500,
    currency: "eur",
    checkoutUrl: "/checkout?product=telefonia",
  },
  {
    id: "energia",
    name: "Consulenza Energia",
    description: "Ottimizzazione tariffe luce/gas e supporto cambio fornitore.",
    priceLabel: "€25",
    amountCents: 2500,
    currency: "eur",
    checkoutUrl: "/checkout?product=energia",
  },
  {
    id: "pagamenti",
    name: "Servizi di Pagamento",
    description: "Supporto pratiche e pagamenti digitali con assistenza dedicata.",
    priceLabel: "€15",
    amountCents: 1500,
    currency: "eur",
    checkoutUrl: "/checkout?product=pagamenti",
  },
];

export function getStoreProducts() {
  return storeProducts;
}
