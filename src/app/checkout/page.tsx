import Container from "@/components/Container";
import CheckoutClient from "@/components/CheckoutClient";
import { getStoreProducts } from "@/lib/store-products";
import { buildMetadata } from "@/lib/seo";
import { Suspense } from "react";

export function generateMetadata() {
  return buildMetadata({
    title: "Checkout online",
    description: "Completa il tuo acquisto online in checkout sicuro.",
    path: "/checkout",
  });
}

export default async function CheckoutPage() {
  const products = await getStoreProducts();

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Checkout
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Completa il pagamento
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            Seleziona il prodotto e prosegui al pagamento senza usare embed nella pagina checkout.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <Suspense
              fallback={
                <div className="lux-card rounded-2xl p-6">
                  <p className="text-sm text-slate-600">Caricamento checkout…</p>
                </div>
              }
            >
              <CheckoutClient
                products={products}
              />
            </Suspense>
          </Container>
        </section>
      </div>
    </div>
  );
}
