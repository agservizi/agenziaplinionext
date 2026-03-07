"use client";

import { useState } from "react";
import Container from "@/components/Container";
import PublicBookingDrawer from "@/components/PublicBookingDrawer";

export default function PrenotaPage() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Prenotazioni online
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Prenota il tuo appuntamento in pochi secondi.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300 md:text-lg">
            Scegli servizio, data e orario disponibili. La conferma avviene direttamente
            sul calendario operativo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Apri prenotazione
            </button>
            <a
              href="tel:+393773798570"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
            >
              Oppure chiama: +39 377 379 8570
            </a>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-6">
          <Container className="grid gap-4 md:grid-cols-3">
            {[
              { title: "1. Seleziona servizio", text: "Scegli il tipo di consulenza o pratica." },
              { title: "2. Scegli slot", text: "Visualizzi solo gli orari realmente disponibili." },
              { title: "3. Conferma", text: "Inserisci dati e ricevi conferma immediata." },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </article>
            ))}
          </Container>
        </section>
      </div>

      <PublicBookingDrawer open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
