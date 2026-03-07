import { company, serviceCategories } from "@/lib/site-data";
import { SITE_URL } from "@/lib/seo";

export default function LocalBusinessJsonLd() {
  const services = serviceCategories.map((category) => category.title);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: company.name,
        legalName: company.legalName,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
        image: `${SITE_URL}/og-default.svg`,
        foundingDate: String(company.openedYear),
        vatID: company.vat,
        sameAs: company.googleBusinessUrl ? [company.googleBusinessUrl] : undefined,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: company.name,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "it-IT",
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
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
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
