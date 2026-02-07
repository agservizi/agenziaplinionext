"use client";

import { useMemo, useState } from "react";
import { cookieCategories } from "@/lib/cookies";
import { ConsentState, defaultConsent } from "@/lib/consent";
import { useConsent } from "@/components/cookies/ConsentProvider";

export default function CookiePreferencesModal() {
  const {
    consent,
    preferencesOpen,
    closePreferences,
    saveConsent,
    acceptAll,
    rejectAll,
  } = useConsent();

  const [draft, setDraft] = useState<ConsentState | null>(null);

  const current = useMemo(() => consent ?? defaultConsent, [consent]);

  if (!preferencesOpen) return null;

  const working = draft ?? current;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={closePreferences} />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Preferenze cookie
            </p>
            <h3 className="text-xl font-semibold">Gestisci il consenso</h3>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600"
          >
            Chiudi
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {cookieCategories.map((category) => {
            const key = category.key as keyof ConsentState;
            const isNecessary = category.key === "necessary";
            const value = working[key] as boolean;
            return (
              <div key={category.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isNecessary}
                    onClick={() =>
                      setDraft({
                        ...working,
                        [key]: isNecessary ? true : !value,
                      })
                    }
                    className={
                      isNecessary
                        ? "cursor-not-allowed rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                        : value
                        ? "rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white"
                        : "rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                    }
                  >
                    {isNecessary ? "Sempre attivi" : value ? "Attivi" : "Disattivi"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => saveConsent(working)}
            className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Salva preferenze
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Accetta tutti
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Rifiuta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
