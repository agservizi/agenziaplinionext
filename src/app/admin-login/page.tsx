import { Suspense } from "react";
import type { Metadata } from "next";
import Container from "@/components/Container";
import AdminPortalLoginForm from "@/components/admin-area/AdminPortalLoginForm";

export const metadata: Metadata = {
  title: "Accesso Area Admin | AG SERVIZI",
  description: "Pagina di accesso all'area di controllo AG SERVIZI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Accesso Interno
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Entro nel pannello di controllo.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui uso le credenziali admin configurate in `.env` per controllare richieste, stati
              e flussi dell&apos;area clienti senza passare dal sito pubblico.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-sm text-slate-300 shadow-2xl shadow-cyan-950/30">
                Sto aprendo il pannello interno...
              </div>
            }
          >
            <AdminPortalLoginForm />
          </Suspense>
        </Container>
      </section>
    </div>
  );
}
