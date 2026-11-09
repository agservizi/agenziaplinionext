import CmsJsonEditor from "@/components/cms/CmsJsonEditor";
import { readFaqs } from "@/lib/cms/reader";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CmsFaqEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const faqs = await readFaqs();
  const faq = faqs.find((f) => f.slug === slug);
  if (!faq) notFound();
  return (
    <CmsJsonEditor
      target={`faqs/${slug}`}
      initialData={{ question: faq.q, answer: faq.a, order: faq.order }}
      title={faq.q}
      keystaticHref={`/keystatic/collection/faqs/item/${slug}`}
    />
  );
}
