import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ClientLoginForm from "@/components/client-area/ClientLoginForm";

export const metadata: Metadata = {
  title: "Accesso Area Clienti | AG SERVIZI",
  description: "Pagina di accesso allo spazio clienti AG SERVIZI.",
  robots: {
    index: false,
    follow: false,
  },
};

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 8.5L12 14L21 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "Spedizioni BRT & InPost",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "Visure catastali e camerali",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "CAF, Patronato & consulenza utenze",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 9H19a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
        <rect x="7" y="14" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    label: "Fotocopie e stampe online",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] shrink-0 flex-col justify-between bg-linear-to-br from-slate-950 via-[#071628] to-slate-950 border-r border-white/6 p-12 xl:p-16">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="AG SERVIZI"
              width={155}
              height={32}
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition"
              priority
            />
          </Link>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-500">
              Spazio Clienti
            </p>
            <h1 className="text-3xl font-semibold leading-snug text-white xl:text-4xl">
              Gestisci tutti i tuoi servizi{" "}
              <span className="text-slate-400">da un unico posto.</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Spedizioni, visure, documenti, fotocopie e molto altro — tutto disponibile
              24&thinsp;/&thinsp;7 dal tuo spazio personale AG SERVIZI.
            </p>
          </div>

          <ul className="space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="shrink-0 text-cyan-500">{f.icon}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} AG SERVIZI — agenziaplinio.it
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-10">
        <div className="w-full max-w-[360px] space-y-6">
          {/* Logo (mobile only) */}
          <div className="flex justify-center lg:hidden">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="AG SERVIZI"
                width={135}
                height={28}
                className="h-7 w-auto opacity-90"
              />
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Accedi al tuo spazio</h2>
            <p className="mt-1 text-sm text-slate-500">
              Inserisci le tue credenziali per continuare.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm shadow-2xl shadow-black/30">
            <Suspense
              fallback={
                <div className="py-8 text-center text-sm text-slate-500">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-cyan-500" />
                </div>
              }
            >
              <ClientLoginForm />
            </Suspense>
          </div>

          {/* Admin link */}
          <p className="text-center text-xs text-slate-600">
            Sei un operatore?{" "}
            <Link
              href="/admin-login"
              className="text-slate-400 underline underline-offset-2 hover:text-slate-200 transition"
            >
              Accedi all&apos;area admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
