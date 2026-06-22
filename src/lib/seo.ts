import type { Metadata } from "next";
import { company } from "@/lib/site-data";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://agenziaplinio.it").replace(/\/+$/, "");
export const SITE_NAME = "AG SERVIZI";
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_LOCALE = "it_IT";
export const DEFAULT_LANGUAGE = "it-IT";
export const DEFAULT_KEYWORDS = [
  "agenzia servizi castellammare di stabia",
  "consulenza telefonia",
  "consulenza energia",
  "spedizioni",
  "spid",
  "pec",
  "firma digitale",
  "visure",
  "caf patronato",
  "pagopa",
  "servizi digitali",
  "web agency",
] as const;

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

const NOINDEX_PREFIXES = ["/area-admin", "/area-clienti", "/api", "/evadi-pratica", "/scarica-pratica", "/checkout"];
const NOINDEX_EXACT = new Set(["/login", "/admin-login"]);

export const PRIVATE_AREA_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function isIndexablePath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (NOINDEX_EXACT.has(normalized)) return false;
  return !NOINDEX_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}

export function absoluteImageUrl(image = DEFAULT_OG_IMAGE): string {
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image);
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
  const canonical = absoluteUrl(path);
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const fullKeywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...(keywords ?? [])]));
  const isIndexable = index ?? isIndexablePath(path);

  return {
    title,
    description,
    keywords: fullKeywords,
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
      locale: DEFAULT_LOCALE,
      type: ogType ?? "website",
      ...(ogImage
        ? {
            images: [
              {
                url: absoluteImageUrl(ogImage),
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
      countryName: "Italy",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [absoluteImageUrl(ogImage)] } : {}),
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

export function buildRootMetadata(): Metadata {
  const description =
    "AG SERVIZI a Castellammare di Stabia: consulenze telefonia, energia, SPID, PEC, spedizioni, visure, CAF e siti web. Vieni in Via Plinio 72 o scrivici su WhatsApp.";

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali a Castellammare di Stabia",
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: Array.from(DEFAULT_KEYWORDS),
    authors: [{ name: company.name, url: SITE_URL }],
    creator: company.name,
    publisher: company.name,
    category: "business",
    classification: "Servizi professionali, consulenza, servizi digitali",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: "/",
      languages: {
        [DEFAULT_LANGUAGE]: "/",
        "x-default": "/",
      },
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: DEFAULT_LOCALE,
      type: "website",
      countryName: "Italy",
    },
    twitter: {
      card: "summary_large_image",
      title: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
      description,
    },
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SITE_NAME,
    },
    other: {
      "geo.region": GEO.region,
      "geo.placename": GEO.placename,
      "geo.position": `${GEO.lat};${GEO.lng}`,
      ICBM: `${GEO.lat}, ${GEO.lng}`,
      "revisit-after": "7 days",
      "content-language": "it",
      "mobile-web-app-capable": "yes",
    },
  };
}
