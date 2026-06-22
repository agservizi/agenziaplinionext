"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const ACCENT = "#5E0ED7";
const ACCENT_LIGHT = "#a855f7";
const CYAN = "#22d3ee";
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4";

const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

interface StatItem {
  value: number;
  label: string;
}

export interface VideoHeroProps {
  headingWords: [string, string, string];
  stats: [StatItem, StatItem, StatItem];
  tagline: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  onCtaClick?: () => void;
}

function useCountUp(target: number, durationMs: number, delayMs: number) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(target);
      return;
    }
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [target, durationMs, delayMs, reduced]);

  return count;
}

function CounterStat({ stat, index }: { stat: StatItem; index: number }) {
  const count = useCountUp(stat.value, 1800, 1200 + index * 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + index * 0.15, duration: 0.6, ease: SPRING_EASE }}
      className="text-center sm:text-left"
    >
      <p className="font-black leading-none text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
        <span style={{ color: ACCENT }}>+</span>
        {count}
      </p>
      <p className="mt-1 whitespace-pre-line text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/40 sm:text-xs">
        {stat.label}
      </p>
    </motion.div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 0.8 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:bottom-8"
    >
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30">
          Scorri
        </span>
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          <path
            d="M7 3v14M2 12l5 5 5-5"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function VideoHero({
  headingWords,
  stats,
  tagline,
  description,
  ctaText,
  ctaHref,
  ctaExternal,
  onCtaClick,
}: VideoHeroProps) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  const dur = reduced ? 0.01 : 1;
  const headingDelay = (i: number) => (reduced ? 0 : 0.3 + i * 0.15);
  const lineDelay = reduced ? 0 : 0.9;
  const textDelay = reduced ? 0 : 1.1;
  const ctaDelay = reduced ? 0 : 1.5;

  const ctaClassName =
    "group relative inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:border-[#5E0ED7]/60 hover:bg-[#5E0ED7]/10 hover:shadow-[0_0_40px_rgba(94,14,215,0.25)] sm:px-9 sm:py-4 sm:text-base";

  const ctaArrow = (
    <svg
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );

  const ctaElement = onCtaClick ? (
    <button type="button" onClick={onCtaClick} className={ctaClassName}>
      {ctaText}
      {ctaArrow}
    </button>
  ) : ctaExternal ? (
    <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={ctaClassName}>
      {ctaText}
      {ctaArrow}
    </a>
  ) : (
    <Link href={ctaHref!} className={ctaClassName}>
      {ctaText}
      {ctaArrow}
    </Link>
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-dvh flex-col overflow-hidden bg-black"
      style={{ fontFamily: "var(--font-inter, 'Inter'), sans-serif" }}
    >
      {/* ── Video background with parallax ── */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: reduced ? 0 : videoY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          className="h-[120%] w-full object-cover"
          style={{ opacity: 0.45 }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </motion.div>

      {/* ── Cinematic dark overlay ── */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />

      {/* ── Film grain texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }}
      />

      {/* ── Floating glow orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="orb-float-1 absolute -left-32 top-1/4 h-[350px] w-[350px] rounded-full opacity-20 blur-[120px] md:h-[500px] md:w-[500px]"
          style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
        />
        <div
          className="orb-float-2 absolute -right-24 bottom-1/3 h-[280px] w-[280px] rounded-full opacity-12 blur-[100px] md:h-[400px] md:w-[400px]"
          style={{ background: `radial-gradient(circle, ${CYAN}, transparent 70%)` }}
        />
      </div>

      {/* ── Header spacer ── */}
      <div className="shrink-0 pt-24 sm:pt-28 md:pt-32" />

      {/* ── Main content with fade on scroll ── */}
      <motion.div
        className="relative flex flex-1 flex-col justify-end px-6 pb-16 sm:pb-20 md:px-14 md:pb-24"
        style={reduced ? undefined : { opacity: contentOpacity, y: contentY }}
      >
        {/* Grid: heading + stats */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          {/* Left column: heading + description */}
          <div className="max-w-3xl">
            {/* ── Massive heading with reveal ── */}
            <h1 className="m-0 p-0">
              {headingWords.map((word, i) => (
                <div key={word} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: headingDelay(i), duration: dur * 0.9, ease: SPRING_EASE }}
                  >
                    {i === headingWords.length - 1 ? (
                      <span
                        className="block font-black uppercase"
                        style={{
                          fontSize: "clamp(3rem, 11vw, 9.5rem)",
                          lineHeight: 0.9,
                          letterSpacing: "-0.02em",
                          backgroundImage: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT}, ${CYAN}, ${ACCENT})`,
                          backgroundSize: "300% 100%",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          animation: reduced ? "none" : "heroGradientShift 5s ease infinite",
                        }}
                      >
                        {word}
                        <span
                          style={{
                            WebkitTextFillColor: "rgba(255,255,255,0.9)",
                          }}
                        >
                          .
                        </span>
                      </span>
                    ) : (
                      <span
                        className="block font-black uppercase text-white"
                        style={{
                          fontSize: "clamp(3rem, 11vw, 9.5rem)",
                          lineHeight: 0.9,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {word}
                      </span>
                    )}
                  </motion.div>
                </div>
              ))}
            </h1>

            {/* ── Animated gradient line ── */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: lineDelay, duration: dur * 1.4, ease: SPRING_EASE }}
              className="mt-6 h-px origin-left sm:mt-8"
              style={{
                backgroundImage: `linear-gradient(90deg, ${ACCENT}, ${CYAN}, transparent)`,
              }}
            />

            {/* ── Description ── */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: textDelay, duration: dur * 0.7, ease: SPRING_EASE }}
              className="mt-5 max-w-md text-sm leading-relaxed text-white/50 sm:mt-6 sm:text-base"
            >
              {description}
            </motion.p>

            {/* ── CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ctaDelay, duration: dur * 0.6, ease: SPRING_EASE }}
              className="mt-7 sm:mt-8"
            >
              {ctaElement}
            </motion.div>
          </div>

          {/* Right column: stats */}
          <div className="flex gap-6 sm:gap-8 lg:flex-col lg:gap-6 lg:pb-4">
            {stats.map((stat, i) => (
              <CounterStat key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <ScrollIndicator />
    </section>
  );
}
