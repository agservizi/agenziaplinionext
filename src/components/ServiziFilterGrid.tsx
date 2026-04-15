"use client";

import { useState } from "react";
import { serviceCategories } from "@/lib/site-data";

const iconMap: Record<string, React.ReactNode> = {
  payments: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  energy: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M13 2L4.5 13.5H11L10 22l9.5-12H13L13 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  logistics: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M20 7L12 3L4 7M20 7v10l-8 4M20 7l-8 4M4 7v10l8 4M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  web: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2c-2.8 2.8-4 6.2-4 10s1.2 7.2 4 10M12 2c2.8 2.8 4 6.2 4 10s-1.2 7.2-4 10M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

const accentColors: Record<string, { bg: string; text: string; border: string; activeBg: string; activeText: string }> = {
  payments:  { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200",  activeBg: "bg-violet-600",  activeText: "text-white" },
  phone:     { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200",    activeBg: "bg-cyan-600",    activeText: "text-white" },
  energy:    { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   activeBg: "bg-amber-500",   activeText: "text-white" },
  logistics: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", activeBg: "bg-emerald-600", activeText: "text-white" },
  digital:   { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    activeBg: "bg-blue-600",    activeText: "text-white" },
  web:       { bg: "bg-fuchsia-50", text: "text-fuchsia-600", border: "border-fuchsia-200", activeBg: "bg-fuchsia-600", activeText: "text-white" },
};

export default function ServiziFilterGrid() {
  const [active, setActive] = useState<string>("all");

  const visible = active === "all"
    ? serviceCategories
    : serviceCategories.filter((c) => c.id === active);

  return (
    <div className="space-y-10">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${
            active === "all"
              ? "bg-slate-900 text-white shadow-lg"
              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
          }`}
        >
          Tutti i servizi
        </button>
        {serviceCategories.map((cat) => {
          const c = accentColors[cat.icon] ?? accentColors.web;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                isActive
                  ? `${c.activeBg} ${c.activeText} shadow-lg`
                  : `border ${c.border} ${c.bg} ${c.text} hover:opacity-80`
              }`}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {visible.map((cat) => {
          const c = accentColors[cat.icon] ?? accentColors.web;
          return (
            <div
              key={cat.id}
              id={cat.id}
              className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              {/* Category header */}
              <div className={`flex items-center gap-4 border-b border-slate-100 px-8 py-6`}>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg} ${c.text}`}>
                  {iconMap[cat.icon]}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{cat.title}</h3>
                  <p className="text-sm text-slate-500">{cat.subtitle}</p>
                </div>
              </div>

              {/* Items grid */}
              <div className="grid gap-px bg-slate-100 md:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => (
                  <div
                    key={item.title}
                    className="group flex items-start gap-3 bg-white px-6 py-5 transition hover:bg-slate-50"
                  >
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${c.activeBg}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
