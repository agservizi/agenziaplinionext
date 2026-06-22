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
      "Ricordano le tue scelte (es. lingua, impostazioni) per non doverle ripetere.",
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
