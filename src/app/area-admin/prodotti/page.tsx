import Link from "next/link";
import { ModuleFrame, ModuleNotice } from "@/components/portal/ModuleFrame";
import { ApiForm, ActionButton } from "@/components/portal/ApiForm";
import { fetchPublishedProducts, isSaleorConfigured } from "@/lib/saleor/client";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { readStaffSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminProdottiPage() {
  const session = await readStaffSession();
  const configured = isSaleorConfigured();
  const { products, totalCount, ok } = configured
    ? await fetchPublishedProducts(50)
    : { products: [], totalCount: 0, ok: false };

  return (
    <ModuleFrame
      eyebrow="Shop · Saleor"
      title="Prodotti"
      description={`Source of truth Saleor. Operatore: ${session?.username || "—"}`}
      actions={
        <Link
          href="/shop"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Storefront
        </Link>
      }
    >
      {!configured ? (
        <ModuleNotice variant="warning">
          Configura <code className="font-mono">NEXT_PUBLIC_SALEOR_API_URL</code> e{" "}
          <code className="font-mono">SALEOR_APP_TOKEN</code>.
        </ModuleNotice>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/products"
          submitLabel="Crea prodotto"
          fields={[
            { name: "name", label: "Nome", required: true },
            { name: "slug", label: "Slug SEO", required: true, placeholder: "mio-prodotto" },
            { name: "description", label: "Descrizione" },
            { name: "productTypeId", label: "Product Type ID (opz.)" },
            { name: "categoryId", label: "Category ID (opz.)" },
          ]}
          buildBody={(v) => ({
            action: "create",
            name: v.name,
            slug: v.slug,
            description: v.description,
            productTypeId: v.productTypeId || undefined,
            categoryId: v.categoryId || undefined,
            publish: true,
          })}
        />

        <div className="space-y-4">
          {configured && !ok ? (
            <ModuleNotice variant="error">Saleor non raggiungibile.</ModuleNotice>
          ) : null}
          {ok && totalCount === 0 ? (
            <ModuleNotice variant="empty">Nessun prodotto pubblicato.</ModuleNotice>
          ) : null}
          {products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="space-y-2 rounded-2xl bg-slate-950 p-1">
                  <ShopProductCard product={p} />
                  <div className="flex gap-2 px-2 pb-2">
                    <ActionButton
                      endpoint="/api/admin/shop/products"
                      body={{ action: "publish", productId: p.id }}
                      label="Pubblica"
                    />
                    <ActionButton
                      endpoint="/api/admin/shop/products"
                      body={{ action: "archive", productId: p.id }}
                      label="Elimina"
                      confirm="Eliminare definitivamente questo prodotto?"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ModuleFrame>
  );
}
