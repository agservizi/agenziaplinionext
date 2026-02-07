import { CONSENT_POLICY_VERSION } from "@/lib/consent";

export const cookieCategories = [
  {
    key: "necessary",
    label: "Cookie tecnici",
    description:
      "Necessari per il corretto funzionamento del sito e non disattivabili.",
  },
  {
    key: "preferences",
    label: "Cookie di preferenza",
    description:
      "Memorizzano scelte e preferenze per migliorare l’esperienza utente.",
  },
  {
    key: "analytics",
    label: "Cookie statistici / analytics",
    description:
      "Utilizzati per analizzare l’utilizzo del sito e migliorare i contenuti.",
  },
  {
    key: "marketing",
    label: "Cookie di marketing / profilazione",
    description:
      "Usati per personalizzare contenuti e misurare campagne marketing.",
  },
] as const;

export const cookiePolicy = {
  version: CONSENT_POLICY_VERSION,
  lastUpdated: "2026-02-06",
  cookies: [
    {
      name: "ag_consent",
      purpose: "Memorizza le preferenze di consenso cookie.",
      duration: "6 mesi",
      provider: "AG SERVIZI",
      category: "necessary",
    },
  ],
};
