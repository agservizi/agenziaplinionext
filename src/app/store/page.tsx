import Link from "next/link";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { storeProducts } from "@/lib/store-products";

const payhipCheckoutUrl = process.env.NEXT_PUBLIC_PAYHIP_CHECKOUT_URL ?? "";

export function generateMetadata() {
  return buildMetadata({
    title: "Store digitale AG SERVIZI",
    description:
      "Acquista servizi digitali e prodotti online di AG SERVIZI tramite checkout sicuro Payhip.",
    path: "/store",
  });
}

export default function StorePage() {
  const hasCustomCatalog = storeProducts.length > 0;

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Store
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Acquista online con checkout sicuro Payhip
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui trovi i prodotti e servizi disponibili all’acquisto online con
              backend Payhip per pagamenti e gestione ordini.
            </p>
            {payhipCheckoutUrl ? (
              <Link
                href={payhipCheckoutUrl}
                className="inline-flex rounded-full border border-cyan-400/60 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-white"
              >
                Vai al checkout
              </Link>
            ) : null}
            {!hasCustomCatalog ? (
              <Link
                href="/contatti"
                className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Contattaci per attivare lo store
              </Link>
            ) : null}
          </div>
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Vantaggi
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Pagamento online immediato e verificato.</li>
                <li>• Accesso rapido ai prodotti digitali disponibili.</li>
                <li>• Processo d’acquisto semplice, da desktop e mobile.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Catalogo online
            </h2>
            {hasCustomCatalog ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {storeProducts.map((product) => (
                  <article
                    key={product.id}
                    className="lux-card flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">{product.description}</p>
                    <p className="mt-4 text-base font-semibold text-slate-900">{product.priceLabel}</p>
                    <Link
                      href={product.checkoutUrl}
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
                    >
                      Aggiungi al carrello
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="lux-card rounded-2xl p-6">
                <p className="text-sm text-slate-600">
                  Configura i prodotti in <strong>src/lib/store-products.ts</strong>
                  per mostrare il catalogo frontend e collegare ogni acquisto al
                  checkout Payhip.
                </p>
              </div>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
}