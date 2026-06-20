"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import SeasonalHeroObject from "@/components/SeasonalHeroObject";
import TextCycle from "@/components/ui/TextCycle";
import { googleReviewsCount } from "@/lib/google-reviews";
import {
  getActiveSeasonalHero,
  getResolvedSeasonalHeroByKey,
  type ResolvedSeasonalHeroConfig,
} from "@/lib/seasonal-hero";

const ANNIVERSARY_CONFETTI = [
  { left: "4%", delay: "0s", duration: "13s", size: 10, shape: "petal", rotate: -18, drift: -24 },
  { left: "10%", delay: "1.2s", duration: "14.5s", size: 12, shape: "sliver", rotate: 12, drift: 28 },
  { left: "16%", delay: "2.4s", duration: "12.8s", size: 9, shape: "petal", rotate: 28, drift: -18 },
  { left: "22%", delay: "0.8s", duration: "15.2s", size: 11, shape: "sliver", rotate: -10, drift: 22 },
  { left: "29%", delay: "1.8s", duration: "13.6s", size: 10, shape: "petal", rotate: 16, drift: -26 },
  { left: "36%", delay: "3.2s", duration: "12.4s", size: 8, shape: "sliver", rotate: -24, drift: 16 },
  { left: "43%", delay: "0.5s", duration: "14.8s", size: 12, shape: "petal", rotate: 21, drift: -20 },
  { left: "51%", delay: "2.1s", duration: "13.4s", size: 10, shape: "sliver", rotate: -14, drift: 26 },
  { left: "58%", delay: "1.4s", duration: "15.4s", size: 9, shape: "petal", rotate: 19, drift: -22 },
  { left: "65%", delay: "2.8s", duration: "12.9s", size: 11, shape: "sliver", rotate: -20, drift: 18 },
  { left: "72%", delay: "0.9s", duration: "14.6s", size: 10, shape: "petal", rotate: 14, drift: -28 },
  { left: "79%", delay: "3.5s", duration: "13.8s", size: 12, shape: "sliver", rotate: -12, drift: 20 },
  { left: "86%", delay: "1.7s", duration: "12.7s", size: 9, shape: "petal", rotate: 26, drift: -16 },
  { left: "92%", delay: "2.6s", duration: "15s", size: 11, shape: "sliver", rotate: -16, drift: 24 },
];

function checkIsOpen(): boolean {
  const now = new Date();
  const tz = "Europe/Rome";
  const day = now.toLocaleDateString("en-US", { timeZone: tz, weekday: "short" });
  const timeStr = now.toLocaleTimeString("en-US", {
    timeZone: tz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [h, m] = timeStr.split(":").map(Number);
  const t = h * 60 + m;
  if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day)) {
    return (t >= 8 * 60 + 45 && t < 13 * 60 + 20) || (t >= 16 * 60 + 20 && t < 19 * 60);
  }
  if (day === "Sat") {
    return t >= 9 * 60 + 20 && t < 12 * 60 + 30;
  }
  return false;
}

function resolvePreviewSeasonalHero() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get("hero");
  if (!value) return null;
  if (value === "anniversary" || value === "10anni") {
    return getResolvedSeasonalHeroByKey("anniversary-june-2026");
  }
  return getResolvedSeasonalHeroByKey(value);
}

export default function HomeSeasonalHero() {
  const [activeHero, setActiveHero] = useState<ResolvedSeasonalHeroConfig | null>(null);
  const [anniversaryPanelOpen, setAnniversaryPanelOpen] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const anniversaryActive = activeHero?.key === "anniversary-june-2026";

  useEffect(() => {
    setActiveHero(resolvePreviewSeasonalHero() || getActiveSeasonalHero());
  }, []);

  useEffect(() => {
    setIsOpen(checkIsOpen());
    const id = setInterval(() => setIsOpen(checkIsOpen()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!anniversaryActive) setAnniversaryPanelOpen(false);
  }, [anniversaryActive]);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-3.25rem)] flex-col items-stretch justify-start overflow-hidden bg-slate-950 pb-12 pt-24 text-white md:justify-center md:py-12">

      {/* ── Animated orbs (CSS animations — no Framer Motion loop) ──────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-float-1 absolute -top-40 left-1/3 h-136 w-136 rounded-full bg-cyan-500/25 blur-[70px] md:blur-[130px]" />
        <div className="orb-float-2 absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-violet-500/18 blur-[60px] md:blur-[120px]" />
        <div className="orb-float-3 absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-[55px] md:blur-[110px]" />
      </div>

      {/* ── Anniversary extras ─────────────────── */}
      {anniversaryActive && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_420px_at_16%_18%,rgba(251,191,36,0.16),rgba(251,191,36,0.08)_24%,rgba(251,191,36,0.03)_42%,transparent_68%),radial-gradient(620px_360px_at_84%_16%,rgba(245,158,11,0.14),rgba(245,158,11,0.06)_24%,rgba(245,158,11,0.02)_40%,transparent_66%)]"
          />
          <div aria-hidden="true" className="anniversary-confetti-layer">
            {ANNIVERSARY_CONFETTI.map((piece, index) => (
              <span
                key={`${piece.left}-${index}`}
                className={`anniversary-confetti ${
                  piece.shape === "petal" ? "anniversary-confetti-petal" : "anniversary-confetti-sliver"
                }`}
                style={{
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  ["--confetti-drift" as string]: `${piece.drift}px`,
                  ["--confetti-rotate" as string]: `${piece.rotate}deg`,
                  width: `${piece.size}px`,
                  height:
                    piece.shape === "petal"
                      ? `${Math.max(12, piece.size * 1.8)}px`
                      : `${Math.max(18, piece.size * 2.3)}px`,
                }}
              />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-20 right-[6%] hidden select-none text-[13rem] leading-none font-semibold tracking-[-0.08em] text-white/6 lg:block"
          >
            10
          </div>
        </>
      )}

      {activeHero && !anniversaryActive && (
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${activeHero.theme.overlayClass}`} />
      )}

      <Container className="relative z-20 grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        {/* ── LEFT ───────────────────────────────── */}
        <div className="space-y-7">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${
                anniversaryActive
                  ? "border-amber-300/30 bg-amber-500/10 text-amber-300"
                  : activeHero
                  ? `${activeHero.theme.badgeClass} ${activeHero.theme.badgeTextClass}`
                  : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                anniversaryActive ? "bg-amber-400" : activeHero ? "bg-current" : "bg-cyan-400"
              }`} />
              {anniversaryActive
                ? "10° Anniversario — Giugno 2026"
                : activeHero
                ? activeHero.badge
                : "Agenzia di servizi dal 2016"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {anniversaryActive ? (
              <div className="space-y-3">
                <div className="flex items-end gap-4">
                  <span className="text-7xl font-black leading-none tracking-tight text-amber-300 md:text-9xl">
                    10
                  </span>
                  <div className="pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/80">Anniversario</p>
                    <p className="text-sm text-slate-400">Dal 1 giugno 2016</p>
                  </div>
                </div>
                <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                  Accanto alle persone,
                  <br />
                  <span className="text-amber-300">ogni giorno.</span>
                </h1>
              </div>
            ) : activeHero ? (
              <div className="space-y-3">
                <div className="flex items-end gap-4">
                  <span className={`text-7xl font-black leading-none tracking-tight md:text-9xl ${activeHero.theme.accentTextClass}`}>
                    {activeHero.heroNumber}
                  </span>
                  <div className="pb-3">
                    <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${activeHero.theme.badgeTextClass}`}>
                      {activeHero.label}
                    </p>
                    <p className="text-sm text-slate-400">{activeHero.badge}</p>
                  </div>
                </div>
                <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                  {activeHero.title}
                </h1>
              </div>
            ) : (
              <h1 className="min-h-[2.6em] text-5xl font-black leading-[0.95] tracking-tight text-white md:min-h-0 md:text-7xl">
                I tuoi servizi,{" "}
                <TextCycle
                  words={["tutti qui.", "senza stress.", "vicino a te.", "dal 2016."]}
                  className="text-cyan-400"
                />
              </h1>
            )}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="max-w-xl text-lg text-slate-300"
          >
            {anniversaryActive
              ? "Dal 1 giugno 2016 AG SERVIZI affianca cittadini, famiglie e imprese con servizi utili, presenza reale e supporto continuo."
              : activeHero
              ? activeHero.description
              : "Telefonia, energia, SPID, PEC, spedizioni, pagamenti, CAF e molto altro. Consulenza gratuita, risposta in giornata."}
          </motion.p>

          {/* Chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex flex-wrap gap-2"
          >
            {(anniversaryActive
              ? ["10 anni di attività", "Supporto in sede e online", "Servizi per privati e imprese"]
              : activeHero
              ? activeHero.chips
              : ["Telefonia", "Energia", "SPID · PEC", "Spedizioni", "Pagamenti", "CAF", "Web Agency"]
            ).map((s) => (
              <span
                key={s}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium text-slate-300 transition ${
                  anniversaryActive
                    ? "border-amber-300/20 bg-amber-400/8 hover:border-amber-300/40"
                    : activeHero
                    ? `border-white/10 bg-white/5 ${activeHero.theme.chipClass}`
                    : "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:text-cyan-300"
                }`}
              >
                {s}
              </span>
            ))}
          </motion.div>

          {/* Social proof — default only */}
          {!anniversaryActive && !activeHero && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <div className="flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/10 px-3.5 py-1.5">
                <span className="text-sm leading-none text-amber-400">★★★★★</span>
                <span className="text-xs font-semibold text-amber-300">5.0</span>
              </div>
              <span className="text-sm text-slate-400">{googleReviewsCount} recensioni Google</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
              <span className="text-sm text-slate-400">500+ clienti attivi</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" aria-hidden="true" />
              <span className="text-sm text-slate-400">Dal 2016</span>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="flex flex-wrap gap-4"
          >
            {anniversaryActive ? (
              <>
                <button
                  type="button"
                  onClick={() => setAnniversaryPanelOpen((prev) => !prev)}
                  aria-expanded={anniversaryPanelOpen}
                  aria-controls="anniversary-panel"
                  className="cta-glass cta-glass-lg border-amber-300/35 bg-amber-300/18 text-white shadow-[0_14px_32px_rgba(251,191,36,0.18)] hover:border-amber-200/45 hover:bg-amber-300/24"
                >
                  {anniversaryPanelOpen ? "Chiudi l'anniversario" : "Festeggia con noi"}
                </button>
                <Link
                  href="/chi-siamo"
                  className="cta-glass cta-glass-lg cta-glass-secondary hover:border-amber-300/55 hover:text-amber-100"
                >
                  Scopri i nostri 10 anni
                </Link>
              </>
            ) : activeHero ? (
              <>
                <Link
                  href={activeHero.primaryCtaHref}
                  className={`cta-glass cta-glass-lg ${activeHero.theme.primaryButtonClass}`}
                >
                  {activeHero.primaryCtaLabel}
                </Link>
                <Link
                  href={activeHero.secondaryCtaHref}
                  className={`cta-glass cta-glass-lg ${activeHero.theme.secondaryButtonClass}`}
                >
                  {activeHero.secondaryCtaLabel}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/contatti"
                  className="cta-glass cta-glass-lg cta-glass-primary"
                >
                  Parla con noi
                </Link>
                <Link
                  href="/servizi"
                  className="cta-glass cta-glass-lg cta-glass-secondary"
                >
                  Scopri i servizi
                </Link>
              </>
            )}
          </motion.div>

          {/* Anniversary expanded panel */}
          {anniversaryActive && anniversaryPanelOpen && (
            <div
              id="anniversary-panel"
              className="animate-[heroReveal_0.42s_ease-out_both] rounded-3xl border border-amber-200/18 bg-slate-900/80 p-6 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_0.92fr]">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                    Esperienza che continua
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    Dieci anni costruiti con lavoro quotidiano e relazioni vere.
                  </h2>
                  <p className="text-sm leading-7 text-slate-300">
                    Questo traguardo racconta una crescita fatta di presenza costante, servizi
                    utili e attenzione concreta alle esigenze di cittadini, famiglie e imprese.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "2016", label: "inizio attività" },
                      { value: "10", label: "anni compiuti" },
                      { value: "Oggi", label: "stessa continuità" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center">
                        <p className="text-xl font-black text-amber-200">{item.value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                    Cosa vuoi fare adesso
                  </p>
                  <div className="mt-4 space-y-3">
                    <Link href="/chi-siamo" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white transition hover:border-amber-300/40 hover:bg-white/8">
                      Leggi la storia dell&apos;agenzia
                    </Link>
                    <Link href="/servizi" className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-white transition hover:border-amber-300/40 hover:bg-white/8">
                      Esplora i servizi attivi oggi
                    </Link>
                    <Link href="/contatti" className="block rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-4 text-sm font-bold text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-300/14">
                      Scrivici per celebrare con noi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`rounded-3xl border p-7 backdrop-blur-sm ${
            anniversaryActive
              ? "border-amber-300/16 bg-slate-900/70"
              : activeHero
              ? `border-white/10 bg-slate-900/70 ${activeHero.theme.panelClass}`
              : "border-white/10 bg-white/5"
          }`}
        >
          {anniversaryActive ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  Anniversario AG SERVIZI
                </p>
                <div className="rounded-full border border-amber-200/20 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                  Giugno 2026
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-amber-100/80">Linea del tempo</p>
                    <h2 className="mt-2 text-2xl font-black text-white">2016 → 2026</h2>
                  </div>
                  <div className="text-6xl font-black leading-none tracking-tight text-amber-300">10</div>
                </div>
                <div className="mt-4 h-px w-full bg-linear-to-r from-amber-300/0 via-amber-300/60 to-amber-300/0" />
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Dieci anni di lavoro concreto, senza scorciatoie: presenza in agenzia, supporto
                  operativo quotidiano e servizi che aiutano davvero.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "2016", label: "Partenza" },
                  { value: "10", label: "Anni" },
                  { value: "Oggi", label: "Continuità" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-amber-200/20 bg-slate-950/40 p-3 text-center">
                    <p className="text-lg font-black text-amber-200">{s.value}</p>
                    <p className="text-[11px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Il messaggio del mese</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Non celebriamo solo un anniversario: celebriamo dieci anni di fiducia costruita
                  con persone vere, bisogni concreti e presenza costante sul territorio.
                </p>
              </div>
            </div>
          ) : activeHero ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${activeHero.theme.badgeTextClass}`}>
                  {activeHero.panelEyebrow}
                </p>
                <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${activeHero.theme.chipClass}`}>
                  {activeHero.label}
                </div>
              </div>
              <SeasonalHeroObject
                heroKey={activeHero.key}
                heroNumber={activeHero.heroNumber}
                accentClass={activeHero.theme.accentTextClass}
              />
              <div className={`rounded-2xl border p-5 ${activeHero.theme.panelInnerClass}`}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">Il messaggio di oggi</p>
                    <h2 className="mt-2 text-xl font-black text-white">{activeHero.panelTitle}</h2>
                  </div>
                  <div className={`text-5xl font-black leading-none tracking-tight ${activeHero.theme.accentTextClass}`}>
                    {activeHero.heroNumber}
                  </div>
                </div>
                <div className="mt-4 h-px w-full bg-linear-to-r from-white/0 via-white/30 to-white/0" />
                <p className="mt-4 text-sm leading-7 text-slate-300">{activeHero.panelBody}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {activeHero.panelStats.map((item) => (
                  <div key={item.label} className={`rounded-xl border p-3 text-center ${activeHero.theme.statClass}`}>
                    <p className="text-lg font-black">{item.value}</p>
                    <p className="text-[11px] text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${activeHero.theme.badgeTextClass}`}>
                  Nota editoriale
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{activeHero.panelNote}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">I nostri servizi</p>
                {isOpen === null ? null : isOpen ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Aperto ora
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-500/15 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    Chiuso
                  </span>
                )}
              </div>

              {/* Services 3×2 grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: "Telefonia", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { label: "Energia", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M13 2L4.5 13.5H11L10 22l9.5-12H13L13 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
                  { label: "SPID · PEC", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { label: "Spedizioni", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M20 7L12 3L4 7M20 7v10l-8 4M20 7l-8 4M4 7v10l8 4M12 11v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
                  { label: "Pagamenti", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/></svg> },
                  { label: "Web Agency", icon: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2c-2.8 2.8-4 6.2-4 10s1.2 7.2 4 10M12 2c2.8 2.8 4 6.2 4 10s-1.2 7.2-4 10M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
                ].map((svc) => (
                  <div
                    key={svc.label}
                    className="group rounded-2xl border border-white/8 bg-white/5 p-3.5 text-center transition hover:border-cyan-400/30 hover:bg-white/10"
                  >
                    <div className="flex justify-center text-cyan-400 transition duration-300 group-hover:scale-110">
                      {svc.icon}
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-slate-300">{svc.label}</p>
                  </div>
                ))}
              </div>

              {/* Google rating */}
              <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/8 p-4">
                <span className="text-lg leading-none text-amber-400">★★★★★</span>
                <div>
                  <p className="text-sm font-bold text-white">5.0 su Google</p>
                  <p className="text-xs text-slate-400">{googleReviewsCount} recensioni verificate</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Via Plinio il Vecchio 72, Castellammare di Stabia (NA)</span>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
