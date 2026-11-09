"use client";

/**
 * Fact-forcing:
 * - Caller: app/page.tsx home VideoHero.
 * - Change: headingWords string[]; last line accent; larger type can spill onto photo.
 * - User: "cambierei il copy nella home hero in TUTTI I TUOI SERVIZI. IN UN UNICO POSTO..."
 */
import { useRef } from "react";
import { Link as ViewLink } from "next-view-transitions";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { NumberTicker } from "@/components/ui/21st/number-ticker";

const ACCENT = "#5E0ED7";
const HERO_IMAGE = "/images/hero-ag-servizi.jpg";
const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface StatItem {
  value: number;
  label: string;
}

export interface VideoHeroProps {
  /** Ultima riga in accento; i punti vanno nel testo (es. "SERVIZI."). */
  headingWords: string[];
  stats: [StatItem, StatItem, StatItem];
  tagline: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  onCtaClick?: () => void;
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
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const dur = reduced ? 0.01 : 0.9;
  const headingDelay = (i: number) => (reduced ? 0 : 0.2 + i * 0.12);

  const ctaClassName =
    "brutal-cta-ink inline-block bg-[var(--ink)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#5E0ED7] sm:text-base";

  const ctaElement = onCtaClick ? (
    <button type="button" onClick={onCtaClick} className={ctaClassName}>
      {ctaText}
    </button>
  ) : ctaExternal ? (
    <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={ctaClassName}>
      {ctaText}
    </a>
  ) : (
    <ViewLink href={ctaHref!} className={ctaClassName}>
      {ctaText}
    </ViewLink>
  );

  return (
    <section
      ref={sectionRef}
      className="relative grid min-h-dvh overflow-x-clip border-b border-[var(--ink)]/10 lg:grid-cols-[46fr_54fr]"
    >
      <div className="relative z-20 flex flex-col justify-end bg-[var(--paper)] px-6 pb-14 pt-28 sm:px-10 md:px-12 md:pb-20 md:pt-32 lg:pr-0">
        <p className="mb-auto text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--ink)]/40 sm:text-xs">
          Castellammare di Stabia / Dal 2016
        </p>

        <h1 className="display-type m-0 max-w-[18ch] p-0 text-[clamp(2.75rem,8.5vw,7.25rem)] leading-[0.92] text-[var(--ink)] lg:-mr-[22vw] lg:max-w-none lg:text-[clamp(3.5rem,7.2vw,8.75rem)]">
          {headingWords.map((word, i) => {
            const isAccent = i === headingWords.length - 1;
            return (
              <span key={`${word}-${i}`} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: headingDelay(i), duration: dur, ease: SPRING_EASE }}
                  style={isAccent ? { color: ACCENT } : undefined}
                >
                  {word}
                </motion.span>
              </span>
            );
          })}
        </h1>

        {tagline ? (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.85, duration: dur * 0.7, ease: SPRING_EASE }}
            className="mt-6 max-w-md whitespace-pre-line text-base font-medium leading-snug text-[var(--ink)] sm:text-lg lg:max-w-lg"
          >
            {tagline}
          </motion.p>
        ) : null}

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1, duration: dur * 0.7, ease: SPRING_EASE }}
          className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ink)]/65 sm:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.15, duration: dur * 0.6, ease: SPRING_EASE }}
          className="mt-8"
        >
          {ctaElement}
        </motion.div>
      </div>

      <div className="relative hidden min-h-[52vh] overflow-hidden lg:block">
        <motion.div className="absolute inset-0" style={{ y: reduced ? 0 : imageY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-[115%] w-full object-cover object-[68%_42%] contrast-[1.02] saturate-[0.92]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-r from-[var(--paper)] via-[var(--paper)]/25 to-transparent" />
        <div className="absolute inset-0 bg-[var(--ink)]/6" />
        <div className="absolute bottom-10 left-10 flex gap-10 text-[var(--ink)]">
          {stats.map((stat, i) => (
            <div key={stat.label}>
              <p className="display-type text-4xl">
                <NumberTicker value={stat.value} delayMs={900 + i * 160} />
              </p>
              <p className="mt-1 whitespace-pre-line text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--ink)]/55">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-8 border-t border-[var(--ink)]/10 bg-[var(--paper)] px-6 py-8 lg:hidden">
        {stats.map((stat, i) => (
          <div key={stat.label}>
            <p className="display-type text-3xl text-[var(--ink)]">
              <NumberTicker value={stat.value} delayMs={700 + i * 140} />
            </p>
            <p className="mt-1 whitespace-pre-line text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
