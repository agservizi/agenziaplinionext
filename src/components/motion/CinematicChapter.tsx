"use client";

import dynamic from "next/dynamic";
import { MagneticLink } from "@/components/motion/MagneticLink";
import LottiePlayer from "@/components/media/LottiePlayer";
import RivePlayer from "@/components/media/RivePlayer";
import { sparkLottie } from "@/lib/motion/lottie-icons";

const SplineScene = dynamic(() => import("@/components/spline/SplineScene"), { ssr: false });

const CHAPTERS = [
  {
    title: "Pagamenti",
    copy: "Bollettini, PagoPA e F24: li fai in sede, senza code e senza giri.",
  },
  {
    title: "Identità digitale",
    copy: "SPID, PEC e firma digitale attivi mentre sei al bancone, con chi sa cosa serve.",
  },
  {
    title: "Spedizioni",
    copy: "BRT, InPost, deposito bagagli e fermo deposito: parti da Via Plinio 72.",
  },
  {
    title: "Utenze",
    copy: "Telefonia, luce e gas: ti diciamo costi e tempi, poi scegli tu.",
  },
] as const;

export default function CinematicChapter() {
  return (
    <section
      className="relative isolate overflow-hidden bg-black text-white"
      data-gsap-stack
      aria-labelledby="cinematic-chapter-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(94,14,215,0.28),transparent_42%),radial-gradient(ellipse_at_90%_80%,rgba(34,211,238,0.16),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center gap-12 px-6 py-28 md:flex-row md:items-center md:gap-16 md:px-12">
        <div className="relative max-w-2xl flex-1">
          <h2 id="cinematic-chapter-title" className="sr-only">
            Cosa facciamo in agenzia
          </h2>

          <div className="relative hidden min-h-[7.5rem] md:block sm:min-h-[9rem]">
            {CHAPTERS.map((chapter, index) => (
              <h2
                key={chapter.title}
                id={undefined}
                data-gsap-stack-item
                className="absolute inset-x-0 top-0 font-black uppercase tracking-tight"
                style={{
                  fontSize: "clamp(3.2rem, 9vw, 7.2rem)",
                  lineHeight: 0.88,
                  letterSpacing: "-0.04em",
                }}
              >
                {chapter.title}
              </h2>
            ))}
          </div>

          <div className="space-y-8 md:hidden">
            {CHAPTERS.map((chapter, index) => (
              <div key={chapter.title}>
                <h2
                  id={index === 0 ? "cinematic-chapter-title-mobile" : undefined}
                  className="font-black uppercase tracking-tight"
                  style={{ fontSize: "clamp(2.4rem, 12vw, 3.4rem)", lineHeight: 0.9 }}
                >
                  {chapter.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-white/60">{chapter.copy}</p>
              </div>
            ))}
          </div>

          <svg
            data-gsap-draw
            viewBox="0 0 420 24"
            className="mt-8 h-6 w-48 text-[#22d3ee]"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 12h70c18 0 18-10 36-10s18 20 36 20 18-20 36-20 18 20 36 20 18-10 36-10h132"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative mt-8 hidden min-h-[4.5rem] md:block">
            {CHAPTERS.map((chapter) => (
              <p
                key={chapter.copy}
                data-gsap-stack-copy
                className="absolute inset-x-0 top-0 max-w-md text-base leading-relaxed text-white/60 sm:text-lg"
              >
                {chapter.copy}
              </p>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
            <RivePlayer className="h-10 w-10" />
            <LottiePlayer animationData={sparkLottie} className="h-10 w-10" />
            <MagneticLink
              href="/servizi"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm"
            >
              Tutti i servizi
            </MagneticLink>
          </div>
        </div>

        <div
          className="relative hidden w-full max-w-md flex-1 md:block"
          data-gsap-parallax="70"
          data-gsap-skew
        >
          <SplineScene className="h-[420px] shadow-[0_40px_140px_rgba(94,14,215,0.28)]" />
        </div>
      </div>
    </section>
  );
}
