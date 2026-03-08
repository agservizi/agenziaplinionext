"use client";

import Link from "next/link";
import { company } from "@/lib/site-data";

export default function PlatformFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 px-6 py-5 text-sm text-slate-300 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center">
            <img src="/logo.png" alt="AG SERVIZI" className="h-9 w-auto" />
            <span className="sr-only">{company.name}</span>
          </Link>
          <p className="text-xs text-slate-400">
            Area riservata per clienti, gestione pratiche e operatività interna.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
          <span>P. IVA {company.vat}</span>
          <span>SDI {company.sdi}</span>
          <Link href="/privacy-policy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/cookie-policy" className="transition hover:text-white">
            Cookie
          </Link>
          <a
            href="https://www.hostinger.com/it?REFERRALCODE=URBAGSERV8DA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center transition hover:opacity-90"
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
    </footer>
  );
}
