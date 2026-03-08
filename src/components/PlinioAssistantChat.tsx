"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clientFallbackReply,
  detectConversationScope,
  includesAny,
  normalize,
} from "@/lib/plinio-chat-fallback.mjs";
import {
  fetchPublicShippingPricing,
  type PublicShippingPricingRule,
} from "@/lib/shipping-pricing";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type PlinioAssistantChatProps = {
  pathname: string;
};

type TrackingCarrier = "BRT" | "Poste Italiane" | "SDA" | "TNT/FedEx";
type ShippingScope = "national" | "international";
type UtilityServiceType = "luce" | "gas";
type TelephonyLineType = "mobile" | "casa" | "mobile-casa";
const HOURS_WHATSAPP_PHONE = "393773798570";
const HOURS_WHATSAPP_TEXT =
  "Ciao, vorrei conferma sugli orari di apertura.";
const MAPS_PLACE_QUERY = "AG SERVIZI VIA PLINIO 72 DI CAVALIERE CARMINE";
const SHIPPING_COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "IT", label: "Italia" },
  { code: "AT", label: "Austria" },
  { code: "BE", label: "Belgio" },
  { code: "BG", label: "Bulgaria" },
  { code: "HR", label: "Croazia" },
  { code: "CZ", label: "Repubblica Ceca" },
  { code: "DK", label: "Danimarca" },
  { code: "EE", label: "Estonia" },
  { code: "FI", label: "Finlandia" },
  { code: "FR", label: "Francia" },
  { code: "DE", label: "Germania" },
  { code: "GB", label: "Regno Unito" },
  { code: "GR", label: "Grecia" },
  { code: "HU", label: "Ungheria" },
  { code: "IE", label: "Irlanda" },
  { code: "LV", label: "Lettonia" },
  { code: "LT", label: "Lituania" },
  { code: "LU", label: "Lussemburgo" },
  { code: "NL", label: "Paesi Bassi" },
  { code: "NO", label: "Norvegia" },
  { code: "PL", label: "Polonia" },
  { code: "PT", label: "Portogallo" },
  { code: "RO", label: "Romania" },
  { code: "SK", label: "Slovacchia" },
  { code: "SI", label: "Slovenia" },
  { code: "ES", label: "Spagna" },
  { code: "SE", label: "Svezia" },
  { code: "CH", label: "Svizzera" },
  { code: "BA", label: "Bosnia ed Erzegovina" },
  { code: "RS", label: "Serbia" },
];

type AssistantPayload = {
  message?: string;
  suggested_prompts?: string[];
  focus_scope?: string | null;
  intents?: string[];
  handoff_recommended?: boolean;
};

const QUICK_PROMPT_POOL = [
  "Come faccio ad attivare lo SPID?",
  "Che documenti servono per la PEC?",
  "Mi aiuti a scegliere tra WindTre, Fastweb e Iliad?",
  "Fate attivazioni luce e gas?",
  "Fate pagamenti pagoPA, F24 o bollettini?",
  "Cosa serve per una spedizione nazionale?",
  "Cosa serve per una spedizione internazionale?",
  "Traccia una spedizione",
  "Dove vi trovate?",
  "Quali sono gli orari?",
  "Posso parlare con un operatore?",
  "Come funziona la firma digitale?",
];

const QUICK_PROMPTS_VISIBLE = 4;
const ATTENTION_TOOLTIPS = [
  "Ti aiuto a scegliere il servizio giusto",
  "Posso tracciare la tua spedizione qui",
  "Hai bisogno di SPID o PEC?",
];
const CHAT_IDLE_AUTO_CLOSE_MS = 90_000;
const CHAT_IDLE_NUDGE_MS = 30_000;
const CHAT_IDLE_NUDGE_MESSAGES = ["Ci sei ancora?", "Sei ancora qui?"];
const BOT_MICRO_CTA_REAPPEAR_IDLE_MS = 10_000;
const BOT_MICRO_CTA_STATE_STORAGE_KEY = "plinio:micro-cta:dismissed";
const BOT_MICRO_CTA_EVENT = "plinio:micro-cta:state";

function rotateQuickPrompts(pool: string[], offset: number, size: number) {
  if (pool.length === 0 || size <= 0) return [];
  const start = ((offset % pool.length) + pool.length) % pool.length;
  const max = Math.min(size, pool.length);
  return Array.from({ length: max }, (_, index) => pool[(start + index) % pool.length]);
}

function buildAssistantEndpoint() {
  if (typeof window === "undefined") return "/api/public/plinio-assistant";
  return `${window.location.origin}/api/public/plinio-assistant`;
}

function buildHoursWhatsappLink() {
  return `https://wa.me/${HOURS_WHATSAPP_PHONE}?text=${encodeURIComponent(HOURS_WHATSAPP_TEXT)}`;
}

function buildGoogleMapsLink() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_PLACE_QUERY)}`;
}

export default function PlinioAssistantChat({ pathname }: PlinioAssistantChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickPromptOffset, setQuickPromptOffset] = useState(0);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [showShippingQuoteForm, setShowShippingQuoteForm] = useState(false);
  const [showUtilityEstimateForm, setShowUtilityEstimateForm] = useState(false);
  const [showTelephonyAuditForm, setShowTelephonyAuditForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [trackingCarrier, setTrackingCarrier] = useState<TrackingCarrier>("BRT");
  const [trackingCode, setTrackingCode] = useState("");
  const [shippingScope, setShippingScope] = useState<ShippingScope>("national");
  const [shippingCountry, setShippingCountry] = useState("IT");
  const [shippingWeightKG, setShippingWeightKG] = useState("");
  const [shippingLengthCM, setShippingLengthCM] = useState("");
  const [shippingWidthCM, setShippingWidthCM] = useState("");
  const [shippingHeightCM, setShippingHeightCM] = useState("");
  const [shippingPricingRules, setShippingPricingRules] = useState<PublicShippingPricingRule[]>([]);
  const [shippingPricingLoading, setShippingPricingLoading] = useState(false);
  const [utilityServiceType, setUtilityServiceType] = useState<UtilityServiceType>("luce");
  const [utilityMonthlySpend, setUtilityMonthlySpend] = useState("");
  const [utilityAnnualKwh, setUtilityAnnualKwh] = useState("");
  const [utilityAnnualSmc, setUtilityAnnualSmc] = useState("");
  const [utilityContractType, setUtilityContractType] = useState("residenziale");
  const [telephonyLineType, setTelephonyLineType] = useState<TelephonyLineType>("mobile");
  const [telephonyMobileSpend, setTelephonyMobileSpend] = useState("");
  const [telephonyHomeSpend, setTelephonyHomeSpend] = useState("");
  const [telephonyDataGB, setTelephonyDataGB] = useState("");
  const [telephonyMinutes, setTelephonyMinutes] = useState("");
  const [telephonyHomeSpeedMbps, setTelephonyHomeSpeedMbps] = useState("");
  const [telephonyPortability, setTelephonyPortability] = useState("si");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactService, setContactService] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [serverPrompts, setServerPrompts] = useState<string[]>([]);
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [microCtaDismissed, setMicroCtaDismissed] = useState(false);
  const [lastActivityAt, setLastActivityAt] = useState(() => Date.now());
  const [lastUserActionAt, setLastUserActionAt] = useState(() => Date.now());
  const [idleNudgeSent, setIdleNudgeSent] = useState(false);
  const [idleNudgeIndex, setIdleNudgeIndex] = useState(0);
  const [unreadBadgeCount, setUnreadBadgeCount] = useState(0);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ciao, sono Plinio Assistant. Posso aiutarti su pagamenti, SPID/PEC, telefonia, spedizioni e altri servizi AG Servizi.",
    },
  ]);
  const endpoint = useMemo(buildAssistantEndpoint, []);

  const visibleMessages = useMemo(() => messages.slice(-12), [messages]);
  const quickPrompts = useMemo(
    () => rotateQuickPrompts(QUICK_PROMPT_POOL, quickPromptOffset, QUICK_PROMPTS_VISIBLE),
    [quickPromptOffset],
  );
  const promptsForUi = serverPrompts.length > 0 ? serverPrompts.slice(0, QUICK_PROMPTS_VISIBLE) : quickPrompts;

  useEffect(() => {
    if (QUICK_PROMPT_POOL.length === 0) return;
    const seed = Math.floor(Date.now() / 1000) % QUICK_PROMPT_POOL.length;
    setQuickPromptOffset(seed);
  }, []);

  useEffect(() => {
    if (!open || QUICK_PROMPT_POOL.length === 0) return;
    setQuickPromptOffset((prev) => (prev + QUICK_PROMPTS_VISIBLE) % QUICK_PROMPT_POOL.length);
  }, [open]);

  useEffect(() => {
    if (utilityServiceType === "luce") {
      setUtilityAnnualSmc("");
      return;
    }
    setUtilityAnnualKwh("");
  }, [utilityServiceType]);

  useEffect(() => {
    if (open || ATTENTION_TOOLTIPS.length <= 1) return;
    const interval = window.setInterval(() => {
      setTooltipIndex((prev) => (prev + 1) % ATTENTION_TOOLTIPS.length);
    }, 9000);
    return () => window.clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedDismissed = window.localStorage.getItem(BOT_MICRO_CTA_STATE_STORAGE_KEY) === "1";
    if (storedDismissed) {
      setMicroCtaDismissed(true);
    }

    const onActivity = () => setLastActivityAt(Date.now());
    const onSharedState = (event: Event) => {
      const customEvent = event as CustomEvent<{ dismissed?: boolean }>;
      setMicroCtaDismissed(Boolean(customEvent.detail?.dismissed));
    };
    const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });
    window.addEventListener(BOT_MICRO_CTA_EVENT, onSharedState as EventListener);
    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      window.removeEventListener(BOT_MICRO_CTA_EVENT, onSharedState as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!microCtaDismissed || open) return;
    const inactivityMs = Date.now() - lastActivityAt;
    if (inactivityMs >= BOT_MICRO_CTA_REAPPEAR_IDLE_MS) {
      setMicroCtaDismissed(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(BOT_MICRO_CTA_STATE_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(BOT_MICRO_CTA_EVENT, { detail: { dismissed: false } }));
      }
      return;
    }
    const timer = window.setTimeout(
      () => {
        setMicroCtaDismissed(false);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(BOT_MICRO_CTA_STATE_STORAGE_KEY);
          window.dispatchEvent(new CustomEvent(BOT_MICRO_CTA_EVENT, { detail: { dismissed: false } }));
        }
      },
      BOT_MICRO_CTA_REAPPEAR_IDLE_MS - inactivityMs,
    );
    return () => window.clearTimeout(timer);
  }, [lastActivityAt, microCtaDismissed, open]);

  useEffect(() => {
    if (!open) return;
    const viewport = messagesViewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" });
    }
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [open, messages, loading]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!open) return;
    clearInactivityTimer();
    inactivityTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, CHAT_IDLE_AUTO_CLOSE_MS);
  }, [clearInactivityTimer, open]);

  useEffect(() => {
    if (!open) {
      clearInactivityTimer();
      return;
    }

    resetInactivityTimer();

    return () => {
      clearInactivityTimer();
    };
  }, [clearInactivityTimer, open, resetInactivityTimer]);

  useEffect(() => {
    if (open || loading || idleNudgeSent) return;
    const elapsed = Date.now() - lastUserActionAt;
    const remaining = Math.max(0, CHAT_IDLE_NUDGE_MS - elapsed);
    const timer = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: CHAT_IDLE_NUDGE_MESSAGES[idleNudgeIndex % CHAT_IDLE_NUDGE_MESSAGES.length],
        },
      ]);
      setUnreadBadgeCount((prev) => prev + 1);
      setIdleNudgeIndex((prev) => (prev + 1) % CHAT_IDLE_NUDGE_MESSAGES.length);
      setIdleNudgeSent(true);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [idleNudgeIndex, idleNudgeSent, lastUserActionAt, loading, open]);

  useEffect(() => {
    if (open) {
      setUnreadBadgeCount(0);
      setIdleNudgeSent(false);
    }
  }, [open]);

  function isTrackingIntent(text: string) {
    const q = normalize(text);
    return includesAny(q, ["tracking", "traccia", "tracci", "stato spedizione", "pacco"]);
  }

  function isShippingQuoteIntent(text: string) {
    const q = normalize(text);
    const asksQuote = includesAny(q, [
      "preventivo",
      "stima",
      "quanto costa spedire",
      "costo spedizione",
      "prezzo spedizione",
      "quanto viene spedire",
    ]);
    const shippingContext = includesAny(q, ["spedizion", "pacco", "corriere", "nazionale", "internazionale"]);
    return asksQuote && shippingContext;
  }

  function isUtilityEstimateIntent(text: string) {
    const q = normalize(text);
    const asksEstimate = includesAny(q, ["stima", "preventivo", "analisi", "consiglio"]);
    const utilityContext = includesAny(q, [
      "bolletta",
      "luce",
      "gas",
      "energia",
      "pod",
      "pdr",
      "consumi",
    ]);
    return asksEstimate && utilityContext;
  }

  function isTelephonyAuditIntent(text: string) {
    const q = normalize(text);
    const asksAudit = includesAny(q, ["audit", "analisi", "consiglio", "confronto", "confrontare", "ottimizzare"]);
    const phoneContext = includesAny(q, [
      "telefonia",
      "mobile",
      "sim",
      "fibra",
      "portabilita",
      "windtre",
      "fastweb",
      "iliad",
      "operatore",
      "gestore",
    ]);
    return asksAudit && phoneContext;
  }

  function maybeOpenTrackingFormFromText(text: string) {
    if (isTrackingIntent(text)) {
      setShowTrackingForm(true);
    }
  }

  function maybeOpenShippingQuoteFormFromText(text: string) {
    if (isShippingQuoteIntent(text)) {
      setShowShippingQuoteForm(true);
    }
  }

  function maybeOpenUtilityEstimateFormFromText(text: string) {
    if (isUtilityEstimateIntent(text)) {
      setShowUtilityEstimateForm(true);
    }
  }

  function maybeOpenTelephonyAuditFormFromText(text: string) {
    if (isTelephonyAuditIntent(text)) {
      setShowTelephonyAuditForm(true);
    }
  }

  function isOperatorIntent(text: string) {
    const q = normalize(text);
    return includesAny(q, [
      "parlare con un operatore",
      "parlare con operatore",
      "operatore umano",
      "assistenza umana",
      "richiamami",
      "ricontattami",
      "voglio essere contattato",
    ]);
  }

  function maybeOpenContactFormFromText(text: string) {
    const q = normalize(text);
    if (
      isOperatorIntent(text) ||
      (q.includes("farti richiamare") && q.includes("nome")) ||
      (q.includes("dati di contatto") && q.includes("telefono")) ||
      q.includes("modulo contatto")
    ) {
      setShowContactForm(true);
    }
  }

  async function ensureShippingPricingLoaded() {
    if (shippingPricingRules.length > 0) return shippingPricingRules;
    if (shippingPricingLoading) return shippingPricingRules;
    setShippingPricingLoading(true);
    try {
      const rules = await fetchPublicShippingPricing();
      const normalized = Array.isArray(rules) ? rules : [];
      setShippingPricingRules(normalized);
      return normalized;
    } catch {
      setShippingPricingRules([]);
      return [];
    } finally {
      setShippingPricingLoading(false);
    }
  }

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    const currentScope = detectConversationScope(nextMessages, trimmed);
    const isShortConfirmation = includesAny(trimmed, [
      "si",
      "sì",
      "ok",
      "va bene",
      "procedi",
      "continua",
      "certo",
      "ci sono",
      "sono qui",
      "eccomi",
      "presente",
    ]);
    const lastAssistantMessage = messages.at(-1);
    const isReplyToIdleNudge =
      lastAssistantMessage?.role === "assistant" &&
      CHAT_IDLE_NUDGE_MESSAGES.some(
        (item) => normalize(item) === normalize(lastAssistantMessage.content || ""),
      ) &&
      isShortConfirmation;
    setLastUserActionAt(Date.now());
    setIdleNudgeSent(false);
    setMessages(nextMessages);
    setInput("");
    maybeOpenTrackingFormFromText(trimmed);
    maybeOpenShippingQuoteFormFromText(trimmed);
    maybeOpenUtilityEstimateFormFromText(trimmed);
    maybeOpenTelephonyAuditFormFromText(trimmed);
    maybeOpenContactFormFromText(trimmed);
    if (isReplyToIdleNudge) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perfetto, eccomi. Dimmi pure quale servizio ti serve e ti guido subito (es. telefonia, SPID, PEC, pagamenti, spedizioni).",
        },
      ]);
      return;
    }
    if (currentScope === "telefonia" && isShortConfirmation) {
      setShowTelephonyAuditForm(true);
    }
    if (QUICK_PROMPT_POOL.length > 0) {
      setQuickPromptOffset((prev) => (prev + 1) % QUICK_PROMPT_POOL.length);
    }
    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          messages: nextMessages.slice(-10),
        }),
      });
      const rawText = await response.text();
      let payload: AssistantPayload = {};
      try {
        payload = JSON.parse(rawText) as AssistantPayload;
      } catch {
        payload = {};
      }

      const reply = payload.message?.trim() || clientFallbackReply(trimmed, nextMessages);
      const nextPrompts = Array.isArray(payload.suggested_prompts)
        ? payload.suggested_prompts
            .map((item) => (typeof item === "string" ? item.trim() : ""))
            .filter((item) => item !== "")
        : [];
      if (nextPrompts.length > 0) {
        setServerPrompts(Array.from(new Set(nextPrompts)).slice(0, QUICK_PROMPTS_VISIBLE));
      }
      maybeOpenTrackingFormFromText(reply);
      maybeOpenShippingQuoteFormFromText(reply);
      maybeOpenUtilityEstimateFormFromText(reply);
      maybeOpenTelephonyAuditFormFromText(reply);
      maybeOpenContactFormFromText(reply);
      if (payload.handoff_recommended) {
        setShowContactForm(true);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: clientFallbackReply(trimmed, nextMessages),
        },
      ]);
      maybeOpenTrackingFormFromText(trimmed);
      maybeOpenShippingQuoteFormFromText(trimmed);
      maybeOpenUtilityEstimateFormFromText(trimmed);
      maybeOpenTelephonyAuditFormFromText(trimmed);
      maybeOpenContactFormFromText(trimmed);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function onTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = trackingCode.trim().toUpperCase();
    if (!code) return;
    void sendMessage(`Traccia ${trackingCarrier} ${code}`);
    setTrackingCode("");
  }

  async function onShippingQuoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weight = Number.parseFloat(shippingWeightKG.replace(",", "."));
    const length = Number.parseFloat(shippingLengthCM.replace(",", "."));
    const width = Number.parseFloat(shippingWidthCM.replace(",", "."));
    const height = Number.parseFloat(shippingHeightCM.replace(",", "."));

    if (!Number.isFinite(weight) || weight <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Per il preventivo indicativo inserisci un peso valido in KG.",
        },
      ]);
      return;
    }

    if (![length, width, height].every((n) => Number.isFinite(n) && n > 0)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Per il preventivo indicativo inserisci tutte le misure in cm (lunghezza, larghezza, altezza).",
        },
      ]);
      return;
    }

    const pricingRules = await ensureShippingPricingLoaded();
    const volumeM3 = (length * width * height) / 1_000_000;
    const destinationCountry = shippingScope === "national" ? "IT" : shippingCountry.trim().toUpperCase();

    const activeRules = pricingRules.filter((rule) => rule.active);
    const scopedRules = activeRules.filter((rule) => {
      const scope = String(rule.serviceScope || "all").toLowerCase();
      return scope === shippingScope || scope === "all";
    });

    const countryScopedRules =
      shippingScope === "international"
        ? scopedRules.filter((rule) => {
            const code = String(rule.countryCode || "").trim().toUpperCase();
            return code === destinationCountry || code === "" || code === "ALL";
          })
        : scopedRules;

    const matchesWeight = (rule: PublicShippingPricingRule) => {
      const minW = Number(rule.minWeightKG || 0);
      const maxW = Number(rule.maxWeightKG || 0);
      return weight >= minW && (maxW <= 0 || weight <= maxW);
    };

    const matchesVolume = (rule: PublicShippingPricingRule) => {
      const minW = Number(rule.minWeightKG || 0);
      const maxW = Number(rule.maxWeightKG || 0);
      const minV = Number(rule.minVolumeM3 || 0);
      const maxV = Number(rule.maxVolumeM3 || 0);
      const weightMatches = weight >= minW && (maxW <= 0 || weight <= maxW);
      const volumeMatches = volumeM3 >= minV && (maxV <= 0 || volumeM3 <= maxV);
      return weightMatches && volumeMatches;
    };

    // Matching strategy:
    // 1) scope+country with weight+volume
    // 2) scope+country with weight only
    // 3) scope (ignoring country) with weight only
    // 4) any active rule with weight only
    const matchedRuleByWeightAndVolume = countryScopedRules.find(matchesVolume);
    const matchedRuleByWeightCountry = countryScopedRules.find(matchesWeight);
    const matchedRuleByWeightScope = scopedRules.find(matchesWeight);
    const matchedRuleByWeightAny = activeRules.find(matchesWeight);

    const matchedRule =
      matchedRuleByWeightAndVolume ||
      matchedRuleByWeightCountry ||
      matchedRuleByWeightScope ||
      matchedRuleByWeightAny;
    let usedWeightOnlyFallback = false;
    if (matchedRule && !matchedRuleByWeightAndVolume) usedWeightOnlyFallback = true;

    if (!matchedRule) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "In base ai dati inseriti non trovo una fascia attiva nel listino. Per peso/volume extra ti invitiamo a portare il pacco in agenzia per un preventivo personalizzato.",
        },
      ]);
      return;
    }

    const scopeLabel = shippingScope === "national" ? "nazionale" : `internazionale (${destinationCountry})`;
    const estimate = Number(matchedRule.priceEUR || 0).toFixed(2).replace(".", ",");
    const fallbackNote = usedWeightOnlyFallback
      ? " Ho usato la fascia peso (kg) perché il volume non rientrava in una fascia attiva."
      : "";
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Preventivo indicativo spedizione ${scopeLabel}: € ${estimate} (${matchedRule.label || "fascia listino"}).${fallbackNote} Stima non vincolante, conferma finale in fase operativa.`,
      },
    ]);
  }

  function onUtilityEstimateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const monthlySpend = Number.parseFloat(utilityMonthlySpend.replace(",", "."));
    const annualKwh =
      utilityServiceType === "luce"
        ? Number.parseFloat(utilityAnnualKwh.replace(",", "."))
        : Number.NaN;
    const annualSmc =
      utilityServiceType === "gas"
        ? Number.parseFloat(utilityAnnualSmc.replace(",", "."))
        : Number.NaN;

    if (!Number.isFinite(monthlySpend) || monthlySpend <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Per la stima bolletta inserisci una spesa mensile valida in euro.",
        },
      ]);
      return;
    }

    const annualSpend = monthlySpend * 12;
    const lowSaving = annualSpend * 0.08;
    const highSaving = annualSpend * 0.18;
    const format = (value: number) => value.toFixed(0).replace(".", ",");
    const consumptionHint: string[] = [];
    if (utilityServiceType === "luce" && Number.isFinite(annualKwh) && annualKwh > 0) {
      consumptionHint.push(`consumo luce ${format(annualKwh)} kWh/anno`);
    }
    if (utilityServiceType === "gas" && Number.isFinite(annualSmc) && annualSmc > 0) {
      consumptionHint.push(`consumo gas ${format(annualSmc)} Smc/anno`);
    }
    const serviceLabel = utilityServiceType === "luce" ? "luce" : "gas";
    const consumptionText =
      consumptionHint.length > 0 ? ` Ho considerato ${consumptionHint.join(" e ")}.` : "";
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Stima indicativa ${serviceLabel} (${utilityContractType}): spesa annua circa € ${format(annualSpend)}.${consumptionText} Potenziale ottimizzazione: circa € ${format(lowSaving)} - € ${format(highSaving)} annui. Stima non vincolante: per conferma finale serve analisi completa della bolletta.`,
      },
    ]);
  }

  function onTelephonyAuditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mobileSpend = Number.parseFloat(telephonyMobileSpend.replace(",", "."));
    const homeSpend = Number.parseFloat(telephonyHomeSpend.replace(",", "."));
    const dataGB = Number.parseFloat(telephonyDataGB.replace(",", "."));
    const minutes = Number.parseFloat(telephonyMinutes.replace(",", "."));
    const homeSpeedMbps = Number.parseFloat(telephonyHomeSpeedMbps.replace(",", "."));

    const monthlySpend =
      telephonyLineType === "mobile"
        ? mobileSpend
        : telephonyLineType === "casa"
          ? homeSpend
          : (Number.isFinite(mobileSpend) ? mobileSpend : 0) + (Number.isFinite(homeSpend) ? homeSpend : 0);

    if (!Number.isFinite(monthlySpend) || monthlySpend <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            telephonyLineType === "mobile"
              ? "Per il controllo mobile inserisci una spesa mensile valida."
              : telephonyLineType === "casa"
                ? "Per il controllo internet casa inserisci una spesa mensile valida."
                : "Per il controllo mobile + casa inserisci una spesa valida per almeno una delle due linee.",
        },
      ]);
      return;
    }

    let recommendedBudgetMin = monthlySpend * 0.82;
    let recommendedBudgetMax = monthlySpend * 0.95;
    let profile = "profilo standard";
    if (telephonyLineType === "mobile") {
      recommendedBudgetMin = 4.99;
      recommendedBudgetMax = 9.99;
      profile =
        Number.isFinite(dataGB) && dataGB >= 150
          ? "profilo uso dati intenso"
          : Number.isFinite(dataGB) && dataGB >= 70
            ? "profilo uso dati medio"
            : "profilo uso dati leggero";
    } else if (telephonyLineType === "casa") {
      recommendedBudgetMin = 22.99;
      recommendedBudgetMax = 29.99;
      profile =
        Number.isFinite(homeSpeedMbps) && homeSpeedMbps >= 1000
          ? "profilo fibra alta velocita"
          : Number.isFinite(homeSpeedMbps) && homeSpeedMbps >= 200
            ? "profilo fibra medio-alta"
            : "profilo casa base";
    } else {
      recommendedBudgetMin = Math.max(24.9, monthlySpend * 0.76);
      recommendedBudgetMax = Math.max(recommendedBudgetMin, monthlySpend * 0.9);
      profile = "profilo combinato mobile + casa";
    }
    const format = (value: number) => value.toFixed(2).replace(".", ",");
    const lineLabel =
      telephonyLineType === "mobile" ? "mobile" : telephonyLineType === "casa" ? "internet casa" : "mobile + casa";
    const minutesText =
      telephonyLineType !== "casa" && Number.isFinite(minutes) && minutes > 0
        ? `, minuti/mese ~${Math.round(minutes)}`
        : "";
    const portabilityText =
      telephonyPortability === "si"
        ? telephonyLineType === "casa"
          ? " Con migrazione linea servono dati linea attuale e codice migrazione."
          : telephonyLineType === "mobile-casa"
            ? " Con portabilità/migrazione servono numero da migrare, ICCID SIM e dati linea casa."
            : " Con portabilità servono numero da migrare e ICCID SIM."
        : "";
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Controllo offerta telefonia (${lineLabel}): ${profile}${minutesText}. Budget target indicativo: € ${format(recommendedBudgetMin)} - € ${format(recommendedBudgetMax)}/mese rispetto all'attuale. Possiamo confrontare le opzioni WindTre, Fastweb e Iliad in base a copertura e utilizzo reale.${portabilityText} Stima indicativa, conferma finale con verifica commerciale.`,
      },
    ]);
  }

  function onQuickAction(prompt: string) {
    setOpen(true);
    setMicroCtaDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BOT_MICRO_CTA_STATE_STORAGE_KEY, "1");
      window.dispatchEvent(new CustomEvent(BOT_MICRO_CTA_EVENT, { detail: { dismissed: true } }));
    }
    void sendMessage(prompt);
  }

  function onContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = contactName.trim();
    const phone = contactPhone.trim();
    const email = contactEmail.trim();
    const service = contactService.trim();
    const notes = contactNotes.trim();

    if (name === "" || (phone === "" && email === "")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Per inviare la richiesta contatto inserisci almeno nome e telefono oppure email.",
        },
      ]);
      return;
    }

    const message = `Richiamami. Nome: ${name}. Telefono: ${phone || "n/d"}. Email: ${email || "n/d"}. Servizio: ${service || "generico"}. Note: ${notes || "n/d"}.`;
    void sendMessage(message);
    setContactNotes("");
  }

  function onDismissMicroCta() {
    setMicroCtaDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BOT_MICRO_CTA_STATE_STORAGE_KEY, "1");
      window.dispatchEvent(new CustomEvent(BOT_MICRO_CTA_EVENT, { detail: { dismissed: true } }));
    }
  }

  function shouldShowHoursWhatsappCta(content: string) {
    const value = normalize(content);
    return value.includes("orari indicativi") && value.includes("conferma aggiornata");
  }

  function shouldShowMapsCta(content: string) {
    const value = normalize(content);
    return (
      value.includes("via plinio il vecchio 72") ||
      (value.includes("castellammare di stabia") && value.includes("na"))
    );
  }

  return (
    <>
      {open ? (
        <div
          className="fixed top-4 right-4 bottom-44 z-[61] flex w-[min(92vw,390px)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/95 shadow-[0_18px_60px_rgba(2,6,23,0.6)] backdrop-blur sm:right-6 sm:top-6 sm:bottom-44"
          onMouseMove={resetInactivityTimer}
          onClick={resetInactivityTimer}
          onKeyDown={resetInactivityTimer}
          onWheel={resetInactivityTimer}
          onTouchStart={resetInactivityTimer}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Plinio Assistant</p>
              <p className="text-xs text-cyan-300">Assistente AG Servizi</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
              aria-label="Chiudi chat"
            >
              Chiudi
            </button>
          </div>

          <div ref={messagesViewportRef} className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "bg-slate-800 text-slate-100"
                    : "ml-auto bg-cyan-500 text-slate-950"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="space-y-2">
                    <p>{message.content}</p>
                    {shouldShowHoursWhatsappCta(message.content) ? (
                      <a
                        href={buildHoursWhatsappLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                      >
                        Conferma orari su WhatsApp
                      </a>
                    ) : null}
                    {shouldShowMapsCta(message.content) ? (
                      <a
                        href={buildGoogleMapsLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Apri su Google Maps
                      </a>
                    ) : null}
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Sto scrivendo...
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="max-h-[46%] overflow-y-auto border-t border-slate-800 px-4 py-3">
            {showTrackingForm ? (
              <form
                onSubmit={onTrackingSubmit}
                className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Traccia spedizione
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={trackingCarrier}
                    onChange={(event) => setTrackingCarrier(event.target.value as TrackingCarrier)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="BRT">BRT</option>
                    <option value="Poste Italiane">Poste Italiane</option>
                    <option value="SDA">SDA</option>
                    <option value="TNT/FedEx">TNT/FedEx</option>
                  </select>
                  <input
                    value={trackingCode}
                    onChange={(event) => setTrackingCode(event.target.value)}
                    placeholder="Inserisci codice tracking"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading || trackingCode.trim() === ""}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Verifica tracking
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrackingForm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Nascondi
                  </button>
                </div>
              </form>
            ) : null}
            {showShippingQuoteForm ? (
              <form
                onSubmit={onShippingQuoteSubmit}
                className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Preventivo spedizione
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={shippingScope}
                    onChange={(event) => setShippingScope(event.target.value as ShippingScope)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="national">Nazionale (Italia)</option>
                    <option value="international">Internazionale</option>
                  </select>
                  <select
                    value={shippingCountry}
                    onChange={(event) => setShippingCountry(event.target.value)}
                    disabled={shippingScope === "national"}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:opacity-60"
                  >
                    {SHIPPING_COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={shippingWeightKG}
                    onChange={(event) => setShippingWeightKG(event.target.value)}
                    placeholder="Peso (kg)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <input
                    value={shippingLengthCM}
                    onChange={(event) => setShippingLengthCM(event.target.value)}
                    placeholder="Lunghezza (cm)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <input
                    value={shippingWidthCM}
                    onChange={(event) => setShippingWidthCM(event.target.value)}
                    placeholder="Larghezza (cm)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <input
                    value={shippingHeightCM}
                    onChange={(event) => setShippingHeightCM(event.target.value)}
                    placeholder="Altezza (cm)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading || shippingPricingLoading}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    {shippingPricingLoading ? "Calcolo..." : "Calcola stima"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShippingQuoteForm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Nascondi
                  </button>
                </div>
              </form>
            ) : null}
            {showUtilityEstimateForm ? (
              <form
                onSubmit={onUtilityEstimateSubmit}
                className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Stima bolletta luce o gas
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={utilityServiceType}
                    onChange={(event) => setUtilityServiceType(event.target.value as UtilityServiceType)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="luce">Solo Luce</option>
                    <option value="gas">Solo Gas</option>
                  </select>
                  <select
                    value={utilityContractType}
                    onChange={(event) => setUtilityContractType(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="residenziale">Residenziale</option>
                    <option value="business">Business</option>
                  </select>
                  <input
                    value={utilityMonthlySpend}
                    onChange={(event) => setUtilityMonthlySpend(event.target.value)}
                    placeholder="Spesa media mensile (€)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  {utilityServiceType === "luce" ? (
                    <input
                      value={utilityAnnualKwh}
                      onChange={(event) => setUtilityAnnualKwh(event.target.value)}
                      placeholder="Consumo annuo luce (kWh)"
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                    />
                  ) : null}
                  {utilityServiceType === "gas" ? (
                    <input
                      value={utilityAnnualSmc}
                      onChange={(event) => setUtilityAnnualSmc(event.target.value)}
                      placeholder="Consumo annuo gas (Smc)"
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                    />
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Calcola stima
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUtilityEstimateForm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Nascondi
                  </button>
                </div>
              </form>
            ) : null}
            {showTelephonyAuditForm ? (
              <form
                onSubmit={onTelephonyAuditSubmit}
                className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Controllo offerta telefonia
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={telephonyLineType}
                    onChange={(event) => setTelephonyLineType(event.target.value as TelephonyLineType)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="casa">Internet Casa</option>
                    <option value="mobile-casa">Mobile + Casa</option>
                  </select>
                  <select
                    value={telephonyPortability}
                    onChange={(event) => setTelephonyPortability(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="si">
                      {telephonyLineType === "casa"
                        ? "Migrazione linea: Sì"
                        : telephonyLineType === "mobile-casa"
                          ? "Portabilità/Migrazione: Sì"
                          : "Portabilità: Sì"}
                    </option>
                    <option value="no">
                      {telephonyLineType === "casa"
                        ? "Migrazione linea: No"
                        : telephonyLineType === "mobile-casa"
                          ? "Portabilità/Migrazione: No"
                          : "Portabilità: No"}
                    </option>
                  </select>
                  {telephonyLineType === "mobile" ? (
                    <>
                      <input
                        value={telephonyMobileSpend}
                        onChange={(event) => setTelephonyMobileSpend(event.target.value)}
                        placeholder="Spesa mobile mensile (€)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyDataGB}
                        onChange={(event) => setTelephonyDataGB(event.target.value)}
                        placeholder="Traffico dati mensile (GB)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyMinutes}
                        onChange={(event) => setTelephonyMinutes(event.target.value)}
                        placeholder="Minuti mensili (opzionale)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 sm:col-span-2"
                      />
                    </>
                  ) : null}
                  {telephonyLineType === "casa" ? (
                    <>
                      <input
                        value={telephonyHomeSpend}
                        onChange={(event) => setTelephonyHomeSpend(event.target.value)}
                        placeholder="Spesa internet casa mensile (€)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyHomeSpeedMbps}
                        onChange={(event) => setTelephonyHomeSpeedMbps(event.target.value)}
                        placeholder="Velocità attuale (Mbps, opz.)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                    </>
                  ) : null}
                  {telephonyLineType === "mobile-casa" ? (
                    <>
                      <input
                        value={telephonyMobileSpend}
                        onChange={(event) => setTelephonyMobileSpend(event.target.value)}
                        placeholder="Spesa mobile mensile (€)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyHomeSpend}
                        onChange={(event) => setTelephonyHomeSpend(event.target.value)}
                        placeholder="Spesa internet casa mensile (€)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyDataGB}
                        onChange={(event) => setTelephonyDataGB(event.target.value)}
                        placeholder="Traffico dati mobile (GB)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                      <input
                        value={telephonyHomeSpeedMbps}
                        onChange={(event) => setTelephonyHomeSpeedMbps(event.target.value)}
                        placeholder="Velocità casa (Mbps, opz.)"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                      />
                    </>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Avvia controllo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTelephonyAuditForm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Nascondi
                  </button>
                </div>
              </form>
            ) : null}
            {showContactForm ? (
              <form
                onSubmit={onContactSubmit}
                className="mb-3 space-y-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">
                  Contatto operatore
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="Nome e cognome"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 sm:col-span-2"
                  />
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="Telefono"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <input
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder="Email"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                  <input
                    value={contactService}
                    onChange={(event) => setContactService(event.target.value)}
                    placeholder="Servizio richiesto (es. SPID)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 sm:col-span-2"
                  />
                  <input
                    value={contactNotes}
                    onChange={(event) => setContactNotes(event.target.value)}
                    placeholder="Messaggio breve (opzionale)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 sm:col-span-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    Invia contatto
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    Nascondi
                  </button>
                </div>
              </form>
            ) : null}
            <div className="mb-3 flex flex-wrap gap-2">
              {promptsForUi.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Scrivi la tua domanda..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || input.trim() === ""}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                Invia
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {!open && !microCtaDismissed ? (
        <div className="fixed right-4 bottom-42 z-[60] flex w-[min(90vw,320px)] flex-col items-end gap-2 sm:right-6">
          <div className="rounded-xl border border-cyan-300/35 bg-slate-900/95 px-3 py-2 text-xs font-medium text-cyan-100 shadow-[0_12px_30px_rgba(8,47,73,0.4)] backdrop-blur animate-[fadeIn_0.35s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <span>{ATTENTION_TOOLTIPS[tooltipIndex]}</span>
              <button
                type="button"
                onClick={onDismissMicroCta}
                className="rounded-md border border-slate-600 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                aria-label="Chiudi suggerimenti rapidi"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {promptsForUi.slice(0, 2).map((prompt) => (
              <button
                key={`chip-${prompt}`}
                type="button"
                onClick={() => onQuickAction(prompt)}
                className="rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-[11px] text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed right-4 bottom-24 z-[90] h-16 w-16 cursor-pointer bg-transparent transition hover:-translate-y-0.5 sm:right-6 sm:bottom-24"
        aria-label="Apri assistente AI"
      >
        {unreadBadgeCount > 0 ? (
          <span className="absolute -top-1 -right-1 z-[100] inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-900/30">
            {unreadBadgeCount > 9 ? "9+" : unreadBadgeCount}
          </span>
        ) : null}
        <img
          src="/plinio-bot.png"
          alt=""
          aria-hidden="true"
          className="block h-full w-full object-contain drop-shadow-[0_14px_28px_rgba(8,47,73,0.42)] animate-[pulse_2.8s_ease-in-out_infinite]"
          draggable={false}
        />
      </button>
    </>
  );
}
