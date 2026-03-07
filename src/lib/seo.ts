import type { Metadata } from "next";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://agenziaplinio.it").replace(/\/+$/, "");
export const SITE_NAME = "AG SERVIZI";

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
};

export function buildMetadata({ title, description, path, image, index }: SeoConfig): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const ogImage = image ?? "/og-default.svg";
  const isIndexable = index ?? isIndexablePath(path);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      nocache: !isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        noimageindex: !isIndexable,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "it_IT",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "AG SERVIZI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
