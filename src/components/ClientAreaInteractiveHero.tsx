"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clientAreas, type ClientAreaConfig } from "@/lib/client-area";

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

function MetricCounter({ target, label, resetKey }: { target: number; label: string; resetKey: string }) {
  const value = useCountUp(target, resetKey);
  return (
    <div className="rounded-xl border border-cyan-300/20 bg-slate-900/55 p-3 text-center">
      <p className="text-lg font-semibold text-cyan-300">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

export default function ClientAreaInteractiveHero() {
  const [activeKey, setActiveKey] = useState(clientAreas[0]?.key ?? "spedizioni");
  const [isHoveringCards, setIsHoveringCards] = useState(false);
  const [ctaPulseOnce, setCtaPulseOnce] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

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

  return (
    <section
      className="hero-gradient relative isolate overflow-hidden bg-slate-950 py-20 md:py-28"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
        setParallax({ x, y });
      }}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
    >
      <div
        className="client-hero-parallax"
        aria-hidden="true"
        style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}
      />
      <div className="hero-grid-glow" aria-hidden="true" />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Area Clienti</p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Gestisci tutto online, senza passare in sede
          </h2>
          <p className="text-base text-slate-300 md:text-lg">
            Un portale dedicato dove puoi inviare richieste, seguire le pratiche e ricevere aggiornamenti in tempo reale.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div
            className="grid gap-4 md:grid-cols-2"
            onMouseEnter={() => setIsHoveringCards(true)}
            onMouseLeave={() => setIsHoveringCards(false)}
          >
            {clientAreas.map((area, index) => {
              const isActive = area.key === activeArea.key;
              const title = cardTitle(area);
              return (
                <button
                  key={area.key}
                  type="button"
                  onClick={() => setActiveKey(area.key)}
                  className={`premium-panel client-hero-card text-left rounded-3xl p-6 transition ${
                    isActive
                      ? "client-hero-card-active border-cyan-300/60 ring-1 ring-cyan-300/50 shadow-[0_26px_60px_rgba(6,182,212,0.25)]"
                      : "border-cyan-900/40 hover:-translate-y-0.5"
                  }`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">{area.eyebrow}</p>
                  <h3 className={`mt-3 text-xl font-semibold text-white ${area.key === "consulenza-utenze" ? "whitespace-nowrap" : ""}`}>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{area.subtitle}</p>
                </button>
              );
            })}
          </div>

          <div className="glass-card rounded-3xl p-7">
            <div key={activeArea.key} className="client-hero-panel-enter">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{activeArea.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{cardTitle(activeArea)}</h3>
            <p className="mt-3 text-sm text-slate-300">{activeArea.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              {activeArea.highlights.slice(0, 3).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={activeArea.path}
                className={`inline-flex rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 ${
                  ctaPulseOnce ? "client-hero-cta-pulse cta-shine-once" : ""
                }`}
              >
                {activeArea.cta}
              </Link>
              <Link
                href="/area-clienti"
                className="inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Scopri l'Area Clienti
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
                    area.key === activeArea.key ? "w-8 bg-cyan-300" : "w-1.5 bg-slate-500"
                  }`}
                  style={{ opacity: index === activeIndex ? 1 : 0.7 }}
                />
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
