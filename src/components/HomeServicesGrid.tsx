"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { serviceCategories, type ServiceCategory } from "@/lib/site-data";
import {
  PaymentsIcon,
  PhoneIcon,
  EnergyIcon,
  LogisticsIcon,
  DigitalIcon,
  WebIcon,
} from "@/components/Icons";
import { StaggerContainer, StaggerItem } from "@/components/ui/Stagger";

const icons: Record<string, React.FC> = {
  payments: PaymentsIcon,
  phone: PhoneIcon,
  energy: EnergyIcon,
  logistics: LogisticsIcon,
  digital: DigitalIcon,
  web: WebIcon,
};

const accents: Record<
  string,
  { bg: string; text: string; ring: string; pill: string; glow: string; border: string }
> = {
  payments: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600",
    ring: "ring-cyan-400/25",
    pill: "bg-cyan-50 text-cyan-700 ring-cyan-500/15",
    glow: "group-hover:shadow-cyan-400/10",
    border: "from-cyan-400 to-teal-400",
  },
  phone: {
    bg: "bg-violet-500/10",
    text: "text-violet-600",
    ring: "ring-violet-400/25",
    pill: "bg-violet-50 text-violet-700 ring-violet-500/15",
    glow: "group-hover:shadow-violet-400/10",
    border: "from-violet-400 to-purple-400",
  },
  energy: {
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    ring: "ring-amber-400/25",
    pill: "bg-amber-50 text-amber-700 ring-amber-500/15",
    glow: "group-hover:shadow-amber-400/10",
    border: "from-amber-400 to-orange-400",
  },
  logistics: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    ring: "ring-emerald-400/25",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-500/15",
    glow: "group-hover:shadow-emerald-400/10",
    border: "from-emerald-400 to-green-400",
  },
  digital: {
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    ring: "ring-blue-400/25",
    pill: "bg-blue-50 text-blue-700 ring-blue-500/15",
    glow: "group-hover:shadow-blue-400/10",
    border: "from-blue-400 to-indigo-400",
  },
  web: {
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    ring: "ring-rose-400/25",
    pill: "bg-rose-50 text-rose-700 ring-rose-500/15",
    glow: "group-hover:shadow-rose-400/10",
    border: "from-rose-400 to-pink-400",
  },
};

export default function HomeServicesGrid() {
  const [selected, setSelected] = useState<ServiceCategory | null>(null);
  const close = useCallback(() => setSelected(null), []);

  /* lock body scroll when modal open */
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [selected]);

  /* close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* ── Cards grid ─── */}
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {serviceCategories.map((cat, index) => {
          const Icon = icons[cat.icon];
          const a = accents[cat.icon];
          const isHero = index === 0;
          const isLast = index === serviceCategories.length - 1;

          /* ── Web Agency: full-width banner card (keeps Link) ─── */
          if (isLast) {
            return (
              <StaggerItem key={cat.id} className="sm:col-span-2 lg:col-span-3">
                <Link
                  href="/web-agency"
                  className="group relative flex overflow-hidden rounded-2xl bg-linear-to-r from-rose-50 via-white to-pink-50 ring-1 ring-rose-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-400/10"
                >
                  <div className="flex w-full flex-col items-center gap-4 p-6 md:flex-row md:gap-8 md:p-8">
                    <div
                      className={`shrink-0 rounded-2xl ${a.bg} p-4 ${a.text} ring-1 ${a.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-lg font-semibold text-slate-900">{cat.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{cat.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {cat.items.map((item) => (
                        <span
                          key={item.title}
                          className={`inline-block rounded-full px-2.5 py-0.75 text-[11px] font-medium ring-1 ${a.pill}`}
                        >
                          {item.title}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold ${a.text} ring-1 ${a.ring} shadow-sm transition-all duration-300 group-hover:gap-3 group-hover:shadow-md`}
                    >
                      Scopri
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4.5 10h11M10.5 5l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          }

          /* ── Standard service cards: open modal on click ─── */
          return (
            <StaggerItem key={cat.id} className={isHero ? "sm:col-span-2" : ""}>
              <button
                type="button"
                onClick={() => setSelected(cat)}
                className={`lux-card group relative block h-full w-full cursor-pointer overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(15,23,42,0.14)] ${a.glow}`}
              >
                {/* Gradient accent bar */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-linear-to-b ${a.border} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 rounded-xl ${a.bg} p-3 ${a.text} ring-1 ${a.ring} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900">{cat.title}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 20 20"
                    className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${a.text} opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60`}
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 10h11M10.5 5l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Service pills */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {cat.items.slice(0, isHero ? 6 : 3).map((item) => (
                    <span
                      key={item.title}
                      className={`inline-block rounded-full px-2.5 py-0.75 text-[11px] font-medium ring-1 ${a.pill}`}
                    >
                      {item.title}
                    </span>
                  ))}
                  {cat.items.length > (isHero ? 6 : 3) && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.75 text-[11px] font-semibold ${a.text}`}
                    >
                      +{cat.items.length - (isHero ? 6 : 3)} altri
                    </span>
                  )}
                </div>

                {/* Service count footer */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    <span className={`font-semibold ${a.text}`}>{cat.items.length}</span> servizi
                    disponibili
                  </span>
                  <span
                    className={`text-xs font-medium ${a.text} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  >
                    Scopri →
                  </span>
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* ── Modal with boomerang spring effect ─── */}
      {typeof document !== "undefined" && createPortal(
      <>
      <AnimatePresence>
        {selected && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-70 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (() => {
          const Icon = icons[selected.icon];
          const a = accents[selected.icon];
          const href =
            selected.icon === "web" ? "/web-agency" : `/servizi#${selected.id}`;

          return (
            <motion.div
              key="modal"
              className="pointer-events-none fixed inset-0 z-70 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.4, y: 60, rotate: -2 }}
              animate={{
                opacity: [0, 1, 1, 1],
                scale: [0.4, 1.08, 0.97, 1],
                y: [60, -12, 4, 0],
                rotate: [-2, 1.5, -0.5, 0],
              }}
              exit={{
                opacity: [1, 0.6, 0],
                scale: [1, 1.06, 0.4],
                y: [0, -8, 60],
                rotate: [0, 1, -2],
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.45, 0.75, 1],
              }}
            >
              <div
                className="pointer-events-auto relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gradient accent bar */}
                <div className={`h-1.5 w-full rounded-t-3xl bg-linear-to-r ${a.border}`} />

                <div className="p-7 md:p-10">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={close}
                    className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Chiudi"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`shrink-0 rounded-xl ${a.bg} p-3.5 ${a.text} ring-1 ${a.ring}`}
                    >
                      <Icon />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{selected.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-500">{selected.subtitle}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 h-px bg-slate-100" />

                  {/* Services grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.items.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.05, duration: 0.35 }}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-slate-200 hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${a.bg} ${a.text}`}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={href}
                      className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md bg-linear-to-r ${a.border}`}
                    >
                      Scopri di più
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4.5 10h11M10.5 5l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={close}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Chiudi
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      </>
      , document.body)}
    </>
  );
}
