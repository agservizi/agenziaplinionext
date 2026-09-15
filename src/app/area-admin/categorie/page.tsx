import { ModuleFrame, ModuleNotice, ModuleTable } from "@/components/portal/ModuleFrame";
import { ApiForm } from "@/components/portal/ApiForm";
import { fetchShopCategories, isSaleorConfigured } from "@/lib/saleor/client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriePage() {
  const configured = isSaleorConfigured();
  const result = configured
    ? await fetchShopCategories(50)
    : { ok: false as const, categories: [], totalCount: 0 };

  return (
    <ModuleFrame eyebrow="Shop · Saleor" title="Categorie" description="CRUD categorie Saleor.">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ApiForm
          endpoint="/api/admin/shop/categories"
          submitLabel="Crea categoria"
          fields={[
            { name: "name", label: "Nome", required: true },
            { name: "slug", label: "Slug", required: true },
          ]}
        />
        <div>
          {!configured ? (
            <ModuleNotice variant="warning">Saleor non configurato.</ModuleNotice>
          ) : null}
          {result.ok && result.categories.length === 0 ? (
            <ModuleNotice variant="empty">Nessuna categoria.</ModuleNotice>
          ) : null}
          {result.categories.length > 0 ? (
            <ModuleTable
              headers={["Nome", "Slug", "Prodotti"]}
              rows={result.categories.map((c) => [c.name, c.slug, String(c.productCount)])}
            />
          ) : null}
        </div>
      </div>
    </ModuleFrame>
  );
}
