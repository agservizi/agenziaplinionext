import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://agenziaplinio.it";

export type SeoConfig = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildMetadata({ title, description, path, image }: SeoConfig): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const ogImage = image ?? "/og-default.svg";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "AG SERVIZI",
      locale: "it_IT",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "AG SERVIZI · Castellammare di Stabia",
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
