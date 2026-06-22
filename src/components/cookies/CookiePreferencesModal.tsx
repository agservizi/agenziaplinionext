"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cookieCategories } from "@/lib/cookies";
import { ConsentState, defaultConsent } from "@/lib/consent";
import { useConsent } from "@/components/cookies/ConsentProvider";

const ICONS: Record<string, React.ReactNode> = {
  necessary: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  preferences: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
};

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

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closePreferences();
  }, [closePreferences]);

  useEffect(() => {
    if (preferencesOpen) { setDraft(current); return; }
    setDraft(null);
  }, [current, preferencesOpen]);

  useEffect(() => {
    if (!preferencesOpen) return;
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [preferencesOpen, handleEscapeKey]);

  if (!preferencesOpen) return null;

  const working = draft ?? current;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closePreferences} />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5E0ED7]/10">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5E0ED7]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5" />
                <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
                <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>Preferenze cookie</p>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:text-slate-700"
            aria-label="Chiudi"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Categories */}
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
          <div className="space-y-2.5">
            {cookieCategories.map((category) => {
              const key = category.key as keyof ConsentState;
              const isNecessary = category.key === "necessary";
              const value = working[key] as boolean;
              const icon = ICONS[category.key] || ICONS.preferences;

              return (
                <div
                  key={category.key}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    isNecessary
                      ? "border-slate-100 bg-slate-50/50"
                      : value
                        ? "border-[#5E0ED7]/20 bg-[#5E0ED7]/4"
                        : "border-slate-100 bg-white"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isNecessary ? "bg-slate-200/60 text-slate-500" : value ? "bg-[#5E0ED7]/10 text-[#5E0ED7]" : "bg-slate-100 text-slate-400"
                  }`}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>{category.label}</p>
                    <p className="text-[11px] leading-relaxed text-slate-600">{category.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isNecessary}
                    onClick={() => setDraft({ ...working, [key]: isNecessary ? true : !value })}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                      isNecessary
                        ? "cursor-not-allowed bg-slate-200"
                        : value
                          ? "cursor-pointer bg-[#5E0ED7]"
                          : "cursor-pointer bg-slate-200"
                    }`}
                    aria-label={isNecessary ? "Sempre attivi" : value ? "Disattiva" : "Attiva"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        value || isNecessary ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={async () => { await saveConsent(working); closePreferences(); }}
            className="flex-1 rounded-lg bg-[#5E0ED7] py-2.5 text-xs font-semibold text-white transition hover:bg-[#4a0bab]"
          >
            Salva
          </button>
          <button
            type="button"
            onClick={async () => { await acceptAll(); closePreferences(); }}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold transition hover:bg-slate-50"
            style={{ color: "#0f172a" }}
          >
            Accetta tutti
          </button>
          <button
            type="button"
            onClick={async () => { await rejectAll(); closePreferences(); }}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            Rifiuta
          </button>
        </div>
      </div>
    </div>
  );
}
