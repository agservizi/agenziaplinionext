import { GEO, SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * Meta tag GEO e GEO-ready per ottimizzazione locale e AI/LLM.
 * Inseriti nel <head> tramite root layout.
 */
export default function GeoMetaTags() {
  return (
    <>
      {/* Dublin Core geolocalizzazione */}
      <meta name="DC.title" content={SITE_NAME} />
      <meta name="DC.creator" content={SITE_NAME} />
      <meta name="DC.language" content="it" />
      <meta name="DC.coverage" content={`${GEO.placename}, ${GEO.province}, Italy`} />

      {/* Geo meta tags */}
      <meta name="geo.region" content={GEO.region} />
      <meta name="geo.placename" content={GEO.placename} />
      <meta name="geo.position" content={`${GEO.lat};${GEO.lng}`} />
      <meta name="ICBM" content={`${GEO.lat}, ${GEO.lng}`} />

      {/* Place tags (Open Graph location) */}
      <meta property="place:location:latitude" content={String(GEO.lat)} />
      <meta property="place:location:longitude" content={String(GEO.lng)} />
      <meta property="business:contact_data:street_address" content={GEO.streetAddress} />
      <meta property="business:contact_data:locality" content={GEO.placename} />
      <meta property="business:contact_data:region" content={GEO.addressRegion} />
      <meta property="business:contact_data:postal_code" content={GEO.postalCode} />
      <meta property="business:contact_data:country_name" content="Italy" />

      {/* Generative Engine Optimization - Segnali per AI crawlers */}
      <meta name="citation_author" content={SITE_NAME} />
      <meta name="citation_publisher" content={SITE_NAME} />
      <meta name="citation_public_url" content={SITE_URL} />

      {/* Lingua e regione */}
      <meta httpEquiv="content-language" content="it-IT" />
      <meta name="language" content="Italian" />
      <meta name="coverage" content="Italy" />
      <meta name="distribution" content="local" />
      <meta name="target" content="all" />
      <meta name="rating" content="general" />

      {/* Revisit frequency hint */}
      <meta name="revisit-after" content="7 days" />
    </>
  );
}
