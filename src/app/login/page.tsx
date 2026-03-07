import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ClientPortalLoginForm from "@/components/client-area/ClientPortalLoginForm";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Accesso Area Clienti | AG SERVIZI",
  description: "Pagina di accesso allo spazio clienti AG SERVIZI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Login
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Benvenuto nel tuo spazio clienti AG SERVIZI.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Se hai già un accesso, entra con le tue credenziali. Se invece non sei ancora
              registrato, da qui puoi creare il tuo account e poi usare l’area clienti.
            </p>
            <Link
              href="/admin-login"
              className="inline-flex rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            >
              Accesso area admin
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-sm text-slate-300 shadow-2xl shadow-cyan-950/30">
                Sto preparando il tuo accesso...
              </div>
            }
          >
            <ClientPortalLoginForm />
          </Suspense>
        </Container>
      </section>
    </div>
  );
}
