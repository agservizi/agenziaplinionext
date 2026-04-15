"use client";

import Link from "next/link";
import { readClientPortalTokenPayload } from "@/lib/client-portal-auth";
import { motion } from "framer-motion";

type ServiceTile = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  accentClass: string;
  dotClass: string;
  iconColorClass: string;
  iconBgClass: string;
  icon: React.ReactNode;
};

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 8.5L12 14L21 8.5M12 14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M13 2L4.09 12.96A.5.5 0 0 0 4.5 13.75H11L10 22l9.91-11.96a.5.5 0 0 0-.41-.79H13L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function IconPrinter() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="7" y="2" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 9H19a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="14" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const SERVICE_TILES: ServiceTile[] = [
  {
    href: "/area-clienti/spedizioni",
    eyebrow: "Spedizioni",
    title: "Spedizioni BRT & InPost",
    description: "Crea spedizioni, acquista etichette e monitora i tuoi pacchi da un unico pannello.",
    cta: "Apri spedizioni",
    accentClass: "border-cyan-500/15 bg-linear-to-br from-cyan-500/8 to-transparent hover:border-cyan-400/25",
    dotClass: "bg-cyan-400",
    iconColorClass: "text-cyan-400",
    iconBgClass: "border-cyan-500/20 bg-cyan-500/10",
    icon: <IconBox />,
  },
  {
    href: "/area-clienti/visure",
    eyebrow: "Visure",
    title: "Visure camerali e catastali",
    description: "Richiedi visure PRA, CRIF, camerali e catastali con presa in carico immediata.",
    cta: "Apri visure",
    accentClass: "border-indigo-500/15 bg-linear-to-br from-indigo-500/8 to-transparent hover:border-indigo-400/25",
    dotClass: "bg-indigo-400",
    iconColorClass: "text-indigo-400",
    iconBgClass: "border-indigo-500/20 bg-indigo-500/10",
    icon: <IconDoc />,
  },
  {
    href: "/area-clienti/caf-patronato",
    eyebrow: "CAF & Patronato",
    title: "Pratiche CAF e patronato",
    description: "ISEE, 730, pensioni e bonus. Avvia la pratica online e allega i documenti già pronti.",
    cta: "Apri CAF",
    accentClass: "border-emerald-500/15 bg-linear-to-br from-emerald-500/8 to-transparent hover:border-emerald-400/25",
    dotClass: "bg-emerald-400",
    iconColorClass: "text-emerald-400",
    iconBgClass: "border-emerald-500/20 bg-emerald-500/10",
    icon: <IconClipboard />,
  },
  {
    href: "/area-clienti/consulenza-utenze",
    eyebrow: "Consulenza Utenze",
    title: "Telefonia, luce e gas",
    description: "Invia il tuo profilo forniture e ricevi un'analisi personalizzata per risparmiare sulle bollette.",
    cta: "Richiedi consulenza",
    accentClass: "border-amber-500/15 bg-linear-to-br from-amber-500/8 to-transparent hover:border-amber-400/25",
    dotClass: "bg-amber-400",
    iconColorClass: "text-amber-400",
    iconBgClass: "border-amber-500/20 bg-amber-500/10",
    icon: <IconBolt />,
  },
  {
    href: "/area-clienti/fotocopie",
    eyebrow: "Fotocopie Online",
    title: "Stampa PDF & ritiro in sede",
    description: "Carica il tuo PDF, paga in base alle pagine e ritira le stampe direttamente in agenzia.",
    cta: "Apri fotocopie",
    accentClass: "border-pink-500/15 bg-linear-to-br from-pink-500/8 to-transparent hover:border-pink-400/25",
    dotClass: "bg-pink-400",
    iconColorClass: "text-pink-400",
    iconBgClass: "border-pink-500/20 bg-pink-500/10",
    icon: <IconPrinter />,
  },
  {
    href: "/area-clienti/web-agency",
    eyebrow: "Web Agency",
    title: "Siti web & progetti digitali",
    description: "Invia il tuo brief, ricevi una proposta commerciale e segui lo stato del progetto online.",
    cta: "Apri web agency",
    accentClass: "border-violet-500/15 bg-linear-to-br from-violet-500/8 to-transparent hover:border-violet-400/25",
    dotClass: "bg-violet-400",
    iconColorClass: "text-violet-400",
    iconBgClass: "border-violet-500/20 bg-violet-500/10",
    icon: <IconGlobe />,
  },
  {
    href: "/area-clienti/ticket-pratiche-documenti",
    eyebrow: "Ticket",
    title: "Ticket pratiche e documenti",
    description: "Invia aggiornamenti su pratiche già avviate, allega documenti e segui lo stato in tempo reale.",
    cta: "Apri ticket",
    accentClass: "border-sky-500/15 bg-linear-to-br from-sky-500/8 to-transparent hover:border-sky-400/25",
    dotClass: "bg-sky-400",
    iconColorClass: "text-sky-400",
    iconBgClass: "border-sky-500/20 bg-sky-500/10",
    icon: <IconChat />,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buongiorno";
  if (hour < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function getTodayLabel() {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ClientAreaDashboard() {
  const payload = readClientPortalTokenPayload();
  const greeting = getGreeting();
  const displayName = payload?.fullName || payload?.username || "Cliente";
  const today = getTodayLabel();

  return (
    <div className="min-h-full bg-slate-950 pb-20 text-white">
      {/* Greeting header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] as const }}
        className="border-b border-white/6 bg-linear-to-b from-white/3 to-transparent px-6 py-8 md:px-10 md:py-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              Spazio Clienti
            </p>
            <h1 className="mt-1.5 text-3xl font-semibold text-white md:text-4xl">
              {greeting},{" "}
              <span className="text-cyan-300">{displayName}</span>.
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
              Scegli il servizio per procedere. Ogni sezione ha un percorso dedicato per inviare
              richieste e monitorare lo stato.
            </p>
          </div>
          <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400/60%)]" />
              Sessione attiva
            </span>
            <span className="capitalize text-xs text-slate-600">{today}</span>
          </div>
        </div>
      </motion.div>

      {/* Service tiles */}
      <div className="px-6 py-8 md:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600"
        >
          Servizi disponibili
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {SERVICE_TILES.map((tile) => (
            <motion.div key={tile.href} variants={cardVariants}>
              <Link
                href={tile.href}
                className={`group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] ${tile.accentClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tile.iconBgClass} ${tile.iconColorClass}`}
                  >
                    {tile.icon}
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/6 bg-white/4 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${tile.dotClass} opacity-80`} />
                    {tile.eyebrow}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <h2 className="text-[15px] font-semibold text-slate-100 group-hover:text-white">
                    {tile.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-500 group-hover:text-slate-400">
                    {tile.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 transition group-hover:text-cyan-300">
                  {tile.cta}
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-8 border-t border-white/5 pt-6"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700">
            Accesso rapido
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/area-clienti/profilo", label: "Il mio profilo" },
              { href: "/area-clienti/spedizioni/storico", label: "Storico spedizioni" },
              { href: "/area-clienti/caf-patronato/storico", label: "Storico pratiche CAF" },
              { href: "/area-clienti/visure/storico", label: "Storico visure" },
              { href: "/area-clienti/fotocopie/storico", label: "Storico fotocopie" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/8 bg-white/3 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-white/14 hover:bg-white/6 hover:text-slate-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
