"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Container from "./Container";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const steps = [
  {
    label: "01",
    title: "Leggiamo l’avviso",
    description: "Controlliamo IUN, scadenze, ente mittente e documenti richiesti.",
  },
  {
    label: "02",
    title: "Prepariamo la pratica",
    description: "Verifichiamo identità, deleghe e allegati prima dell’invio.",
  },
  {
    label: "03",
    title: "Seguiamo l’esito",
    description: "La richiesta resta tracciata fino alla chiusura della lavorazione.",
  },
];

function SendMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 300"
      className="h-auto w-full"
      fill="none"
    >
      <defs>
        <linearGradient id="send-envelope" x1="80" y1="52" x2="336" y2="252">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="send-route" x1="52" y1="240" x2="376" y2="60">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <filter id="send-shadow" x="28" y="18" width="364" height="274">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#1E1B4B" floodOpacity=".2" />
        </filter>
      </defs>

      <path
        d="M44 238C104 199 110 258 174 216C231 179 260 107 377 68"
        stroke="url(#send-route)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 10"
      />
      <circle cx="45" cy="238" r="7" fill="#22D3EE" />
      <circle cx="377" cy="68" r="8" fill="#A855F7" />
      <circle cx="377" cy="68" r="15" stroke="#A855F7" strokeOpacity=".28" />

      <g filter="url(#send-shadow)">
        <rect x="83" y="54" width="254" height="190" rx="23" fill="url(#send-envelope)" />
        <path d="M94 76L210 166L326 76" stroke="#5E0ED7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M94 222L177 145M326 222L243 145" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
        <rect x="112" y="83" width="68" height="12" rx="6" fill="#DDD6FE" />
        <rect x="112" y="104" width="42" height="8" rx="4" fill="#EDE9FE" />
      </g>

      <g transform="translate(286 190)">
        <circle cx="36" cy="36" r="35" fill="#5E0ED7" />
        <path d="M36 18V39M36 52.5V53" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <circle cx="36" cy="36" r="27" stroke="white" strokeOpacity=".18" />
      </g>
    </svg>
  );
}

export default function HomeSendSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.18 });
  const reducedMotion = useReducedMotion();
  const visible = isInView || reducedMotion;

  return (
    <section
      ref={ref}
      aria-labelledby="send-home-title"
      className="relative overflow-hidden bg-[#11102a] py-24 text-white md:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[#5E0ED7]/30 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[#22D3EE]/15 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 32 }}
            animate={visible ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="mb-7 inline-flex items-center gap-3 rounded-none border border-white/15 bg-white/[0.07] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-cyan-300 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-none bg-cyan-300" />
              </span>
              Nuovo servizio
            </div>

            <p className="mb-4 text-sm font-semibold text-violet-300">
              Hai ricevuto una notifica SEND?
            </p>
            <h2
              id="send-home-title"
              className="max-w-3xl pb-2 text-4xl font-black leading-[1.08] tracking-[-0.035em] sm:text-5xl md:text-6xl"
            >
              Dall’avviso alla pratica,
              <span className="block pb-[0.12em] bg-linear-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                senza perderti un passaggio.
              </span>
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Ti aiutiamo a verificare la notifica digitale, preparare i documenti e
              seguire la richiesta. Sai subito cosa serve, cosa manca e a che punto siamo.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Caller: HomeContent; no API. User: "il pulsante in home sezione send è tutto bianco e testo bianco" */}
              <Link
                href="/send"
                className="group inline-flex min-h-12 items-center justify-center gap-3 bg-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#21134f] transition-colors hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
              >
                Avvia la pratica SEND
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none">
                  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <span className="px-2 text-xs leading-5 text-slate-400">
                Porta l’avviso e un documento d’identità.
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 36, rotate: 1.5 }}
            animate={visible ? { opacity: 1, x: 0, rotate: 0 } : undefined}
            transition={{ duration: 0.95, ease: EASE, delay: 0.12 }}
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="relative rounded-none border border-white/12 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-sm sm:p-8">
              <div className="absolute left-7 top-7 z-10 rounded-none border border-violet-300/25 bg-[#171334]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
                Notifica tracciata
              </div>
              <SendMark />
              <div className="grid gap-2 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    animate={visible ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.3 + index * 0.1 }}
                    className="rounded-none border border-white/10 bg-[#171334]/80 p-4"
                  >
                    <span className="text-[10px] font-black tracking-[0.18em] text-cyan-300">
                      {step.label}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-400">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
