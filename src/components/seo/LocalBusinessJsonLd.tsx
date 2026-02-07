import { company, serviceCategories } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";

export default function LocalBusinessJsonLd() {
  const services = serviceCategories.map((category) => category.title);

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    url: SITE_URL,
    image: `${SITE_URL}/og-default.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Plinio il Vecchio 72",
      addressLocality: "Castellammare di Stabia",
      addressRegion: "NA",
      postalCode: "80053",
      addressCountry: "IT",
    },
    areaServed: ["Castellammare di Stabia", "Provincia di Napoli"],
    foundingDate: String(company.openedYear),
    vatID: company.vat,
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service,
      },
    })),
    sameAs: company.googleBusinessUrl ? [company.googleBusinessUrl] : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
