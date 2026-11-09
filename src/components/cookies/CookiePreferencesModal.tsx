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
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[var(--ink)]/45" onClick={closePreferences} />

      <div className="relative w-full max-w-md border border-[var(--ink)]/15 bg-[var(--paper)] text-[var(--ink)] shadow-[-24px_0_60px_rgba(11,17,32,0.12)]">
        <div className="flex items-center justify-between border-b border-[var(--ink)]/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[var(--ink)]/15 text-[#5E0ED7]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5" />
                <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
                <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/40">
                Privacy
              </p>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--ink)]">
                Preferenze cookie
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            className="flex h-9 w-9 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
            aria-label="Chiudi"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
          <div className="space-y-2">
            {cookieCategories.map((category) => {
              const key = category.key as keyof ConsentState;
              const isNecessary = category.key === "necessary";
              const value = working[key] as boolean;
              const icon = ICONS[category.key] || ICONS.preferences;

              return (
                <div
                  key={category.key}
                  className={`flex items-center gap-3 border p-3 transition ${
                    isNecessary
                      ? "border-[var(--ink)]/10 bg-[color-mix(in_srgb,var(--paper)_88%,white)]"
                      : value
                        ? "border-[#5E0ED7]/35 bg-[color-mix(in_srgb,var(--paper)_92%,#5E0ED7)]"
                        : "border-[var(--ink)]/10 bg-[var(--paper)]"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                      isNecessary
                        ? "border-[var(--ink)]/10 text-[var(--ink)]/40"
                        : value
                          ? "border-[#5E0ED7]/30 text-[#5E0ED7]"
                          : "border-[var(--ink)]/10 text-[var(--ink)]/35"
                    }`}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--ink)]">
                      {category.label}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--ink)]/55">
                      {category.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isNecessary}
                    onClick={() => setDraft({ ...working, [key]: isNecessary ? true : !value })}
                    className={`relative inline-flex h-6 w-11 shrink-0 border transition-colors ${
                      isNecessary
                        ? "cursor-not-allowed border-[var(--ink)]/15 bg-[var(--ink)]/15"
                        : value
                          ? "cursor-pointer border-[var(--ink)] bg-[var(--ink)]"
                          : "cursor-pointer border-[var(--ink)]/20 bg-transparent"
                    }`}
                    aria-label={isNecessary ? "Sempre attivi" : value ? "Disattiva" : "Attiva"}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 transition-all ${
                        value || isNecessary
                          ? "right-0.5 bg-[var(--paper)]"
                          : "left-0.5 bg-[var(--ink)]/35"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 border-t border-[var(--ink)]/10 px-5 py-4">
          <button
            type="button"
            onClick={async () => { await saveConsent(working); closePreferences(); }}
            className="brutal-cta-ink flex-1 bg-[var(--ink)] py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#5E0ED7]"
          >
            Salva
          </button>
          <button
            type="button"
            onClick={async () => { await acceptAll(); closePreferences(); }}
            className="flex-1 border border-[var(--ink)]/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Accetta tutti
          </button>
          <button
            type="button"
            onClick={async () => { await rejectAll(); closePreferences(); }}
            className="flex-1 border border-[var(--ink)]/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]/45 transition hover:border-[#5E0ED7] hover:text-[#5E0ED7]"
          >
            Rifiuta
          </button>
        </div>
      </div>
    </div>
  );
}
