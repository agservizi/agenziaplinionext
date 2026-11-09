"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Container from "@/components/Container";
import { GsapSplitText } from "@/components/motion/GsapSplitText";
import { MagneticLink } from "@/components/motion/MagneticLink";
import ServiceMotionIcon, {
  type ServiceMotionIconId,
} from "@/components/media/ServiceMotionIcon";
import { TextShimmer } from "@/components/ui/21st/text-shimmer";
import { CardSpotlight } from "@/components/ui/21st/card-spotlight";
import { cn } from "@/lib/utils";

const SplineScene = dynamic(() => import("@/components/spline/SplineScene"), { ssr: false });

const actions = [
  {
    title: "Deposito bagagli",
    description: "Prenota online, deposita in agenzia e paga a giornata.",
    href: "/deposito-bagagli",
    tag: "Prenotazione",
    icon: "luggage" as ServiceMotionIconId,
    span: "md:col-span-2 md:row-span-2",
    accent: "from-cyan-500/20 to-[#5E0ED7]/10",
    featured: true,
  },
  {
    title: "Fermo deposito",
    description: "Custodia pacchi da 0,50€ al giorno con codice LP.",
    href: "/fermo-deposito",
    tag: "Locker Point",
    icon: "locker" as ServiceMotionIconId,
    span: "",
    accent: "from-[#5E0ED7]/20 to-cyan-500/5",
    featured: false,
  },
  {
    title: "Invio pratiche",
    description: "Carica l'avviso, paga online e seguiamo la pratica.",
    href: "/send",
    tag: "SEND",
    icon: "send" as ServiceMotionIconId,
    span: "",
    accent: "from-violet-500/15 to-cyan-500/10",
    featured: false,
  },
  {
    title: "Area clienti",
    description: "Contratti, visure, CAF, SEND e deposito: pratiche Gestiio da casa.",
    href: "/area-clienti",
    tag: "Gestiio",
    icon: "client" as ServiceMotionIconId,
    span: "md:col-span-2",
    accent: "from-emerald-500/10 to-cyan-500/10",
    featured: false,
  },
] as const;

export default function HomeOnlineBento() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      className="relative overflow-hidden bg-slate-950 py-20 md:py-24"
      data-gsap-reveal
      aria-labelledby="home-online-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(94,14,215,0.18),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(34,211,238,0.12),transparent_45%)]"
      />

      <Container className="relative">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Online, senza fila
          </p>
          <GsapSplitText
            id="home-online-title"
            chars
            className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Prenota e gestisci da casa.
          </GsapSplitText>
          <p className="mt-4 text-base leading-relaxed text-slate-400" data-gsap-text-split>
            Deposito bagagli, fermo deposito, invio pratiche e area clienti: quattro
            servizi che puoi avviare online prima di passare in sede.
          </p>
        </div>

        <div
          className="grid gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5"
          data-gsap-stagger
        >
          {actions.map((action) => (
            <div
              key={action.href}
              data-gsap-stagger-item
              data-gsap-scale
              className={cn(action.span)}
              onMouseEnter={() => setHovered(action.href)}
              onMouseLeave={() => setHovered(null)}
            >
              <MagneticLink href={action.href} className="group block h-full">
                <CardSpotlight
                  className={cn(
                    "relative flex h-full min-h-[140px] flex-col justify-between overflow-hidden bg-linear-to-br p-6 md:min-h-[160px]",
                    action.accent,
                  )}
                >
                  {action.featured ? (
                    <div className="pointer-events-none absolute inset-0 opacity-40" data-gsap-clip>
                      <SplineScene className="h-full min-h-[220px]" />
                    </div>
                  ) : null}
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                        {action.tag}
                      </span>
                      <ServiceMotionIcon
                        id={action.icon}
                        className="h-8 w-8 opacity-90"
                        hover={hovered === action.href}
                      />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white">
                      <TextShimmer>{action.title}</TextShimmer>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {action.description}
                    </p>
                  </div>
                  <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 transition group-hover:gap-2">
                    Vai
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
                      <path
                        d="M4.5 10h11M10.5 5l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </CardSpotlight>
              </MagneticLink>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
