import { company, serviceCategories } from "@/lib/site-data";
import { SITE_URL, SITE_NAME, GEO } from "@/lib/seo";

export default function LocalBusinessJsonLd() {
  const services = serviceCategories.map((category) => category.title);

  const address = {
    "@type": "PostalAddress" as const,
    streetAddress: GEO.streetAddress,
    addressLocality: GEO.placename,
    addressRegion: GEO.province,
    postalCode: GEO.postalCode,
    addressCountry: GEO.country,
  };

  const geo = {
    "@type": "GeoCoordinates" as const,
    latitude: GEO.lat,
    longitude: GEO.lng,
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      /* ── Organization ────────────────────────────────── */
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: company.name,
        legalName: company.legalName,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/favicon.png`,
          contentUrl: `${SITE_URL}/favicon.png`,
          caption: SITE_NAME,
        },
        image: `${SITE_URL}/og-default.svg`,
        foundingDate: String(company.openedYear),
        vatID: company.vat,
        address,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "Italian",
          areaServed: GEO.country,
        },
        sameAs: company.googleBusinessUrl ? [company.googleBusinessUrl] : undefined,
      },

      /* ── WebSite + SearchAction (sitelinks search box) ─ */
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: company.name,
        description:
          "AG SERVIZI è un'agenzia di servizi moderna e dinamica specializzata in consulenze per telefonia, energia elettrica e gas, con soluzioni digitali su misura.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "it-IT",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/servizi?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },

      /* ── LocalBusiness (arricchito con geo, orari, contatti) */
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: company.name,
        url: SITE_URL,
        image: `${SITE_URL}/og-default.svg`,
        logo: { "@id": `${SITE_URL}/#logo` },
        address,
        geo,
        hasMap: company.googleBusinessUrl,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "13:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "15:30",
            closes: "19:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "09:00",
            closes: "13:00",
          },
        ],
        areaServed: [
          {
            "@type": "City",
            name: GEO.placename,
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: GEO.addressRegion,
            },
          },
          {
            "@type": "AdministrativeArea",
            name: "Provincia di Napoli",
          },
          {
            "@type": "Country",
            name: "Italy",
          },
        ],
        foundingDate: String(company.openedYear),
        vatID: company.vat,
        priceRange: "€",
        currenciesAccepted: "EUR",
        paymentAccepted: "Cash, Credit Card, Debit Card",
        isAccessibleForFree: false,
        makesOffer: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service,
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: { "@type": "Country", name: "Italy" },
          },
        })),
      },

      /* ── BreadcrumbList (homepage) ───────────────────── */
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Servizi",
            item: `${SITE_URL}/servizi`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Contatti",
            item: `${SITE_URL}/contatti`,
          },
        ],
      },

      /* ── GeoShape (raggio di servizio) ───────────────── */
      {
        "@type": "Place",
        "@id": `${SITE_URL}/#place`,
        name: `${company.name} - ${GEO.placename}`,
        address,
        geo,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: GEO.addressRegion,
          containedInPlace: {
            "@type": "Country",
            name: "Italy",
          },
        },
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
