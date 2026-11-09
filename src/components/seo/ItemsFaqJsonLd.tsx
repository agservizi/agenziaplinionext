/**
 * Callers: guide/zone pages with custom FAQ arrays.
 * Schema: FAQPage JSON-LD. Plan: SEO FAQ per articolo.
 */
type FaqItem = { q: string; a: string };

export default function ItemsFaqJsonLd({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
