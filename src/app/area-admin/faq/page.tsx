import Link from "next/link";
import { readFaqs } from "@/lib/cms/reader";

export const dynamic = "force-dynamic";

export default async function CmsFaqIndexPage() {
  const faqs = await readFaqs();
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Contenuti</p>
      <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">FAQ</h1>
      <p className="mt-2 text-sm text-[var(--ink)]/55">{faqs.length} domande</p>
      <ul className="mt-8 divide-y divide-[var(--ink)]/10 border border-[var(--ink)]/10">
        {faqs.map((faq) => (
          <li key={faq.slug}>
            <Link
              href={`/area-admin/faq/${faq.slug}`}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition hover:bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
            >
              <span className="font-medium text-[var(--ink)]">{faq.q}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/35">Modifica</span>
            </Link>
          </li>
        ))}
      </ul>
      <a
        href="/keystatic/collection/faqs"
        className="mt-6 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7]"
      >
        Gestisci in Keystatic
      </a>
    </div>
  );
}
