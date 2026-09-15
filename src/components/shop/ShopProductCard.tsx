import Link from "next/link";
import type { SaleorProductCard } from "@/lib/saleor/client";
import { cn } from "@/lib/utils";

function formatPrice(price: SaleorProductCard["price"]) {
  if (!price) return "Prezzo su richiesta";
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: price.currency || "EUR",
    }).format(price.amount);
  } catch {
    return `${price.amount} ${price.currency}`;
  }
}

/**
 * Product card shared by /shop storefront surface and home widget.
 * Visual language aligned with Saleor Paper + AG brand.
 */
export function ShopProductCard({
  product,
  className,
}: {
  product: SaleorProductCard;
  className?: string;
}) {
  const href = `/shop/products/${product.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition",
        "hover:border-[#5E0ED7]/50 hover:bg-white/[0.05]",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/30">
            AG Shop
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.productType ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#22d3ee]/80">
            {product.productType}
          </p>
        ) : null}
        <h3 className="text-base font-semibold text-white group-hover:text-white">
          {product.name}
        </h3>
        <p className="mt-auto text-sm font-medium text-white/70">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
