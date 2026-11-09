import Link from "next/link";
import { readReviews } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsReviewsIndexPage() {
  const reviews = await readReviews();
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Contenuti</p>
      <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Recensioni</h1>
      <ul className="mt-8 divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/10">
        {reviews.map((review) => (
          <li key={review.slug}>
            <Link
              href={`/area-admin/recensioni/${review.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
            >
              <span className="font-medium">{review.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/35">{review.rating}★</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
