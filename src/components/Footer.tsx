"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";
import { company, navigation } from "@/lib/site-data";
import { useConsent } from "@/components/cookies/ConsentProvider";

export default function Footer() {
  const { openPreferences } = useConsent();
  const pathname = usePathname();
  const isLegalPage = pathname === "/privacy-policy" || pathname === "/cookie-policy";
  const footerContentOffsetClass = isLegalPage ? "-translate-y-2" : "-translate-y-8";

  return (
    <footer className="bg-slate-950 py-12">
      <Container className={`relative ${footerContentOffsetClass} grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]`}>
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center">
            <img src="/logo.png" alt="AG SERVIZI" className="h-10 w-auto" />
            <span className="sr-only">{company.name}</span>
          </Link>
          <p className="text-sm text-slate-300">{company.legalName}</p>
          <p className="text-sm text-slate-300">{company.address}</p>
          <div className="text-sm text-slate-400">
            <p>P. IVA: {company.vat}</p>
            <p>Codice SDI: {company.sdi}</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Navigazione
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Orari e supporto
          </p>
          <div className="space-y-1 text-sm text-slate-300">
            <p>Lunedi - Venerdi: 08:45 - 13:20 / 16:20 - 19:00</p>
            <p>Sabato: 09:20 - 12:30</p>
            <p>Domenica: Chiuso</p>
          </div>
          <p className="text-sm text-slate-300">Supporto anche su appuntamento.</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Legale
          </p>
          <div className="flex flex-col gap-2 text-sm text-slate-300">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-white">
              Cookie Policy
            </Link>
            {company.googleBusinessUrl ? (
              <Link
                href={company.googleBusinessUrl}
                className="hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                Google Business
              </Link>
            ) : null}
            <button
              type="button"
              onClick={openPreferences}
              className="text-left text-sm text-slate-300 hover:text-white"
            >
              Gestisci cookie
            </button>
            <a
              href="https://www.hostinger.com/it?REFERRALCODE=URBAGSERV8DA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center pt-1 transition hover:opacity-90"
              aria-label="Hostinger referral"
            >
              <img
                src="/hostinger_logo_white_fixed.png"
                alt="Hostinger"
                width={88}
                height={20}
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
