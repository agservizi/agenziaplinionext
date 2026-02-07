import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConsentProvider } from "@/components/cookies/ConsentProvider";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import { SITE_URL } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
    template: "%s | AG SERVIZI",
  },
  description:
    "AG SERVIZI è un’agenzia di servizi moderna e dinamica specializzata in consulenze per telefonia, energia elettrica e gas, con soluzioni digitali su misura.",
  keywords: [
    "consulenza telefonia",
    "energia",
    "gas",
    "servizi digitali",
    "SPID",
    "PEC",
    "Castellammare di Stabia",
  ],
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
    description:
      "AG SERVIZI è un’agenzia di servizi moderna e dinamica specializzata in consulenze per telefonia, energia elettrica e gas, con soluzioni digitali su misura.",
    url: SITE_URL,
    siteName: "AG SERVIZI",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "AG SERVIZI · Castellammare di Stabia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AG SERVIZI | Consulenze Telefonia, Energia e Servizi Digitali",
    description:
      "AG SERVIZI è un’agenzia di servizi moderna e dinamica specializzata in consulenze per telefonia, energia elettrica e gas, con soluzioni digitali su misura.",
    images: ["/og-default.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-white antialiased`}
      >
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
          <Header />
          <main className="min-h-screen bg-slate-950">{children}</main>
          <Footer />
        </ConsentProvider>
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
