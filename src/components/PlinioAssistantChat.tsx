"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  clientFallbackReply,
  includesAny,
  normalize,
} from "@/lib/plinio-chat-fallback.mjs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
};

type PlinioAssistantChatProps = {
  pathname: string;
};

type AssistantPayload = {
  message?: string;
  suggested_prompts?: string[];
  focus_scope?: string | null;
  intents?: string[];
  handoff_recommended?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HOURS_WHATSAPP_PHONE = "393773798570";
const HOURS_WHATSAPP_TEXT =
  "Ciao, vorrei conferma sugli orari di apertura.";
const MAPS_PLACE_QUERY = "AG SERVIZI VIA PLINIO 72 DI CAVALIERE CARMINE";

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

const CHAT_HISTORY_STORAGE_KEY = "plinio:chat:history";
const CHAT_HISTORY_MAX_MESSAGES = 50;

const CONTEXTUAL_PROMPTS: Record<string, string[]> = {
  "/": ["Che servizi offrite?", "Dove vi trovate?", "Come posso prenotare?"],
  "/servizi": ["Quali servizi di telefonia avete?", "Come attivo lo SPID?", "Fate spedizioni?"],
  "/chi-siamo": ["Da quanto siete aperti?", "Quanti servizi offrite?"],
  "/contatti": ["Quali sono gli orari?", "Posso venire senza appuntamento?"],
  "/consulenza": ["Come funziona la consulenza?", "È gratuita?"],
  "/prenota": ["Come prenoto un appuntamento?", "Quali servizi posso prenotare?"],
  "/web-agency": ["Quanto costa un sito web?", "Che tecnologie usate?"],
};

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

function makeChatMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
  };
}

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

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "adesso";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
  return `${Math.floor(diff / 86400)} giorni fa`;
}

function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-CHAT_HISTORY_MAX_MESSAGES);
  } catch {
    return [];
  }
}

function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-CHAT_HISTORY_MAX_MESSAGES);
    window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* quota exceeded -- silently ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          style={{
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PlinioAssistantChat({ pathname }: PlinioAssistantChatProps) {
  /* --- state -------------------------------------------------------- */
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickPromptOffset, setQuickPromptOffset] = useState(0);
  const [serverPrompts, setServerPrompts] = useState<string[]>([]);
  const [handoffData, setHandoffData] = useState<{ show: boolean; whatsappLink: string } | null>(null);
  const [timestampTick, setTimestampTick] = useState(() => Date.now());

  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const defaultWelcomeMessage = makeChatMessage(
    "assistant",
    "Ciao, sono Plinio Assistant. Posso aiutarti su pagamenti, SPID/PEC, telefonia, spedizioni e altri servizi AG Servizi.",
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadChatHistory();
    return stored.length > 0 ? stored : [defaultWelcomeMessage];
  });

  const endpoint = useMemo(buildAssistantEndpoint, []);

  /* --- derived ------------------------------------------------------ */

  const visibleMessages = useMemo(
    () => messages.slice(-12),
    [messages],
  );

  const quickPrompts = useMemo(
    () => rotateQuickPrompts(QUICK_PROMPT_POOL, quickPromptOffset, QUICK_PROMPTS_VISIBLE),
    [quickPromptOffset],
  );

  const contextualPrompts = useMemo(() => {
    const base = pathname.replace(/\/$/, "") || "/";
    return CONTEXTUAL_PROMPTS[base] ?? null;
  }, [pathname]);

  const promptsForUi = useMemo(() => {
    if (serverPrompts.length > 0) return serverPrompts.slice(0, QUICK_PROMPTS_VISIBLE);
    if (contextualPrompts) return contextualPrompts.slice(0, QUICK_PROMPTS_VISIBLE);
    return quickPrompts;
  }, [serverPrompts, contextualPrompts, quickPrompts]);

  /* --- effects ------------------------------------------------------ */

  // Persist messages to localStorage
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Update timestamps periodically
  useEffect(() => {
    const interval = window.setInterval(() => setTimestampTick(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (QUICK_PROMPT_POOL.length === 0) return;
    const seed = Math.floor(Date.now() / 1000) % QUICK_PROMPT_POOL.length;
    setQuickPromptOffset(seed);
  }, []);

  useEffect(() => {
    if (!open || QUICK_PROMPT_POOL.length === 0) return;
    setQuickPromptOffset((prev) => (prev + QUICK_PROMPTS_VISIBLE) % QUICK_PROMPT_POOL.length);
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!open) return;
    const viewport = messagesViewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" });
    }
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [open, messages, loading]);

  // Escape key closes chat
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* --- intent detection --------------------------------------------- */

  function isBookingIntent(text: string) {
    const q = normalize(text);
    return includesAny(q, ["prenotare", "appuntamento", "prenota", "prenotazione"]);
  }

  /* --- sendMessage -------------------------------------------------- */

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, makeChatMessage("user", trimmed)];
    setMessages(nextMessages);
    setInput("");

    if (QUICK_PROMPT_POOL.length > 0) {
      setQuickPromptOffset((prev) => (prev + 1) % QUICK_PROMPT_POOL.length);
    }

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          messages: nextMessages.slice(-10),
        }),
        signal: controller.signal,
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`server_error:${response.status}`);
      }

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

      if (payload.handoff_recommended) {
        setHandoffData({
          show: true,
          whatsappLink: buildHoursWhatsappLink(),
        });
      }

      setMessages((prev) => [...prev, makeChatMessage("assistant", reply)]);
    } catch (err: unknown) {
      let errorReply: string;
      if (err instanceof DOMException && err.name === "AbortError") {
        errorReply = "La risposta sta impiegando troppo. Riprova o scrivici su WhatsApp.";
      } else if (err instanceof TypeError) {
        errorReply = "Sembra che tu sia offline. Controlla la connessione e riprova.";
      } else if (err instanceof Error && err.message.startsWith("server_error:")) {
        errorReply = "Il servizio è temporaneamente non disponibile. Riprova tra qualche secondo.";
      } else {
        errorReply = clientFallbackReply(trimmed, nextMessages);
      }

      setMessages((prev) => [
        ...prev,
        makeChatMessage("assistant", errorReply),
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* --- form handlers ------------------------------------------------ */

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function onClearChat() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    }
    setMessages([defaultWelcomeMessage]);
    setHandoffData(null);
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

  function shouldShowBookingButton(content: string) {
    const value = normalize(content);
    return includesAny(value, ["prenotare", "appuntamento", "prenota", "prenotazione"]);
  }

  /* --- render ------------------------------------------------------- */

  return (
    <>
      {/* Keyframe styles for typing indicator */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(94,14,215,0.3); }
          50% { box-shadow: 0 0 30px rgba(94,14,215,0.5); }
        }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(94,14,215,0.4); border-radius: 9999px; }
        .chat-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(94,14,215,0.4) transparent; }
      `}</style>

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-purple-500/10 max-sm:inset-0 max-sm:w-full max-sm:rounded-none max-sm:border-0 sm:h-[600px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-linear-to-r from-[#5E0ED7]/20 to-transparent px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5E0ED7] text-sm font-bold text-white">
                  P
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Plinio</p>
                  <p className="text-xs text-white/50">Assistente AG SERVIZI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClearChat}
                  className="text-[10px] text-white/30 transition hover:text-white/60"
                  aria-label="Cancella chat"
                >
                  Cancella chat
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:text-white"
                  aria-label="Chiudi chat"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={messagesViewportRef}
              className="chat-scrollbar flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-4"
              role="log"
              aria-live="polite"
            >
              <AnimatePresence initial={false}>
                {visibleMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`max-w-[88%] ${
                      message.role === "user" ? "ml-auto" : ""
                    }`}
                  >
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${
                        message.role === "assistant"
                          ? "rounded-2xl rounded-bl-sm bg-white/8 text-white/90"
                          : "rounded-2xl rounded-br-sm bg-[#5E0ED7] text-white"
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
                              className="inline-flex rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                            >
                              Conferma orari su WhatsApp
                            </a>
                          ) : null}
                          {shouldShowMapsCta(message.content) ? (
                            <a
                              href={buildGoogleMapsLink()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-full bg-[#5E0ED7] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4e0bb5]"
                            >
                              Apri su Google Maps
                            </a>
                          ) : null}
                          {shouldShowBookingButton(message.content) ? (
                            <button
                              type="button"
                              onClick={() => window.dispatchEvent(new Event("plinio:open-booking"))}
                              className="inline-flex rounded-full bg-[#5E0ED7] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#4e0bb5]"
                            >
                              Prenota un appuntamento
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-white/25" suppressHydrationWarning>
                      {relativeTime(message.createdAt)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Handoff card */}
              {handoffData?.show ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4"
                >
                  <p className="font-semibold text-amber-200">Serve assistenza personalizzata</p>
                  <p className="text-sm text-amber-100/70">Per questa richiesta è meglio parlare con un operatore.</p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={handoffData.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="tel:+393773798570"
                      className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:text-white hover:border-white/30"
                    >
                      Chiama
                    </a>
                  </div>
                </motion.div>
              ) : null}

              {/* Typing indicator */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl rounded-bl-sm bg-white/8"
                >
                  <TypingIndicator />
                </motion.div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom area: quick prompts + input */}
            <div className="max-h-[46%] overflow-y-auto border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
              <div className="px-4 py-3 space-y-3">
                {/* Quick prompts */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {promptsForUi.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#5E0ED7]/40 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Scrivi la tua domanda..."
                    aria-label="Scrivi il tuo messaggio"
                    className="w-full rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#5E0ED7]/50 transition"
                  />
                  <AnimatePresence>
                    {input.trim() !== "" ? (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        type="submit"
                        disabled={loading || input.trim() === ""}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5E0ED7] text-white transition hover:bg-[#4e0bb5] disabled:opacity-60"
                        aria-label="Invia messaggio"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Chat bubble button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5E0ED7] text-white shadow-[0_0_20px_rgba(94,14,215,0.3)] transition hover:scale-105 hover:shadow-[0_0_30px_rgba(94,14,215,0.5)]"
        style={{ animation: "chatPulse 2.8s ease-in-out infinite" }}
        aria-label="Apri assistente AI"
        aria-expanded={open}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
