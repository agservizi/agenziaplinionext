import CmsJsonEditor from "@/components/cms/CmsJsonEditor";
import { readReviews } from "@/lib/cms/reader";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CmsReviewEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reviews = await readReviews();
  const review = reviews.find((r) => r.slug === slug);
  if (!review) notFound();
  return (
    <CmsJsonEditor
      target={`reviews/${slug}`}
      initialData={{
        name: review.name,
        initials: review.initials,
        color: review.color,
        rating: review.rating,
        text: review.text || "",
        order: review.order,
      }}
      title={review.name}
      keystaticHref={`/keystatic/collection/reviews/item/${slug}`}
    />
  );
}
