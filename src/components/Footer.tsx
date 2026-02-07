"use client";

import Link from "next/link";
import Container from "./Container";
import { company, navigation } from "@/lib/site-data";
import { useConsent } from "@/components/cookies/ConsentProvider";

export default function Footer() {
  const { openPreferences } = useConsent();

  return (
    <footer className="bg-slate-950 py-12">
      <Container className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-white">{company.name}</p>
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
          <p className="text-sm text-slate-300">
            Consulenze su appuntamento per privati e aziende.
          </p>
          <p className="text-sm text-slate-300">
            Integrazione area riservata e servizi digitali in evoluzione.
          </p>
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
          </div>
        </div>
      </Container>
    </footer>
  );
}
