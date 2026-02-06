import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  robots: {
    index: true,
    follow: true,
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
        <Header />
        <main className="min-h-screen bg-slate-950">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
