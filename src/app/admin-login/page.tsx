import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import AdminPortalLoginForm from "@/components/admin-area/AdminPortalLoginForm";

export const metadata: Metadata = {
  title: "Accesso Area Admin | AG SERVIZI",
  description: "Pagina di accesso all'area di controllo AG SERVIZI.",
  robots: {
    index: false,
    follow: false,
  },
};

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Gestione richieste e pratiche",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M21 8.5L12 3L3 8.5V15.5L12 21L21 15.5V8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 8.5L12 14L21 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    label: "Monitoraggio spedizioni BRT",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    label: "Ticket e supporto clienti",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    label: "Dashboard e panoramica operativa",
  },
];

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] shrink-0 flex-col justify-between bg-slate-900 border-r border-slate-800 p-12 xl:p-16">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="AG SERVIZI"
              width={140}
              height={36}
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition"
            />
          </Link>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
              Area di Controllo
            </p>
            <h1 className="text-3xl font-semibold leading-snug text-white xl:text-4xl">
              Pannello operativo{" "}
              <span className="text-slate-400">riservato agli operatori.</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Gestisci richieste, spedizioni, ticket e listini direttamente dal pannello
              interno AG SERVIZI. Accesso riservato al personale autorizzato.
            </p>
          </div>

          <ul className="space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="shrink-0 text-indigo-400">{f.icon}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} AG SERVIZI — accesso riservato
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:px-10 bg-slate-50">
        <div className="w-full max-w-[360px] space-y-6">
          {/* Logo (mobile only) */}
          <div className="flex justify-center lg:hidden">
            <Link href="/">
              <img
                src="/logo.png"
                alt="AG SERVIZI"
                width={120}
                height={31}
                className="h-7 w-auto"
              />
            </Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Accesso operatore</h2>
            <p className="mt-1 text-sm text-slate-500">
              Inserisci le credenziali admin per continuare.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
            <Suspense
              fallback={
                <div className="py-8 text-center text-sm text-slate-400">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
                </div>
              }
            >
              <AdminPortalLoginForm />
            </Suspense>
          </div>

          {/* Client portal link */}
          <p className="text-center text-xs text-slate-400">
            Sei un cliente?{" "}
            <Link
              href="/login"
              className="text-slate-600 underline underline-offset-2 hover:text-slate-900 transition"
            >
              Accedi all&apos;area clienti
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
