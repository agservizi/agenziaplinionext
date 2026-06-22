import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminPortalLoginForm from "@/components/admin-area/AdminPortalLoginForm";
import AdminLoginHeroPanel from "./AdminLoginHeroPanel";

export const metadata: Metadata = {
  title: "Accesso Area Admin | AG SERVIZI",
  description: "Pagina di accesso all'area di controllo AG SERVIZI.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-dvh bg-slate-950 flex overflow-hidden">
      <AdminLoginHeroPanel />

      <div className="relative flex flex-1 items-center justify-center px-6 py-16 md:px-10 lg:py-12">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="orb-float-1 absolute -right-24 top-1/4 h-[280px] w-[280px] rounded-full bg-[#5E0ED7]/15 blur-[100px]" />
          <div className="orb-float-2 absolute -left-20 bottom-1/4 h-[220px] w-[220px] rounded-full bg-[#22d3ee]/10 blur-[80px]" />
        </div>

        <div className="relative w-full max-w-[380px] space-y-8">
          <div className="flex justify-center lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="AG SERVIZI" width={155} height={32} className="h-8 w-auto" priority />
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight">Accesso operatore</h2>
            <p className="text-sm text-white/40">
              Inserisci le credenziali admin per continuare.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/3 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#5E0ED7]" />
                </div>
              }
            >
              <AdminPortalLoginForm />
            </Suspense>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-xs text-white/25">
              Sei un cliente?{" "}
              <Link href="/login" className="text-white/40 underline underline-offset-2 transition hover:text-white/70">
                Accedi all&apos;area clienti
              </Link>
            </p>
            <Link href="/" className="inline-block text-xs text-white/25 transition hover:text-white/40">
              Torna al sito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
