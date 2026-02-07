export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type ConsentState = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  updatedAt: string;
};

export const CONSENT_COOKIE_NAME = "ag_consent";
export const CONSENT_POLICY_VERSION = "1.0";
export const CONSENT_MAX_AGE_DAYS = 180;

export const defaultConsent: ConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
  version: CONSENT_POLICY_VERSION,
  updatedAt: new Date(0).toISOString(),
};
