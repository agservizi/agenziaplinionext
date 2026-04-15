"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import Container from "@/components/Container";
import WebAgencyWizardModal from "@/components/WebAgencyWizardModal";

/* ─────────────────── ANIMATION VARIANTS ─────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ──────────────── 3D TILT CARD ──────────────────── */

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── REVEAL WRAPPER ────────────────── */

function Reveal({ children, className, variants = fadeUp, custom = 0 }: {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  custom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={variants} custom={custom} className={className}>
      {children}
    </motion.div>
  );
}

/* ──────────────── PROCESS STEPS ────────────────── */

const processSteps = [
  { step: "01", title: "Discovery guidata", desc: "Analizziamo il tuo business, i concorrenti e gli obiettivi concreti." },
  { step: "02", title: "Architettura & UX", desc: "Struttura pagine, flussi utente e CTA posizionate per convertire." },
  { step: "03", title: "Design system", desc: "Componenti riusabili, stile coerente, prototipi interattivi." },
  { step: "04", title: "Build & integrazioni", desc: "Sviluppo front/back, form, analytics, automazioni." },
  { step: "05", title: "Go-live & ottimizzazione", desc: "Deploy controllato, monitoraggio e miglioramento continuo." },
];

const techStack = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel", "Supabase", "Node.js", "SEO tecnico"];

const pricingPlans = [
  {
    name: "Landing",
    tag: "Parti veloce",
    price: "Su misura",
    desc: "Una pagina ad alto impatto per acquisire contatti o vendere un servizio specifico.",
    features: ["Design custom", "SEO on-page", "Form di contatto", "Mobile-first", "Consegna in 10 gg"],
    cta: "Richiedi info",
    accent: "border-slate-200 bg-white",
    ctaStyle: "bg-slate-900 text-white hover:bg-slate-800",
    tag2: null,
  },
  {
    name: "Sito Web",
    tag: "Il più scelto",
    price: "Su misura",
    desc: "Sito completo con più pagine, design system, CMS e ottimizzazione SEO avanzata.",
    features: ["Fino a 8 pagine", "Design system", "CMS integrato", "SEO avanzato", "Analytics", "Consegna in 21 gg"],
    cta: "Inizia ora",
    accent: "border-cyan-400/40 bg-linear-to-br from-slate-900 to-slate-800 text-white",
    ctaStyle: "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/30",
    tag2: "Più richiesto",
  },
  {
    name: "Piattaforma",
    tag: "Progetto avanzato",
    price: "Preventivo",
    desc: "E-commerce, gestionale su misura o piattaforma complessa con funzionalità custom.",
    features: ["Architettura custom", "Integrazioni API", "Dashboard admin", "Performance 90+", "Supporto dedicato"],
    cta: "Parliamone",
    accent: "border-slate-200 bg-white",
    ctaStyle: "bg-slate-900 text-white hover:bg-slate-800",
    tag2: null,
  },
];

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function WebAgencyShowcase() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative overflow-hidden pb-24">

      {/* ═══════════════════════════════════════
          HERO — bold, dark, animato
      ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-slate-950 pt-36 pb-24 text-white">

        {/* Animated orbs (CSS animations — no Framer Motion loop) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="orb-float-5 absolute -top-40 left-1/3 h-144 w-xl rounded-full bg-cyan-500/35 blur-[65px] md:blur-[120px]" />
          <div className="orb-float-6 absolute -bottom-20 right-1/4 h-120 w-120 rounded-full bg-fuchsia-500/30 blur-[70px] md:blur-[130px]" />
          <div className="orb-float-3 absolute top-1/3 -left-20 h-112 w-md rounded-full bg-indigo-500/25 blur-[60px] md:blur-[110px]" />
          <div className="orb-float-4 absolute top-10 right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-[50px] md:blur-[100px]" />
          <div className="orb-float-7 absolute bottom-1/3 left-1/2 h-64 w-64 rounded-full bg-teal-500/20 blur-[50px] md:blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Rotating shapes (CSS animations — no Framer Motion loop) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="rotate-cw-40    absolute top-24 right-[12%] h-20 w-20 rounded-2xl border border-white/6" />
          <div className="rotate-ccw-55   absolute bottom-24 left-[8%] h-28 w-28 rounded-full border border-cyan-500/8" />
          <div className="rotate-cw-scale absolute top-1/2 left-[55%] h-12 w-12 rounded-xl border border-fuchsia-500/8" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <Container className="relative">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Web Agency Creativa
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-8xl">
              Il tuo sito{" "}
              <span className="bg-linear-to-r from-cyan-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                non converte?
              </span>
              <br />
              Lo rifacciamo.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Siti veloci, design che colpisce, codice pulito. In 21 giorni sei online
              con qualcosa che funziona davvero. Nessun template, nessuna scusa.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-8 flex flex-wrap gap-4">
              <WebAgencyWizardModal />
              <Link href="/contatti"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-white/10">
                Parla con noi
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>

            {/* Tech pills */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="mt-10 flex flex-wrap gap-2">
              {techStack.map((t, i) => (
                <motion.span key={t} variants={fadeUp} custom={i + 4}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/60 backdrop-blur-sm">
                  {t}
                </motion.span>
              ))}
            </motion.div>

            {/* Quick stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-16 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 md:w-fit">
              {[
                { v: "21 gg", l: "Tempo medio go-live" },
                { v: "90+", l: "Performance score" },
                { v: "100%", l: "Custom, mai template" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center justify-center gap-1 bg-slate-950 px-8 py-6">
                  <p className="text-3xl font-black text-white">{s.v}</p>
                  <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </Container>
        </motion.div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-950 to-transparent" />
      </section>

      {/* ═══════════════════════════════════════
          BENTO GRID — capabilities
      ═══════════════════════════════════════ */}
      <section className="bg-slate-950 pb-24 text-white">
        <Container>
          <Reveal className="mb-12 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Capacità</p>
            <h2 className="text-4xl font-black leading-none tracking-tight md:text-7xl">
              Tutto quello
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                che ti serve.
              </span>
            </h2>
          </Reveal>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid gap-4 md:grid-cols-3">

            {/* Large card: Performance */}
            <motion.div variants={scaleIn} custom={0}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition hover:border-cyan-400/30 md:col-span-2">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-cyan-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                    Score 90+
                  </span>
                </div>
                <h3 className="mt-6 text-3xl font-black text-white">Performance elevata.</h3>
                <p className="mt-2 text-slate-400">Ogni sito che costruiamo raggiunge 90+ su Google PageSpeed. Veloce su mobile, veloce su desktop, sempre.</p>
                {/* Progress bar visual */}
                <div className="mt-6 space-y-2">
                  {[["Performance", 94], ["Accessibility", 98], ["SEO", 96], ["Best Practices", 92]].map(([label, val]) => (
                    <div key={label as string} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-slate-500">{label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full bg-linear-to-r from-cyan-400 to-teal-400"
                          initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }} />
                      </div>
                      <span className="w-8 text-right text-xs font-bold text-cyan-400">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small card: Tempo */}
            <motion.div variants={scaleIn} custom={1}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition hover:border-amber-400/30">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-6 text-6xl font-black leading-none text-white">21</p>
                <p className="text-lg font-black text-amber-400">giorni</p>
                <p className="mt-2 text-sm text-slate-400">Dal brief al sito online. Tempo medio garantito.</p>
              </div>
            </motion.div>

            {/* Small card: Mobile-first */}
            <motion.div variants={scaleIn} custom={2}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition hover:border-emerald-400/30">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-black text-white">Mobile-first.</h3>
                <p className="mt-2 text-sm text-slate-400">Progettiamo prima per mobile. Il 70%+ del tuo traffico arriva da lì.</p>
              </div>
            </motion.div>

            {/* Large card: Design system */}
            <motion.div variants={scaleIn} custom={3}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition hover:border-fuchsia-400/30 md:col-span-2">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-fuchsia-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-400">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-300">
                    Design System
                  </span>
                </div>
                <h3 className="mt-6 text-3xl font-black text-white">Identità visiva coerente.</h3>
                <p className="mt-2 text-slate-400">Font, colori, spaziatura, componenti — tutto documentato e riusabile su ogni pagina e ogni canale.</p>
                {/* Color swatches visual */}
                <div className="mt-6 flex gap-2">
                  {["bg-cyan-400", "bg-indigo-500", "bg-fuchsia-500", "bg-amber-400", "bg-emerald-400", "bg-slate-700", "bg-slate-900"].map((c) => (
                    <div key={c} className={`h-8 w-8 rounded-xl ${c} transition-transform hover:scale-110`} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small card: SEO */}
            <motion.div variants={scaleIn} custom={4}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-8 transition hover:border-violet-400/30">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-violet-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-black text-white">SEO tecnico.</h3>
                <p className="mt-2 text-sm text-slate-400">Struttura, meta tag, schema markup, sitemap e Core Web Vitals ottimizzati dal giorno 1.</p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PROCESSO — numerato, bold
      ═══════════════════════════════════════ */}
      <section className="bg-white py-24">
        <Container>
          <Reveal className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Come lavoriamo</p>
              <h2 className="text-4xl font-black leading-none tracking-tight text-slate-900 md:text-7xl">
                Dal brief
                <br />
                al go-live.
              </h2>
            </div>
            <p className="max-w-sm text-slate-500">
              Nessuna zona grigia tra design e sviluppo. Pipeline chiara, milestone rispettate.
            </p>
          </Reveal>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid gap-4 md:grid-cols-5">
            {processSteps.map((step, i) => (
              <motion.div key={step.step} variants={fadeUp} custom={i}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:border-cyan-200 hover:bg-white hover:shadow-xl">
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-cyan-500 to-teal-500 transition-transform duration-500 group-hover:scale-x-100" />
                <p className="text-5xl font-black leading-none text-slate-100 transition-colors group-hover:text-cyan-100">
                  {step.step}
                </p>
                <h3 className="mt-4 text-base font-black text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          PREZZI — 3 tier
      ═══════════════════════════════════════ */}
      <section className="bg-slate-50 py-24">
        <Container>
          <Reveal className="mb-16 space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Piani</p>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              Quanto costa
              <br />
              <span className="bg-linear-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                un sito che funziona?
              </span>
            </h2>
            <p className="mx-auto max-w-lg text-slate-500">
              Ogni progetto è su misura. Questi sono i nostri punti di partenza.
            </p>
          </Reveal>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, i) => {
              const isDark = plan.accent.includes("slate-900");
              return (
                <motion.div key={plan.name} variants={scaleIn} custom={i} className="relative">
                  {plan.tag2 && (
                    <div className="absolute -right-2 -top-3 z-10 rotate-12 rounded-full bg-cyan-400 px-4 py-1 text-xs font-black text-slate-950 shadow-lg">
                      {plan.tag2}
                    </div>
                  )}
                  <TiltCard className={`relative h-full overflow-hidden rounded-3xl border p-8 ${plan.accent} ${i === 1 ? "shadow-2xl" : "shadow-sm"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-cyan-300" : "text-slate-500"}`}>
                      {plan.tag}
                    </p>
                    <h3 className={`mt-2 text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {plan.name}
                    </h3>
                    <p className={`mt-4 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {plan.desc}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-8 border-t pt-6 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                      <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        {plan.price}
                      </p>
                      <Link href="/contatti"
                        className={`mt-4 block rounded-full px-6 py-3 text-center text-sm font-bold transition hover:-translate-y-0.5 ${plan.ctaStyle}`}>
                        {plan.cta}
                      </Link>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINALE — dark, bold
      ═══════════════════════════════════════ */}
      <section className="bg-slate-950 py-8 pb-0">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-14 text-center text-white shadow-2xl md:p-20">
              <motion.div animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
              <motion.div animate={{ x: [0, -15, 10, 0], y: [0, 10, -15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
              <div className="relative space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Pronto a iniziare?
                </p>
                <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
                  Raccontaci il progetto.
                  <br />
                  <span className="text-cyan-400">Ti rispondiamo in 24h.</span>
                </h2>
                <p className="mx-auto max-w-md text-slate-400">
                  Nessun impegno. Nessun preventivo nascosto. Solo una chiacchierata su cosa
                  vuoi costruire.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <WebAgencyWizardModal />
                  <Link href="/contatti"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300">
                    Parla con noi
                    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

    </div>
  );
}
