import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import AppShell from "@/components/AppShell";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { ConsentProvider } from "@/components/cookies/ConsentProvider";
import GeoMetaTags from "@/components/seo/GeoMetaTags";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import CustomCursor from "@/components/CustomCursor";
import { buildRootMetadata } from "@/lib/seo";

/* Self-hosted Satoshi as --font-inter fallback for components that still reference it */
const satoshi = localFont({
  src: [
    { path: "../fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

const cabinet = localFont({
  src: [
    { path: "../fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/cabinet-grotesk-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-funnel",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" dir="ltr" className={`${satoshi.variable} ${cabinet.variable}`}>
      <head>
        <GeoMetaTags />
      </head>
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-[#5E0ED7] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg">
          Vai al contenuto principale
        </a>
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
          <CustomCursor />
          <AppShell>{children}</AppShell>
        </ConsentProvider>
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
