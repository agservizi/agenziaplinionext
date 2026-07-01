"use client";

import SplineScene from "@/components/spline/SplineScene";
import { googleReviewsCount } from "@/lib/google-reviews";

const SERVICES = [
  "Telefonia",
  "Energia",
  "SPID · PEC",
  "Spedizioni",
  "Pagamenti",
  "Web Agency",
];

export default function HomeSplinePanel({ isOpen }: { isOpen: boolean | null }) {
  return (
    <div className="space-y-4" data-gsap-reveal>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Experience desk</p>
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

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <SplineScene className="h-[240px] md:h-[280px]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {SERVICES.map((service) => (
          <div
            key={service}
            className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-center transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/10"
          >
            <p className="text-[11px] font-medium text-slate-300">{service}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/8 p-4">
          <span className="text-lg leading-none text-amber-400">★★★★★</span>
          <p className="mt-1 text-sm font-bold text-white">5.0 su Google</p>
          <p className="text-xs text-slate-400">{googleReviewsCount} recensioni</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-400">
          Via Plinio il Vecchio 72, Castellammare di Stabia (NA)
        </div>
      </div>
    </div>
  );
}