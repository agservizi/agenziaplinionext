import CmsJsonEditor from "@/components/cms/CmsJsonEditor";
import { readServices } from "@/lib/cms/reader";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CmsServiceEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = await readServices();
  const svc = services.find((s) => s.fileSlug === slug);
  if (!svc) notFound();
  return (
    <CmsJsonEditor
      target={`services/${slug}`}
      initialData={{
        title: svc.title,
        category: svc.category,
        shortDescription: svc.shortDescription,
        heroDescription: svc.heroDescription,
        customerBenefits: svc.customerBenefits,
        requiredInfo: svc.requiredInfo,
        notes: svc.notes,
        officialSources: svc.officialSources,
      }}
      title={svc.title}
      keystaticHref={`/keystatic/collection/services/item/${slug}`}
    />
  );
}
