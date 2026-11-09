/**
 * Fact-forcing: CookiePreferencesModal + cookie-policy page.
 * Preferences copy now covers remote Spline 3D gated by consent.
 * User: "procedi su tutto al 100% … chiudiamo questo GAP".
 */
import { CONSENT_POLICY_VERSION } from "@/lib/consent";

export const cookieCategories = [
  {
    key: "necessary",
    label: "Cookie tecnici",
    description:
      "Servono a far funzionare il sito. Non si possono disattivare.",
  },
  {
    key: "preferences",
    label: "Cookie di preferenza",
    description:
      "Ricordano le tue scelte e abilitano contenuti avanzati opzionali (es. scena 3D da fornitore esterno solo dopo il consenso).",
  },
  {
    key: "analytics",
    label: "Cookie statistici / analytics",
    description:
      "Ci dicono quante persone visitano il sito e quali pagine guardano di piu.",
  },
  {
    key: "marketing",
    label: "Cookie di marketing / profilazione",
    description:
      "Servono a mostrarti contenuti e annunci piu rilevanti per te.",
  },
] as const;

export const cookiePolicy = {
  version: CONSENT_POLICY_VERSION,
  lastUpdated: "2026-11-08",
  cookies: [
    {
      name: "ag_consent",
      purpose: "Memorizza le preferenze di consenso cookie.",
      duration: "6 mesi",
      provider: "AG SERVIZI",
      category: "necessary",
    },
  ],
  thirdPartyOptional: [
    {
      name: "Spline (scena 3D)",
      purpose:
        "Carica una scena 3D da prod.spline.design solo se accetti i cookie di preferenza.",
      provider: "Spline / prod.spline.design",
      category: "preferences",
    },
    {
      name: "Google Analytics (gtag)",
      purpose: "Statistiche di navigazione anonimizzate, solo con consenso analytics.",
      provider: "Google",
      category: "analytics",
    },
  ],
};
