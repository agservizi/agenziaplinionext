import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CmsLoginForm from "@/components/cms/CmsLoginForm";
import AdminLoginHeroPanel from "./AdminLoginHeroPanel";

export const metadata: Metadata = {
  title: "Accesso Editor Sito | AG SERVIZI",
  description: "Accedi all'editor del sito AG SERVIZI per modificare testi, immagini e contenuti pubblici.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <AdminLoginHeroPanel />

      <div className="relative flex flex-1 items-center justify-center px-6 py-16 md:px-10 lg:py-12">
        <div className="relative w-full max-w-[400px] space-y-8">
          <div className="flex justify-center lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="AG SERVIZI" width={155} height={32} className="h-8 w-auto" priority />
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
              Area admin
            </p>
            <h2 className="display-type text-3xl text-[var(--ink)] md:text-4xl">
              Entra<span className="text-[#5E0ED7]">.</span>
            </h2>
            <p className="text-sm leading-relaxed text-[var(--ink)]/55">
              Home, servizi, FAQ e recensioni. Tutto il sito sotto controllo.
            </p>
          </div>

          <div className="border border-[var(--ink)]/12 bg-[color-mix(in_srgb,var(--paper)_92%,white)] p-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <span className="h-6 w-6 animate-spin border-2 border-[var(--ink)]/15 border-t-[#5E0ED7]" />
                </div>
              }
            >
              <CmsLoginForm />
            </Suspense>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-[11px] text-[var(--ink)]/40">
              Sei un cliente?{" "}
              <Link
                href="/login"
                className="font-bold uppercase tracking-[0.08em] text-[var(--ink)]/60 underline decoration-[var(--ink)]/20 underline-offset-2 transition hover:text-[#5E0ED7]"
              >
                Area clienti
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]/35 transition hover:text-[#5E0ED7]"
            >
              Torna al sito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
