"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import CookieBanner from "@/components/cookies/CookieBanner";
import CookiePreferencesModal from "@/components/cookies/CookiePreferencesModal";
import ConsentScripts from "@/components/cookies/ConsentScripts";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_DAYS,
  CONSENT_POLICY_VERSION,
  ConsentState,
  defaultConsent,
} from "@/lib/consent";

const ConsentContext = createContext<{
  consent: ConsentState | null;
  openPreferences: () => void;
  closePreferences: () => void;
  saveConsent: (next: ConsentState) => Promise<void>;
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
  preferencesOpen: boolean;
} | null>(null);

function parseConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const json = decodeURIComponent(match.split("=")[1] || "");
    return JSON.parse(json) as ConsentState;
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: ConsentState) {
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(consent),
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function updateConsentMode(consent: ConsentState) {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (!gtag) return;
  gtag("consent", "update", {
    ad_storage: consent.marketing ? "granted" : "denied",
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const existing = parseConsentCookie();
    if (existing) {
      setConsent(existing);
      updateConsentMode(existing);
    } else {
      setConsent(null);
    }
  }, []);

  const saveConsent = async (next: ConsentState) => {
    const payload = {
      ...next,
      version: CONSENT_POLICY_VERSION,
      updatedAt: new Date().toISOString(),
    } satisfies ConsentState;
    setConsent(payload);
    writeConsentCookie(payload);
    updateConsentMode(payload);

    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  };

  const acceptAll = () =>
    saveConsent({
      ...defaultConsent,
      preferences: true,
      analytics: true,
      marketing: true,
    });

  const rejectAll = () =>
    saveConsent({
      ...defaultConsent,
      preferences: false,
      analytics: false,
      marketing: false,
    });

  const value = useMemo(
    () => ({
      consent,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      saveConsent,
      acceptAll,
      rejectAll,
      preferencesOpen,
    }),
    [consent, preferencesOpen],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      <ConsentScripts />
      <CookieBanner />
      <CookiePreferencesModal />
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return context;
}
