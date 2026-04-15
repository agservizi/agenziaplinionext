import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/AppShell";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import ScrollProgress from "@/components/ui/ScrollProgress";
import FloatingContact from "@/components/FloatingContact";
import { ConsentProvider } from "@/components/cookies/ConsentProvider";
import GeoMetaTags from "@/components/seo/GeoMetaTags";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { GEO, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali a Castellammare di Stabia",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "AG SERVIZI è un'agenzia di servizi a Castellammare di Stabia (NA) specializzata in consulenze per telefonia, energia elettrica e gas, spedizioni, SPID, PEC, visure e soluzioni digitali su misura.",
  keywords: [
    "consulenza telefonia",
    "energia",
    "gas",
    "servizi digitali",
    "SPID",
    "PEC",
    "visure",
    "spedizioni",
    "firma digitale",
    "pagamenti",
    "bollettini",
    "CAF patronato",
    "web agency",
    "Castellammare di Stabia",
    "Napoli",
    "agenzia servizi",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "it-IT": "/",
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
    description:
      "AG SERVIZI è un’agenzia di servizi a Castellammare di Stabia specializzata in consulenze per telefonia, energia, spedizioni, SPID, PEC e soluzioni digitali.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "it_IT",
    type: "website",
    countryName: "Italy",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Agenzia Servizi a Castellammare di Stabia`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
    description:
      "AG SERVIZI è un’agenzia di servizi a Castellammare di Stabia specializzata in consulenze per telefonia, energia, spedizioni, SPID, PEC e soluzioni digitali.",
    images: ["/og-default.svg"],
  },
  category: "business",
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
  other: {
    "geo.region": GEO.region,
    "geo.placename": GEO.placename,
    "geo.position": `${GEO.lat};${GEO.lng}`,
    ICBM: `${GEO.lat}, ${GEO.lng}`,
    "revisit-after": "7 days",
    "content-language": "it",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" dir="ltr">
      <head>
        <GeoMetaTags />
      </head>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  analytics_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  wait_for_update: 500
});`}
        </Script>
        <ConsentProvider>
          <ScrollProgress />
          <PageTransitionOverlay />
          <FloatingContact />
          <AppShell>{children}</AppShell>
        </ConsentProvider>
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
