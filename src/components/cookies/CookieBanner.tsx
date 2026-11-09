"use client";

import Link from "next/link";
import { useConsent } from "@/components/cookies/ConsentProvider";

export default function CookieBanner() {
  const { consent, consentReady, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!consentReady || consent) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[340px] max-w-[calc(100vw-2rem)]">
      <div className="border border-[var(--ink)]/15 bg-[var(--paper)] p-5 shadow-[-12px_12px_40px_rgba(11,17,32,0.12)]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--ink)]/15 text-[#5E0ED7]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5" />
              <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
              <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
              Utilizziamo i cookie
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink)]/55">
              Per migliorare la tua esperienza.{" "}
              <Link href="/cookie-policy" className="underline decoration-[var(--ink)]/25 underline-offset-2 transition hover:text-[#5E0ED7]">
                Cookie Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={acceptAll}
            className="brutal-cta-ink flex-1 bg-[var(--ink)] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
          >
            Accetta
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="flex-1 border border-[var(--ink)]/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Rifiuta
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="flex items-center justify-center border border-[var(--ink)]/20 px-3 py-2.5 text-[var(--ink)]/45 transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            aria-label="Personalizza cookie"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
