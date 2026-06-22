"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { clientAreas, type ClientAreaConfig } from "@/lib/client-area";
import Container from "@/components/Container";

function cardTitle(area: ClientAreaConfig): string {
  return area.key === "consulenza-utenze" ? "Consulenza Utenze" : area.title;
}

const HERO_ROTATE_MS = 5000;

const heroMetrics: Record<string, { value: number; label: string }[]> = {
  spedizioni: [
    { value: 24, label: "Ritiri/gg" },
    { value: 3, label: "Step medi" },
    { value: 98, label: "Esiti positivi %" },
  ],
  visure: [
    { value: 18, label: "Richieste/gg" },
    { value: 2, label: "Verifiche" },
    { value: 96, label: "Precisione %" },
  ],
  "caf-patronato": [
    { value: 32, label: "Pratiche/gg" },
    { value: 4, label: "Servizi top" },
    { value: 97, label: "Completate %" },
  ],
  "fotocopie-online": [
    { value: 1200, label: "Pagine/sett." },
    { value: 1, label: "Upload click" },
    { value: 99, label: "Ritiro puntuale %" },
  ],
  "consulenza-utenze": [
    { value: 14, label: "Analisi/gg" },
    { value: 3, label: "Confronti offerta" },
    { value: 95, label: "Lead qualificate %" },
  ],
  "web-agency": [
    { value: 9, label: "Brief/sett." },
    { value: 4, label: "Step progetto" },
    { value: 92, label: "Lead qualificate %" },
  ],
};

function useCountUp(target: number, resetKey: string) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const duration = 700;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, resetKey]);
  return value;
}

function MetricCounter({
  target,
  label,
  resetKey,
}: {
  target: number;
  label: string;
  resetKey: string;
}) {
  const value = useCountUp(target, resetKey);
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-lg font-semibold text-purple-300">{value}</p>
      <p className="text-[11px] text-white/35">{label}</p>
    </div>
  );
}

const EASE_CINEMATIC: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ClientAreaInteractiveHero() {
  const [activeKey, setActiveKey] = useState(clientAreas[0]?.key ?? "spedizioni");
  const [isHoveringCards, setIsHoveringCards] = useState(false);
  const [ctaPulseOnce, setCtaPulseOnce] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const activeArea = useMemo(
    () => clientAreas.find((area) => area.key === activeKey) ?? clientAreas[0],
    [activeKey],
  );
  const activeIndex = useMemo(
    () => Math.max(0, clientAreas.findIndex((area) => area.key === activeKey)),
    [activeKey],
  );
  const metrics = heroMetrics[activeArea?.key ?? "spedizioni"] ?? heroMetrics.spedizioni;

  useEffect(() => {
    if (!ctaPulseOnce) return;
    const timer = window.setTimeout(() => setCtaPulseOnce(false), 2600);
    return () => window.clearTimeout(timer);
  }, [ctaPulseOnce]);

  useEffect(() => {
    if (isHoveringCards || clientAreas.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveKey((prev) => {
        const current = clientAreas.findIndex((area) => area.key === prev);
        const next = (current + 1) % clientAreas.length;
        return clientAreas[next]?.key ?? prev;
      });
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [isHoveringCards]);

  if (!activeArea) return null;

  const noMotion = !!prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-slate-950 py-28 md:py-36"
      onMouseMove={(event) => {
        if (noMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
        setParallax({ x, y });
      }}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#5E0ED7]/5 via-transparent to-[#22d3ee]/3"
        aria-hidden="true"
      />

      {/* Film grain texture */}
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.025 }} aria-hidden="true">
        <svg width="100%" height="100%">
          <filter id="heroGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#heroGrain)" />
        </svg>
      </div>

      {/* Floating orbs */}
      <div
        className="orb-float-1 pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#5E0ED7]/15 blur-[120px]"
        aria-hidden="true"
        style={{
          transform: noMotion
            ? undefined
            : `translate3d(${parallax.x * 0.6}px, ${parallax.y * 0.6}px, 0)`,
        }}
      />
      <div
        className="orb-float-2 pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-[#22d3ee]/10 blur-[120px]"
        aria-hidden="true"
        style={{
          transform: noMotion
            ? undefined
            : `translate3d(${parallax.x * -0.4}px, ${parallax.y * -0.4}px, 0)`,
        }}
      />

      {/* Keyframes for gradient text animation */}
      <style>{`
        @keyframes heroGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <Container>
        {/* Header */}
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-purple-400"
            initial={noMotion ? false : { opacity: 0, y: 10 }}
            animate={isInView || noMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: EASE_CINEMATIC }}
          >
            Area Clienti
          </motion.p>

          <div
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {/* Line 1 */}
            <div className="overflow-hidden pb-1">
              <motion.div
                initial={noMotion ? false : { y: "105%" }}
                animate={isInView || noMotion ? { y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE_CINEMATIC, delay: 0.1 }}
                className="text-white"
              >
                Fai tutto da casa,
              </motion.div>
            </div>
            {/* Line 2 */}
            <div className="overflow-hidden pb-1">
              <motion.div
                initial={noMotion ? false : { y: "105%" }}
                animate={isInView || noMotion ? { y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE_CINEMATIC, delay: 0.2 }}
              >
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #5E0ED7, #a855f7, #22d3ee, #5E0ED7)",
                    backgroundSize: "300% 100%",
                    animation: noMotion ? "none" : "heroGradientShift 5s ease infinite",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ci pensiamo noi
                </span>
              </motion.div>
            </div>
          </div>

          <motion.p
            className="text-base text-white/45 md:text-lg"
            initial={noMotion ? false : { opacity: 0, y: 12 }}
            animate={isInView || noMotion ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: EASE_CINEMATIC, delay: 0.35 }}
          >
            Spedizioni, visure, CAF, consulenze e fotocopie. Apri la pratica da casa,
            noi la portiamo avanti e ti aggiorniamo.
          </motion.p>
        </div>

        {/* Grid: cards + detail panel */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Service cards */}
          <div
            className="grid gap-4 md:grid-cols-2"
            onMouseEnter={() => setIsHoveringCards(true)}
            onMouseLeave={() => setIsHoveringCards(false)}
          >
            {clientAreas.map((area, index) => {
              const isActive = area.key === activeArea.key;
              const title = cardTitle(area);
              return (
                <motion.button
                  key={area.key}
                  type="button"
                  onClick={() => setActiveKey(area.key)}
                  className={`min-h-[44px] cursor-pointer rounded-2xl border p-6 text-left backdrop-blur-sm transition-all ${
                    isActive
                      ? "border-[#5E0ED7]/50 bg-[#5E0ED7]/10 shadow-[0_0_30px_rgba(94,14,215,0.15)]"
                      : "border-white/10 bg-white/3 hover:-translate-y-0.5 hover:border-white/20"
                  }`}
                  initial={noMotion ? false : { opacity: 0, y: 24 }}
                  animate={isInView || noMotion ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                    delay: index * 0.06,
                  }}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                      isActive ? "text-purple-400" : "text-white/30"
                    }`}
                  >
                    {area.eyebrow}
                  </p>
                  <h3
                    className={`mt-3 text-xl font-bold text-white ${
                      area.key === "consulenza-utenze" ? "whitespace-nowrap" : ""
                    }`}
                  >
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-white/45">{area.subtitle}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-7 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeArea.key}
                initial={noMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={noMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE_CINEMATIC }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                  {activeArea.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  {cardTitle(activeArea)}
                </h3>
                <p className="mt-3 text-sm text-white/50">{activeArea.description}</p>

                <ul className="mt-5 space-y-2 text-sm text-white/50">
                  {activeArea.highlights.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#5E0ED7]" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={activeArea.path}
                    className="inline-flex rounded-full bg-linear-to-r from-[#5E0ED7] to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(94,14,215,0.3)] transition hover:shadow-[0_0_30px_rgba(94,14,215,0.45)]"
                  >
                    {activeArea.cta}
                  </Link>
                  <Link
                    href="/area-clienti"
                    className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/30"
                  >
                    Scopri l&apos;Area Clienti
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {metrics.map((metric) => (
                    <MetricCounter
                      key={`${activeArea.key}-${metric.label}`}
                      target={metric.value}
                      label={metric.label}
                      resetKey={activeArea.key}
                    />
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  {clientAreas.map((area, index) => (
                    <span
                      key={`dot-${area.key}`}
                      className={`h-1.5 rounded-full transition-all ${
                        area.key === activeArea.key
                          ? "w-8 bg-[#5E0ED7]"
                          : "w-1.5 bg-white/20"
                      }`}
                      style={{ opacity: index === activeIndex ? 1 : 0.7 }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
