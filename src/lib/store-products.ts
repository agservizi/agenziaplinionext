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
  
];

export function getStoreProducts() {
  return storeProducts;
}
