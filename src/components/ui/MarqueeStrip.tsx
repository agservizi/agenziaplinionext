"use client";

const ITEMS = [
  "Bollettini",
  "PagoPA",
  "SPID",
  "PEC",
  "Firma digitale",
  "BRT",
  "InPost",
  "Luce e gas",
  "Telefonia",
  "CAF",
  "Deposito bagagli",
  "Fermo deposito",
];

export default function MarqueeStrip() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative overflow-hidden border-y border-white/8 bg-slate-950 py-4"
      data-gsap-marquee="26"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-slate-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-slate-950 to-transparent" />
      <div className="flex w-max gap-10 whitespace-nowrap px-6" data-gsap-marquee-track>
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.22em] text-white/55"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-cyan-400/80" />
          </span>
        ))}
      </div>
    </div>
  );
}
