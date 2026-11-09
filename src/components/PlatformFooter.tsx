import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/site-data";

type PlatformFooterProps = {
  tone?: "platform" | "client";
};

export default function PlatformFooter({ tone = "platform" }: PlatformFooterProps) {
  const isClient = tone === "client";

  // Callers: ClientAreaShell, AppShell. Sticky bottom on short pages.
  // User: il footer deve sempre stare in basso nelle pagine con poco contenuto
  if (isClient) {
    return (
      <footer className="mt-auto shrink-0 border-t border-[var(--ink)]/10 bg-[var(--paper)] text-[var(--ink)]/55">
        <div className="mx-auto flex w-full max-w-none flex-col gap-4 px-5 py-5 text-sm md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center font-bold text-[var(--ink)]">
              {company.name}
            </Link>
            <p className="text-xs text-[var(--ink)]/45">
              Area riservata clienti — pratiche, documenti e servizi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--ink)]/45">
            <span>P. IVA {company.vat}</span>
            <span>SDI {company.sdi}</span>
            <Link href="/privacy-policy" className="transition hover:text-[var(--ink)]">
              Privacy
            </Link>
            <Link href="/cookie-policy" className="transition hover:text-[var(--ink)]">
              Cookie
            </Link>
            <a
              href="https://www.hostinger.com/it?REFERRALCODE=URBAGSERV8DA"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[var(--ink)]"
            >
              Hostinger
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto shrink-0 border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex w-full max-w-none flex-col gap-4 px-6 py-5 text-sm text-slate-300 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="AG SERVIZI" width={174} height={36} className="h-9 w-auto" />
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
            <Image
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
