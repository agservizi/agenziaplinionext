import type { Metadata } from "next";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://agenziaplinio.it").replace(/\/+$/, "");
export const SITE_NAME = "AG SERVIZI";

/** Coordinate geografiche sede AG SERVIZI */
export const GEO = {
  lat: 40.6941,
  lng: 14.4830,
  region: "IT-NA",
  placename: "Castellammare di Stabia",
  country: "IT",
  postalCode: "80053",
  streetAddress: "Via Plinio il Vecchio 72",
  addressRegion: "Campania",
  province: "NA",
} as const;

const NOINDEX_PREFIXES = ["/area-admin", "/area-clienti", "/api"];
const NOINDEX_EXACT = new Set(["/login", "/admin-login"]);

export function isIndexablePath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (NOINDEX_EXACT.has(normalized)) return false;
  return !NOINDEX_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export type SeoConfig = {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
  /** Override tipo OpenGraph (default: "website") */
  ogType?: "website" | "article" | "profile";
  /** Keywords aggiuntive per la pagina */
  keywords?: string[];
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  index,
  ogType,
  keywords,
}: SeoConfig): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const ogImage = image ?? "/og-default.svg";
  const isIndexable = index ?? isIndexablePath(path);

  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical,
      languages: {
        "it-IT": canonical,
        "x-default": canonical,
      },
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      nocache: !isIndexable,
      "max-snippet": isIndexable ? -1 : undefined,
      "max-image-preview": isIndexable ? "large" : undefined,
      "max-video-preview": isIndexable ? -1 : undefined,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        noimageindex: !isIndexable,
        "max-snippet": isIndexable ? -1 : undefined,
        "max-image-preview": isIndexable ? "large" : undefined,
        "max-video-preview": isIndexable ? -1 : undefined,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "it_IT",
      type: ogType ?? "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      countryName: "Italy",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "geo.region": GEO.region,
      "geo.placename": GEO.placename,
      "geo.position": `${GEO.lat};${GEO.lng}`,
      ICBM: `${GEO.lat}, ${GEO.lng}`,
      "revisit-after": "7 days",
      "content-language": "it",
    },
  };
}
