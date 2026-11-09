"use client";

import { useState } from "react";
import { serviceCategories } from "@/lib/site-data";

const iconMap: Record<string, React.ReactNode> = {
  payments: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="0" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  energy: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M13 2L4.5 13.5H11L10 22l9.5-12H13L13 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" />
    </svg>
  ),
  logistics: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M20 7L12 3L4 7M20 7v10l-8 4M20 7l-8 4M4 7v10l8 4M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2c-2.8 2.8-4 6.2-4 10s1.2 7.2 4 10M12 2c2.8 2.8 4 6.2 4 10s-1.2 7.2-4 10M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  ),
};

export default function ServiziFilterGrid() {
  const [active, setActive] = useState<string>("all");

  const visible = active === "all"
    ? serviceCategories
    : serviceCategories.filter((c) => c.id === active);

  const tabBase =
    "border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200";
  const tabIdle =
    "border-[var(--ink)]/15 bg-transparent text-[var(--ink)]/55 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]";
  const tabActive = "border-[var(--ink)] bg-[var(--ink)] text-white";

  return (
    <div className="space-y-10">
      {/* Filter bar — sharp ink tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`${tabBase} ${active === "all" ? tabActive : tabIdle}`}
        >
          Tutti i servizi
        </button>
        {serviceCategories.map((cat) => {
          const isActive = active === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`${tabBase} ${isActive ? tabActive : tabIdle}`}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {visible.map((cat) => (
          <div
            key={cat.id}
            id={cat.id}
            className="scroll-mt-24 border border-[var(--ink)]/15 bg-[var(--paper)]"
          >
            {/* Category header */}
            <div className="flex items-center gap-4 border-b border-[var(--ink)]/10 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--ink)]/15 text-[var(--ink)]">
                {iconMap[cat.icon]}
              </div>
              <div>
                <h3 className="text-lg font-bold uppercase tracking-[0.06em] text-[var(--ink)] sm:text-xl">
                  {cat.title}
                </h3>
                <p className="mt-0.5 text-sm text-[var(--ink)]/55">{cat.subtitle}</p>
              </div>
            </div>

            {/* Items grid — sharp cells */}
            <div className="grid gap-px bg-[var(--ink)]/10 md:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-3 bg-[var(--paper)] px-5 py-5 transition-colors hover:bg-[color-mix(in_srgb,var(--paper)_92%,var(--ink))] sm:px-6"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--ink)]" />
                  <div>
                    <p className="text-sm font-bold text-[var(--ink)]">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--ink)]/55">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
