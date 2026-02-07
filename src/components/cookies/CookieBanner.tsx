"use client";

import Link from "next/link";
import { CONSENT_POLICY_VERSION } from "@/lib/consent";
import { useConsent } from "@/components/cookies/ConsentProvider";

export default function CookieBanner() {
  const { consent, acceptAll, rejectAll, openPreferences } = useConsent();

  if (consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl backdrop-blur">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Gestione cookie
            </p>
            <h3 className="text-xl font-semibold">
              Usiamo cookie per migliorare l’esperienza.
            </h3>
            <p className="text-sm text-slate-300">
              Puoi accettare, rifiutare o personalizzare le preferenze. I cookie
              tecnici sono sempre attivi.
            </p>
            <div className="text-xs text-slate-400">
              Versione policy: {CONSENT_POLICY_VERSION}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-nowrap gap-3">
              <button
                type="button"
                onClick={acceptAll}
                className="whitespace-nowrap rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Accetta tutti
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="whitespace-nowrap rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Rifiuta tutti
              </button>
              <button
                type="button"
                onClick={openPreferences}
                className="whitespace-nowrap rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Personalizza
              </button>
            </div>
            <div className="text-xs text-slate-400">
              Leggi la <Link href="/cookie-policy" className="underline">Cookie Policy</Link> e
              la <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
