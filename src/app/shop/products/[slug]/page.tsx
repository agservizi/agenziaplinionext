import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPublishedProducts } from "@/lib/saleor/client";
import { ShopProductCard } from "@/components/shop/ShopProductCard";

export const revalidate = 60;

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products, ok } = await fetchPublishedProducts(50);
  if (!ok) notFound();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <main className="min-h-dvh bg-slate-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:px-10">
        <div className="max-w-md">
          <ShopProductCard product={product} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#22d3ee]/80">
            {product.productType || "Prodotto"}
          </p>
          <h1 className="mt-2 text-3xl font-black">{product.name}</h1>
          <p className="mt-4 text-sm text-white/50">
            Dettaglio e checkout completi sono gestiti da Saleor Paper (`storefront/`).
            Questa PDP di bridge usa la stessa card UI della home.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-[#5E0ED7]/60"
          >
            Torna al catalogo
          </Link>
        </div>
      </div>
    </main>
  );
}
