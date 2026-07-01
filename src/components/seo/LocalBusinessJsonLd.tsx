import { company, serviceCategories } from "@/lib/site-data";
import { absoluteImageUrl, absoluteUrl, SITE_URL, SITE_NAME, GEO } from "@/lib/seo";
import { googleReviews, googleReviewsCount } from "@/lib/google-reviews";

export default function LocalBusinessJsonLd() {
  const services = serviceCategories.map((category) => category.title);
  const sameAs = [company.googleBusinessUrl].filter(Boolean);
  const averageRating =
    googleReviews.reduce((sum, review) => sum + review.rating, 0) / googleReviewsCount;
  const reviews = googleReviews
    .filter((review) => review.text)
    .map((review) => ({
      "@type": "Review" as const,
      author: { "@type": "Person" as const, name: review.name },
      reviewRating: {
        "@type": "Rating" as const,
        ratingValue: review.rating,
        bestRating: 5,
      },
      reviewBody: review.text,
      publisher: { "@type": "Organization" as const, name: "Google" },
    }));

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
        telephone: company.phone,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: absoluteImageUrl("/favicon.png"),
          contentUrl: absoluteImageUrl("/favicon.png"),
          caption: SITE_NAME,
        },
        image: absoluteImageUrl("/og-default.svg"),
        foundingDate: String(company.openedYear),
        vatID: company.vat,
        address,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: company.phone,
          availableLanguage: "Italian",
          areaServed: GEO.country,
        },
        sameAs: sameAs.length > 0 ? sameAs : undefined,
      },

      /* ── WebSite + SearchAction (sitelinks search box) ─ */
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: company.name,
        description:
          "AG SERVIZI a Castellammare di Stabia: consulenze telefonia, energia, SPID, PEC, spedizioni, visure, CAF e siti web. In Via Plinio il Vecchio 72, dal 2016.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "it-IT",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/servizi")}?q={search_term_string}`,
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
        image: absoluteImageUrl("/og-default.svg"),
        logo: { "@id": `${SITE_URL}/#logo` },
        telephone: company.phone,
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
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(averageRating.toFixed(1)),
          reviewCount: googleReviewsCount,
          bestRating: 5,
          worstRating: 1,
        },
        review: reviews,
        priceRange: "€",
        currenciesAccepted: "EUR",
        paymentAccepted: "Cash, Credit Card, Debit Card",
        isAccessibleForFree: false,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
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

      {
        "@type": "Service",
        "@id": `${SITE_URL}/#service-catalog`,
        serviceType: "Agenzia servizi e consulenza multiservizi",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Italy" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Catalogo servizi AG SERVIZI",
          itemListElement: serviceCategories.map((category, index) => ({
            "@type": "OfferCatalog",
            name: category.title,
            position: index + 1,
            itemListElement: category.items.map((item) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: item.title,
                description: item.description,
                serviceType: category.title,
                provider: { "@id": `${SITE_URL}/#organization` },
              },
            })),
          })),
        },
      },

      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${SITE_NAME} | Home`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: { "@id": `${SITE_URL}/#logo` },
        inLanguage: "it-IT",
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
