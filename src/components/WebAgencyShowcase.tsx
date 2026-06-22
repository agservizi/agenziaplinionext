"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import Container from "@/components/Container";

/* ─────────────────── CONSTANTS ─────────────────── */

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ORB_VIDEO_URL =
  "https://future.co/images/homepage/glassy-orb/orb-purple.webm";

const TRUSTED_BY = ["Next.js", "PostgreSQL", "TailwindCSS", "MUI"];

/* ──────────────── 3D TILT CARD ──────────────────── */

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── PROCESS STEPS ────────────────── */

const processSteps = [
  {
    step: "01",
    title: "Discovery guidata",
    desc: "Analizziamo il tuo business, i concorrenti e gli obiettivi concreti.",
  },
  {
    step: "02",
    title: "Architettura & UX",
    desc: "Struttura pagine, flussi utente e CTA posizionate per convertire.",
  },
  {
    step: "03",
    title: "Design system",
    desc: "Componenti riusabili, stile coerente, prototipi interattivi.",
  },
  {
    step: "04",
    title: "Build & integrazioni",
    desc: "Sviluppo front/back, form, analytics, automazioni.",
  },
  {
    step: "05",
    title: "Go-live & ottimizzazione",
    desc: "Deploy controllato, monitoraggio e miglioramento continuo.",
  },
];

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Vercel",
  "Supabase",
  "Node.js",
  "SEO tecnico",
];

const pricingPlans = [
  {
    name: "Landing",
    tag: "Parti veloce",
    price: "Su misura",
    desc: "Una pagina ad alto impatto per acquisire contatti o vendere un servizio specifico.",
    features: [
      "Design custom",
      "SEO on-page",
      "Form di contatto",
      "Mobile-first",
      "Consegna in 10 gg",
    ],
    cta: "Richiedi info",
    tag2: null,
  },
  {
    name: "Sito Web",
    tag: "Il più scelto",
    price: "Su misura",
    desc: "Sito completo con più pagine, design system, CMS e ottimizzazione SEO avanzata.",
    features: [
      "Fino a 8 pagine",
      "Design system",
      "CMS integrato",
      "SEO avanzato",
      "Analytics",
      "Consegna in 21 gg",
    ],
    cta: "Inizia ora",
    tag2: "Più richiesto",
  },
  {
    name: "Piattaforma",
    tag: "Progetto avanzato",
    price: "Preventivo",
    desc: "E-commerce, gestionale su misura o piattaforma complessa con funzionalità custom.",
    features: [
      "Architettura custom",
      "Integrazioni API",
      "Dashboard admin",
      "Performance 90+",
      "Supporto dedicato",
    ],
    cta: "Parliamone",
    tag2: null,
  },
];

/* ──────────────── PLAN → PROJECT TYPE MAPPING ────────────────── */

const PLAN_TO_PROJECT: Record<string, string> = {
  Landing: "Landing ad alta conversione",
  "Sito Web": "Sito vetrina premium",
  Piattaforma: "E-commerce",
};

/* ──────────────── CHAT AGENT DRAWER ────────────────── */

type ChatMsg = { id: string; role: "user" | "assistant"; content: string };
function makeChatId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function InfoRequestDrawer({
  open,
  onClose,
  planName,
}: {
  open: boolean;
  onClose: () => void;
  planName: string;
}) {
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setChatMessages([]);
    setChatInput("");
    setChatLoading(false);
    setLeadSaved(false);
    setTimeout(() => chatInputRef.current?.focus(), 300);
    setChatLoading(true);
    fetch("/api/web-agency/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planName, messages: [{ role: "user", content: `Ciao, sono interessato al piano ${planName}.` }] }),
    })
      .then((r) => r.json())
      .then((data) => {
        setChatMessages([{ id: makeChatId(), role: "assistant", content: data.message || `Ciao! Parliamo del piano ${planName}. Raccontami il tuo progetto.` }]);
      })
      .catch(() => {
        setChatMessages([{ id: makeChatId(), role: "assistant", content: `Ciao! Sono il consulente web di AG SERVIZI. Parlami del progetto che hai in mente per il piano ${planName}.` }]);
      })
      .finally(() => setChatLoading(false));
  }, [open, planName]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const userMsg: ChatMsg = { id: makeChatId(), role: "user", content: text };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/web-agency/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName, messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { id: makeChatId(), role: "assistant", content: data.message || "Riprova." }]);
      if (data.lead_ready) setLeadSaved(true);
    } catch {
      setChatMessages((prev) => [...prev, { id: makeChatId(), role: "assistant", content: "Problema di connessione. Riprova o scrivici su WhatsApp." }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed right-0 top-0 z-50 flex h-svh w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: "#0084ff" }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Consulente Web AG</p>
                  <p className="text-xs text-slate-500">Piano {planName}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:text-slate-900" aria-label="Chiudi">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Chat messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
              <div className="flex flex-col gap-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm border border-slate-100 bg-slate-50 text-slate-800"}`} style={msg.role === "user" ? { backgroundColor: "#0084ff" } : undefined}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-300" style={{ animation: "agentBounce 1.2s ease-in-out 0s infinite" }} />
                        <span className="h-2 w-2 rounded-full bg-slate-300" style={{ animation: "agentBounce 1.2s ease-in-out 0.15s infinite" }} />
                        <span className="h-2 w-2 rounded-full bg-slate-300" style={{ animation: "agentBounce 1.2s ease-in-out 0.3s infinite" }} />
                      </div>
                    </div>
                  </div>
                )}
                {leadSaved && (
                  <div className="mx-auto my-2 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    <span className="text-xs font-semibold text-emerald-700">Richiesta registrata — ti contatteremo presto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 px-4 py-3">
              <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }} className="flex items-center gap-2">
                <input ref={chatInputRef} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Scrivi un messaggio..." disabled={chatLoading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0084ff]/50 focus:ring-2 focus:ring-[#0084ff]/10" />
                <button type="submit" disabled={!chatInput.trim() || chatLoading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-40" style={{ backgroundColor: "#0084ff" }} aria-label="Invia">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </button>
              </form>
            </div>
            <style>{`@keyframes agentBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }`}</style>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function WebAgencyShowcase() {
  const reduced = useReducedMotion();
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [infoDrawerPlan, setInfoDrawerPlan] = useState("Landing");

  /* ── Hero parallax ── */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  /* ── Section refs for useInView ── */
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroTextRef, { once: true, margin: "-60px" });

  const bentoRef = useRef<HTMLDivElement>(null);
  const bentoInView = useInView(bentoRef, { once: true, margin: "-60px" });

  const processRef = useRef<HTMLDivElement>(null);
  const processInView = useInView(processRef, { once: true, margin: "-60px" });

  const pricingRef = useRef<HTMLDivElement>(null);
  const pricingInView = useInView(pricingRef, { once: true, margin: "-60px" });

  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-60px" });

  /* ── Animation helpers ── */
  const dur = reduced ? 0 : undefined;
  const noMotion = !!reduced;

  return (
    <div
      className="relative overflow-hidden bg-white"
      style={{ WebkitFontSmoothing: "antialiased" }}
    >
      {/* ═══════════════════════════════════════
          HERO — Liquid Glass on white
      ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-dvh overflow-hidden bg-white"
      >
        {/* Background mask — subtle gradient veil */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-50/80 via-white/40 to-blue-50/60" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white via-transparent to-slate-50/90" />

        {/* Glow ellipses — layered for depth */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#60B1FF]/25 blur-[120px]" />
          <div className="absolute top-20 left-20 h-[400px] w-[400px] rounded-full bg-[#319AFF]/20 blur-[100px]" />
          <div className="absolute -bottom-32 right-10 h-[350px] w-[350px] rounded-full bg-[#0084ff]/12 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 h-[250px] w-[250px] rounded-full bg-[#60B1FF]/15 blur-[80px]" />
        </div>

        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(0,132,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,132,255,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

        {/* Content with scroll fade */}
        <motion.div
          style={{
            opacity: noMotion ? 1 : heroContentOpacity,
            y: noMotion ? 0 : heroContentY,
          }}
          className="relative flex min-h-dvh items-center"
        >
          <Container className="relative pb-8 pt-28">
            <div
              ref={heroTextRef}
              className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
            >
              {/* ── Left column: text ── */}
              <div>
                {/* Social proof badge */}
                <motion.div
                  initial={noMotion ? false : { opacity: 0, y: 20 }}
                  animate={
                    heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: dur ?? 0.5, ease: SPRING_EASE }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/30 px-4 py-2 shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] backdrop-blur-[50px]"
                >
                  <span className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5 fill-[#FF801E]"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                  <span className="text-xs font-semibold text-[#0f172a]">
                    Valutati 4.9/5 da oltre 500 clienti
                  </span>
                </motion.div>

                {/* Cinematic headline with text reveal */}
                <h1
                  className="max-w-2xl"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "clamp(2.5rem, 7vw, 5rem)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                    fontWeight: 900,
                  }}
                >
                  <span className="block overflow-hidden pb-2">
                    <motion.span
                      className="block"
                      initial={noMotion ? false : { y: "110%" }}
                      animate={heroInView ? { y: "0%" } : { y: "110%" }}
                      transition={{
                        duration: dur ?? 1,
                        delay: 0.1,
                        ease: SPRING_EASE,
                      }}
                    >
                      Il tuo sito
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-2">
                    <motion.span
                      className="block"
                      initial={noMotion ? false : { y: "110%" }}
                      animate={heroInView ? { y: "0%" } : { y: "110%" }}
                      transition={{
                        duration: dur ?? 1,
                        delay: 0.2,
                        ease: SPRING_EASE,
                      }}
                    >
                      non converte?
                    </motion.span>
                  </span>
                  <span className="block overflow-hidden pb-2">
                    <motion.span
                      className="inline-block"
                      initial={noMotion ? false : { y: "110%" }}
                      animate={heroInView ? { y: "0%" } : { y: "110%" }}
                      transition={{
                        duration: dur ?? 1,
                        delay: 0.3,
                        ease: SPRING_EASE,
                      }}
                      style={{
                        backgroundImage:
                          "linear-gradient(90deg, #0084ff, #60B1FF, #319AFF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Lo rifacciamo.
                    </motion.span>
                  </span>
                </h1>

                {/* Subheadline */}
                <motion.p
                  initial={noMotion ? false : { opacity: 0, y: 30 }}
                  animate={
                    heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{
                    duration: dur ?? 0.7,
                    delay: 0.5,
                    ease: SPRING_EASE,
                  }}
                  className="mt-4 max-w-xl text-base leading-relaxed text-slate-500"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Siti veloci, design che colpisce, codice pulito. In 21 giorni
                  sei online con qualcosa che funziona davvero.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={noMotion ? false : { opacity: 0, y: 20 }}
                  animate={
                    heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{
                    duration: dur ?? 0.6,
                    delay: 0.6,
                    ease: SPRING_EASE,
                  }}
                  className="mt-6 flex flex-wrap items-center gap-4"
                >
                  {/* Primary CTA */}
                  <motion.button
                    whileHover={noMotion ? {} : { scale: 1.02 }}
                    whileTap={noMotion ? {} : { scale: 0.98 }}
                    onClick={() => {
                      const el = document.getElementById("pricing-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-[inset_0_4px_4px_rgba(255,255,255,0.35)] backdrop-blur-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                    style={{ fontFamily: "var(--font-inter)", backgroundColor: "rgba(0,132,255,0.85)" }}
                  >
                    Richiedi Preventivo
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </motion.button>

                  {/* Secondary CTA — Opens drawer */}
                  <button
                    type="button"
                    onClick={() => { setInfoDrawerPlan("Sito Web"); setInfoDrawerOpen(true); }}
                    className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold transition-all duration-300 hover:border-[#0084ff]/30 hover:bg-blue-50"
                    style={{ fontFamily: "var(--font-inter)", color: "#0f172a" }}
                  >
                    Avvia un progetto
                  </button>
                </motion.div>

                {/* Tech stack pills */}
                <motion.div
                  initial={noMotion ? false : { opacity: 0, y: 16 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: dur ?? 0.6, delay: 0.8, ease: SPRING_EASE }}
                  className="mt-5 flex flex-wrap gap-1.5"
                >
                  {techStack.map((t) => (
                    <span key={t} className="rounded-full border border-slate-200/80 bg-white/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur-sm">
                      {t}
                    </span>
                  ))}
                </motion.div>

                {/* Quick stats */}
                <motion.div
                  initial={noMotion ? false : { opacity: 0, y: 16 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: dur ?? 0.6, delay: 1.0, ease: SPRING_EASE }}
                  className="mt-5 flex gap-6"
                >
                  {[
                    { v: "21 gg", l: "Go-live medio" },
                    { v: "90+", l: "Performance" },
                    { v: "100%", l: "Custom" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "var(--font-inter)" }}>{s.v}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400" style={{ fontFamily: "var(--font-inter)" }}>{s.l}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ── Right column: Orb video ── */}
              <motion.div
                initial={noMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={
                  heroInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.9 }
                }
                transition={{
                  duration: dur ?? 1.2,
                  delay: 0.3,
                  ease: SPRING_EASE,
                }}
                className="relative flex items-center justify-center"
              >
                {/* Glow behind orb */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[80%] w-[80%] rounded-full bg-[#0084ff]/10 blur-[80px]" />
                </div>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="relative w-full max-w-md scale-110"
                  style={{
                    mixBlendMode: "screen",
                    filter: "hue-rotate(-55deg) saturate(280%) brightness(1.25) contrast(1.1)",
                  }}
                  src={ORB_VIDEO_URL}
                />
              </motion.div>
            </div>

          </Container>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={reduced ? undefined : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500" style={{ fontFamily: "var(--font-inter)" }}>
              Scorri
            </span>
            <svg width="16" height="22" viewBox="0 0 14 20" fill="none">
              <path d="M7 3v14M2 12l5 5 5-5" stroke="#0084ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          BENTO GRID — Capabilities
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        {/* Subtle top glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#60B1FF]/10 blur-[120px]" />

        <Container>
          <div ref={bentoRef} className="mb-14 space-y-4">
            <motion.p
              initial={noMotion ? false : { opacity: 0, y: 14 }}
              animate={
                bentoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
              }
              transition={{ duration: dur ?? 0.5, ease: SPRING_EASE }}
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Capacit&agrave;
            </motion.p>
            <div className="overflow-hidden pb-2">
              <motion.h2
                initial={noMotion ? false : { y: "110%" }}
                animate={bentoInView ? { y: "0%" } : { y: "110%" }}
                transition={{
                  duration: dur ?? 0.9,
                  delay: 0.1,
                  ease: SPRING_EASE,
                }}
                className="text-4xl font-bold leading-none tracking-tight text-slate-900 md:text-7xl"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Tutto quello
              </motion.h2>
            </div>
            <div className="overflow-hidden pb-2">
              <motion.h2
                initial={noMotion ? false : { y: "110%" }}
                animate={bentoInView ? { y: "0%" } : { y: "110%" }}
                transition={{
                  duration: dur ?? 0.9,
                  delay: 0.2,
                  ease: SPRING_EASE,
                }}
                className="inline-block bg-linear-to-r from-[#0084ff] to-[#60B1FF] bg-clip-text text-4xl font-bold leading-none tracking-tight text-transparent md:text-7xl"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                che ti serve.
              </motion.h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Large card: Performance */}
            <motion.div
              initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                bentoInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={{
                duration: dur ?? 0.7,
                delay: 0.08 * 0,
                ease: SPRING_EASE,
              }}
              className="md:col-span-2"
            >
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0084ff]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                      >
                        <path
                          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="rounded-full border border-blue-200/50 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0084ff]">
                      Score 90+
                    </span>
                  </div>
                  <h3
                    className="mt-6 text-3xl font-bold text-slate-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Performance elevata.
                  </h3>
                  <p
                    className="mt-2 text-slate-500"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Ogni sito che costruiamo raggiunge 90+ su Google PageSpeed.
                    Veloce su mobile, veloce su desktop, sempre.
                  </p>
                  <div className="mt-6 space-y-2">
                    {(
                      [
                        ["Performance", 94],
                        ["Accessibility", 98],
                        ["SEO", 96],
                        ["Best Practices", 92],
                      ] as const
                    ).map(([label, val]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span
                          className="w-28 shrink-0 text-xs text-slate-400"
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {label}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-linear-to-r from-[#0084ff] to-[#60B1FF]"
                            initial={{ width: 0 }}
                            animate={
                              bentoInView
                                ? { width: `${val}%` }
                                : { width: 0 }
                            }
                            transition={{
                              duration: dur ?? 1.2,
                              ease: "easeOut",
                              delay: 0.3,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-[#0084ff]">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Small card: Tempo */}
            <motion.div
              initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                bentoInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={{
                duration: dur ?? 0.7,
                delay: 0.08 * 1,
                ease: SPRING_EASE,
              }}
            >
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0084ff]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M12 6v6l4 2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p
                    className="mt-6 text-6xl font-bold leading-none text-slate-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    21
                  </p>
                  <p
                    className="text-lg font-bold text-[#0084ff]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    giorni
                  </p>
                  <p
                    className="mt-2 text-sm text-slate-500"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Dal brief al sito online. Tempo medio garantito.
                  </p>
                </div>
              </TiltCard>
            </motion.div>

            {/* Small card: Mobile-first */}
            <motion.div
              initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                bentoInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={{
                duration: dur ?? 0.7,
                delay: 0.08 * 2,
                ease: SPRING_EASE,
              }}
            >
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0084ff]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M12 18h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold text-slate-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Mobile-first.
                  </h3>
                  <p
                    className="mt-2 text-sm text-slate-500"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Progettiamo prima per mobile. Il 70%+ del tuo traffico
                    arriva da l&igrave;.
                  </p>
                </div>
              </TiltCard>
            </motion.div>

            {/* Large card: Design system */}
            <motion.div
              initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                bentoInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={{
                duration: dur ?? 0.7,
                delay: 0.08 * 3,
                ease: SPRING_EASE,
              }}
              className="md:col-span-2"
            >
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0084ff]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="rounded-full border border-blue-200/50 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0084ff]">
                      Design System
                    </span>
                  </div>
                  <h3
                    className="mt-6 text-3xl font-bold text-slate-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Identit&agrave; visiva coerente.
                  </h3>
                  <p
                    className="mt-2 text-slate-500"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Font, colori, spaziatura, componenti — tutto documentato e
                    riusabile su ogni pagina e ogni canale.
                  </p>
                  {/* Color swatches — blue-themed palette */}
                  <div className="mt-6 flex gap-2">
                    {[
                      "bg-[#0084ff]",
                      "bg-[#319AFF]",
                      "bg-[#60B1FF]",
                      "bg-blue-300",
                      "bg-sky-200",
                      "bg-slate-700",
                      "bg-slate-900",
                    ].map((c) => (
                      <div
                        key={c}
                        className={`h-8 w-8 rounded-xl ${c} transition-transform hover:scale-110`}
                      />
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>

            {/* Small card: SEO */}
            <motion.div
              initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={
                bentoInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.95 }
              }
              transition={{
                duration: dur ?? 0.7,
                delay: 0.08 * 4,
                ease: SPRING_EASE,
              }}
            >
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0084ff]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M21 21l-4.35-4.35"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h3
                    className="mt-6 text-xl font-bold text-slate-900"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    SEO tecnico.
                  </h3>
                  <p
                    className="mt-2 text-sm text-slate-500"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Struttura, meta tag, schema markup, sitemap e Core Web
                    Vitals ottimizzati dal giorno 1.
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PROCESS — Horizontal timeline
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-50/50 py-24 md:py-32">
        <Container>
          <div ref={processRef}>
            {/* Header */}
            <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <motion.p
                  initial={noMotion ? false : { opacity: 0, y: 14 }}
                  animate={
                    processInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 14 }
                  }
                  transition={{ duration: dur ?? 0.5, ease: SPRING_EASE }}
                  className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Come lavoriamo
                </motion.p>
                <div className="overflow-hidden pb-2">
                  <motion.h2
                    initial={noMotion ? false : { y: "110%" }}
                    animate={processInView ? { y: "0%" } : { y: "110%" }}
                    transition={{
                      duration: dur ?? 0.9,
                      delay: 0.1,
                      ease: SPRING_EASE,
                    }}
                    className="text-4xl font-bold leading-none tracking-tight text-slate-900 md:text-7xl"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    Dal brief
                  </motion.h2>
                </div>
                <div className="pb-4">
                  <motion.h2
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: dur ?? 0.9,
                      delay: 0.2,
                      ease: SPRING_EASE,
                    }}
                    className="text-4xl font-bold tracking-tight md:text-7xl"
                    style={{ fontFamily: "var(--font-inter)", lineHeight: 1.2 }}
                  >
                    <span style={{
                      background: "linear-gradient(90deg, #0084ff, #60B1FF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      paddingBottom: "0.2em",
                      display: "inline-block",
                    }}>al go-live.</span>
                  </motion.h2>
                </div>
              </div>
              <motion.p
                initial={noMotion ? false : { opacity: 0, y: 20 }}
                animate={
                  processInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: dur ?? 0.6,
                  delay: 0.3,
                  ease: SPRING_EASE,
                }}
                className="max-w-sm text-slate-500"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Nessuna zona grigia tra design e sviluppo. Pipeline chiara,
                milestone rispettate.
              </motion.p>
            </div>

            {/* Desktop: horizontal timeline */}
            <div className="relative">
              {/* Connecting blue line */}
              <motion.div
                initial={noMotion ? false : { scaleX: 0 }}
                animate={processInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{
                  duration: dur ?? 1.2,
                  delay: 0.3,
                  ease: SPRING_EASE,
                }}
                className="absolute left-[10%] right-[10%] top-1.5 hidden h-px origin-left bg-[#0084ff]/20 md:block"
              />

              {/* Desktop grid */}
              <div className="hidden gap-6 md:grid md:grid-cols-5">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={noMotion ? false : { opacity: 0, y: 30 }}
                    animate={
                      processInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 30 }
                    }
                    transition={{
                      duration: dur ?? 0.7,
                      delay: 0.2 + i * 0.1,
                      ease: SPRING_EASE,
                    }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Pulsing dot */}
                    <div className="relative z-10 mb-6">
                      <div className="h-3 w-3 rounded-full bg-[#0084ff] shadow-[0_0_12px] shadow-[#0084ff]/40" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-[#0084ff]/30" />
                    </div>

                    {/* Card */}
                    <div className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-blue-200/50 hover:shadow-xl">
                      <p
                        className="text-5xl font-bold leading-none text-blue-100 transition-colors group-hover:text-blue-200"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {step.step}
                      </p>
                      <h3
                        className="mt-4 text-base font-bold text-slate-900"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="mt-2 text-xs leading-relaxed text-slate-500"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile: stacked vertical */}
              <div className="flex flex-col gap-4 md:hidden">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={step.step}
                    initial={noMotion ? false : { opacity: 0, x: -20 }}
                    animate={
                      processInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{
                      duration: dur ?? 0.6,
                      delay: 0.1 + i * 0.08,
                      ease: SPRING_EASE,
                    }}
                    className="group relative flex gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-500 hover:border-blue-200/50 hover:shadow-xl"
                  >
                    <p
                      className="text-4xl font-bold leading-none text-blue-100"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {step.step}
                    </p>
                    <div>
                      <h3
                        className="text-base font-bold text-slate-900"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="mt-1 text-xs leading-relaxed text-slate-500"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PRICING — 3 tiers
      ═══════════════════════════════════════ */}
      <section
        id="pricing-section"
        className="relative overflow-hidden bg-white py-24 md:py-32"
      >
        <Container>
          <div ref={pricingRef} className="mb-16 space-y-4 text-center">
            <motion.p
              initial={noMotion ? false : { opacity: 0, y: 14 }}
              animate={
                pricingInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 14 }
              }
              transition={{ duration: dur ?? 0.5, ease: SPRING_EASE }}
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Piani
            </motion.p>
            <div className="overflow-hidden pb-2">
              <motion.h2
                initial={noMotion ? false : { y: "110%" }}
                animate={pricingInView ? { y: "0%" } : { y: "110%" }}
                transition={{
                  duration: dur ?? 0.9,
                  delay: 0.1,
                  ease: SPRING_EASE,
                }}
                className="text-4xl font-bold leading-tight text-slate-900 md:text-6xl"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Quanto costa
              </motion.h2>
            </div>
            <div className="overflow-hidden pb-2">
              <motion.h2
                initial={noMotion ? false : { y: "110%" }}
                animate={pricingInView ? { y: "0%" } : { y: "110%" }}
                transition={{
                  duration: dur ?? 0.9,
                  delay: 0.2,
                  ease: SPRING_EASE,
                }}
                className="inline-block bg-linear-to-r from-[#0084ff] to-[#60B1FF] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                un sito che funziona?
              </motion.h2>
            </div>
            <motion.p
              initial={noMotion ? false : { opacity: 0, y: 14 }}
              animate={
                pricingInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 14 }
              }
              transition={{
                duration: dur ?? 0.5,
                delay: 0.3,
                ease: SPRING_EASE,
              }}
              className="mx-auto max-w-lg text-slate-500"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Ogni progetto &egrave; su misura. Questi sono i nostri punti di partenza.
            </motion.p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => {
              const isFeatured = i === 1;
              return (
                <motion.div
                  key={plan.name}
                  initial={noMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={
                    pricingInView
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.95 }
                  }
                  transition={{
                    duration: dur ?? 0.7,
                    delay: 0.1 + i * 0.08,
                    ease: SPRING_EASE,
                  }}
                  className="relative"
                >
                  {plan.tag2 && (
                    <div className="absolute -right-2 -top-3 z-10 rounded-full bg-[#0084ff] px-4 py-1 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                      {plan.tag2}
                    </div>
                  )}
                  <TiltCard
                    className={`relative h-full overflow-hidden rounded-2xl border p-8 ${
                      isFeatured
                        ? "border-[#0084ff]/30 bg-white shadow-xl shadow-blue-500/10"
                        : "border-slate-100 bg-white shadow-sm"
                    }`}
                  >
                    {/* Glass-like top border for featured */}
                    {isFeatured && (
                      <div className="absolute inset-x-0 top-0 h-[2px] w-full rounded-t-2xl bg-linear-to-r from-[#0084ff] via-[#319AFF] to-[#60B1FF]" />
                    )}
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {plan.tag}
                    </p>
                    <h3
                      className="mt-2 text-3xl font-bold text-slate-900"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="mt-4 text-sm leading-relaxed text-slate-600"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {plan.desc}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0 text-[#0084ff]"
                            fill="none"
                          >
                            <path
                              d="M20 6L9 17l-5-5"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span
                            className="text-sm font-medium text-slate-700"
                            style={{ fontFamily: "var(--font-inter)" }}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <p
                        className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {plan.price}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setInfoDrawerPlan(plan.name); setInfoDrawerOpen(true); }}
                        className={`mt-4 flex min-h-[44px] w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                          isFeatured
                            ? "bg-[#0084ff] shadow-lg shadow-blue-500/20 hover:bg-[#0070dd] hover:shadow-xl hover:shadow-blue-500/30"
                            : "border border-[#0084ff]/30 hover:bg-[#0084ff] hover:shadow-lg hover:shadow-blue-500/20"
                        }`}
                        style={{ fontFamily: "var(--font-inter)", color: isFeatured ? "#ffffff" : "#0084ff" }}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINALE — Liquid Glass card
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        {/* Blue gradient glow behind */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#60B1FF]/15 blur-[120px]" />
          <div className="absolute left-1/3 top-1/3 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#319AFF]/10 blur-[100px]" />
        </div>

        <Container className="relative">
          <div
            ref={ctaRef}
            className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white/40 p-12 shadow-[inset_0_4px_4px_rgba(255,255,255,0.25)] backdrop-blur-[50px]"
          >
            <div className="space-y-6 text-center">
              <motion.p
                initial={noMotion ? false : { opacity: 0, y: 14 }}
                animate={
                  ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
                }
                transition={{ duration: dur ?? 0.5, ease: SPRING_EASE }}
                className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0084ff]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Pronto a iniziare?
              </motion.p>

              <div className="overflow-hidden pb-2">
                <motion.h2
                  initial={noMotion ? false : { y: "110%" }}
                  animate={ctaInView ? { y: "0%" } : { y: "110%" }}
                  transition={{
                    duration: dur ?? 0.9,
                    delay: 0.1,
                    ease: SPRING_EASE,
                  }}
                  className="text-4xl font-bold leading-tight text-[#0f172a] md:text-6xl"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Raccontaci il progetto.
                </motion.h2>
              </div>
              <div className="overflow-hidden pb-2">
                <motion.h2
                  initial={noMotion ? false : { y: "110%" }}
                  animate={ctaInView ? { y: "0%" } : { y: "110%" }}
                  transition={{
                    duration: dur ?? 0.9,
                    delay: 0.2,
                    ease: SPRING_EASE,
                  }}
                  className="inline-block bg-linear-to-r from-[#0084ff] to-[#60B1FF] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Ti rispondiamo in 24h.
                </motion.h2>
              </div>

              <motion.p
                initial={noMotion ? false : { opacity: 0, y: 14 }}
                animate={
                  ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
                }
                transition={{
                  duration: dur ?? 0.5,
                  delay: 0.3,
                  ease: SPRING_EASE,
                }}
                className="mx-auto max-w-md text-slate-500"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Nessun impegno. Nessun preventivo nascosto. Solo una chiacchierata
                su cosa vuoi costruire.
              </motion.p>

              <motion.div
                initial={noMotion ? false : { opacity: 0, y: 20 }}
                animate={
                  ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: dur ?? 0.6,
                  delay: 0.4,
                  ease: SPRING_EASE,
                }}
                className="flex flex-wrap justify-center gap-4 pt-2"
              >
                <button
                  type="button"
                  onClick={() => { setInfoDrawerPlan("Sito Web"); setInfoDrawerOpen(true); }}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#0084ff]/30 hover:bg-blue-50"
                  style={{ fontFamily: "var(--font-inter)", color: "#0f172a" }}
                >
                  Avvia un progetto
                </button>
                <Link
                  href="/contatti"
                  className="group inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#0084ff]/30 hover:bg-blue-50"
                  style={{ fontFamily: "var(--font-inter)", color: "#0f172a" }}
                >
                  Parla con noi
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>
      <InfoRequestDrawer
        open={infoDrawerOpen}
        onClose={() => setInfoDrawerOpen(false)}
        planName={infoDrawerPlan}
      />
    </div>
  );
}
