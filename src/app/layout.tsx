import type { Metadata } from "next";
import { Inter, Funnel_Display } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const funnel = Funnel_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-funnel",
  display: "swap",
});

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" dir="ltr" className={`${inter.variable} ${funnel.variable}`}>
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
          <CustomCursor />
          <AppShell>{children}</AppShell>
        </ConsentProvider>
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
