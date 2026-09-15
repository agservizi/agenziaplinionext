import Link from "next/link";
import { fetchPublishedProducts, isSaleorConfigured } from "@/lib/saleor/client";
import { ShopProductCard } from "@/components/shop/ShopProductCard";

export const revalidate = 60;

export default async function ShopPage() {
  const configured = isSaleorConfigured();
  const { products, totalCount, ok } = configured
    ? await fetchPublishedProducts(24)
    : { products: [], totalCount: 0, ok: false };

  return (
    <main className="min-h-dvh bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#22d3ee]/80">
          Shop
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Catalogo AG</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/50">
          Storefront allineato a Saleor Paper. Checkout completo sul package{" "}
          <code className="font-mono text-white/70">storefront/</code> (basePath{" "}
          <code className="font-mono text-white/70">/shop</code>).
        </p>

        {!configured ? (
          <p className="mt-10 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            Saleor non configurato. Imposta <code className="font-mono">NEXT_PUBLIC_SALEOR_API_URL</code>.
          </p>
        ) : null}

        {configured && !ok ? (
          <p className="mt-10 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            Catalogo temporaneamente non disponibile.
          </p>
        ) : null}

        {ok && totalCount === 0 ? (
          <p className="mt-10 text-sm text-white/40">Nessun prodotto pubblicato.</p>
        ) : null}

        {products.length > 0 ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        <div className="mt-14">
          <Link href="/" className="text-sm text-white/50 hover:text-white">
            ← Torna alla home
          </Link>
        </div>
      </div>
    </main>
  );
}
