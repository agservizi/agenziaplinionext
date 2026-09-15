import Link from "next/link";
import { fetchPublishedProducts } from "@/lib/saleor/client";
import { ShopProductCard } from "@/components/shop/ShopProductCard";

/**
 * Home shop widget — hidden when catalog is empty or Saleor is unreachable.
 */
export default async function ShopHomeSection() {
  if (process.env.NEXT_PUBLIC_SHOP_HOME_WIDGET === "0") {
    return null;
  }

  const { products, totalCount, ok } = await fetchPublishedProducts(8);

  if (!ok || totalCount < 1 || products.length < 1) {
    return null;
  }

  return (
    <section
      id="shop"
      className="relative border-t border-white/5 bg-slate-950 py-20 text-white"
      aria-labelledby="shop-home-heading"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#22d3ee]/80">
              Shop
            </p>
            <h2
              id="shop-home-heading"
              className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl"
            >
              Prodotti e servizi digitali
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/50">
              Acquista online. Gli ordini compaiono subito nella tua Area Clienti.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-[#5E0ED7]/60 hover:bg-[#5E0ED7]/15"
          >
            Vedi tutto
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
