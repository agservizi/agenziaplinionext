import Link from "next/link";
import Container from "@/components/Container";
import ContactInteractiveSection from "@/components/ContactInteractiveSection";
import ContattiAccordion from "@/components/ContattiAccordion";
import { company } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import Reveal from "@/components/ui/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/ui/Stagger";

export function generateMetadata() {
  return buildMetadata({
    title: "Contatti AG SERVIZI | Castellammare di Stabia",
    description:
      "Scrivici su WhatsApp o vieni in Via Plinio 72. Rispondiamo entro l'ora. Consulenza gratuita.",
    path: "/contatti",
  });
}

const whatsappUrl = `https://wa.me/393773798570?text=${encodeURIComponent("Ciao! Vorrei ricevere informazioni sui vostri servizi.")}`;

const channels = [
  {
    id: "whatsapp",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "Risposta entro 30 min",
    href: whatsappUrl,
    external: true,
    color: "border-[#25D366]/25 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20",
    labelColor: "text-white",
    valueColor: "text-slate-400",
  },
  {
    id: "phone",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Telefono",
    value: "Ti risponde una persona",
    href: "tel:+393773798570",
    external: false,
    color: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
    labelColor: "text-white",
    valueColor: "text-slate-400",
  },
  {
    id: "sede",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "In sede",
    value: "Via Plinio 72, CdS",
    href: company.googleBusinessUrl,
    external: true,
    color: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
    labelColor: "text-white",
    valueColor: "text-slate-400",
  },
];

export default function ContattiPage() {
  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero-gradient relative overflow-hidden bg-slate-950 pb-24 pt-40 text-white">
        {/* Decorative bg text */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-0 select-none text-[20rem] font-black leading-none text-white/2.5 md:text-[28rem]"
        >
          ?
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <Container className="relative">
          <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            {/* Left */}
            <Reveal className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Contatti
              </span>

              <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Hai bisogno
                <br />
                di noi?
                <br />
                <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Siamo qui.
                </span>
              </h1>

              <p className="max-w-lg text-lg text-slate-300">
                WhatsApp, telefono o direttamente in Via Plinio 72.
                Niente call center, niente attese. Una persona risponde, punto.
              </p>

              {/* Channel cards */}
              <StaggerContainer className="grid gap-3 sm:grid-cols-3">
                {channels.map((ch) => (
                  <StaggerItem key={ch.id}>
                    <a
                      href={ch.href}
                      target={ch.external ? "_blank" : undefined}
                      rel={ch.external ? "noopener noreferrer" : undefined}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition ${ch.color}`}
                    >
                      <span className="shrink-0">{ch.icon}</span>
                      <div>
                        <p className={`text-sm font-bold ${ch.labelColor}`}>{ch.label}</p>
                        <p className={`text-xs ${ch.valueColor}`}>{ch.value}</p>
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </Reveal>

            {/* Right — orari + indirizzo */}
            <Reveal delay={0.18}>
              <div className="space-y-4">
                {/* Orari */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Orari di apertura
                  </p>
                  <ul className="mt-5 space-y-3">
                    {[
                      { day: "Lunedì – Venerdì", hours: "08:45–13:20 / 16:20–19:00" },
                      { day: "Sabato", hours: "09:20–12:30" },
                      { day: "Domenica", hours: "Chiuso", closed: true },
                    ].map((r) => (
                      <li key={r.day} className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-semibold ${r.closed ? "text-slate-500" : "text-white"}`}>
                          {r.day}
                        </span>
                        <span className={`text-sm ${r.closed ? "text-slate-600" : "text-cyan-400"} font-mono`}>
                          {r.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 rounded-xl bg-cyan-500/10 px-4 py-2.5 text-xs text-cyan-300">
                    Siamo aperti dal 2016 — stessa agenzia, stesso numero.
                  </div>
                </div>

                {/* Indirizzo */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Dove siamo
                  </p>
                  <p className="mt-3 text-base font-bold text-white">Via Plinio il Vecchio 72</p>
                  <p className="text-sm text-slate-400">80053 Castellammare di Stabia (NA)</p>
                  <a
                    href={company.googleBusinessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Apri su Google Maps
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          FORM — scegli la tua esigenza
      ══════════════════════════════════════ */}
      <section className="bg-slate-50 py-20">
        <Container>
          <Reveal className="mb-12 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Scrivici
            </p>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              Dimmi di cosa hai bisogno.
            </h2>
            <p className="max-w-xl text-base text-slate-500">
              Scegli l'argomento, compila il form o apri WhatsApp con un messaggio precompilato.
              Ti risponderemo nel più breve tempo possibile.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ContactInteractiveSection />
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          MAPPA
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <Container>
          <Reveal className="mb-10 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Trovaci
            </p>
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
              Siamo a Castellammare di Stabia.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl">
              <iframe
                title="Mappa AG SERVIZI"
                src="https://www.google.com/maps?q=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia%20(NA)&output=embed"
                className="h-80 w-full border-0 md:h-112"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          FAQ ACCORDION
      ══════════════════════════════════════ */}
      <section className="bg-slate-50 py-20">
        <Container>
          <div className="grid gap-16 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            {/* Left heading */}
            <Reveal className="space-y-5 md:sticky md:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Domande frequenti
              </p>
              <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Qualcosa
                <br />
                non è chiaro?
              </h2>
              <p className="text-base text-slate-500">
                Le risposte alle domande più comuni. Se non trovi quello che cerchi,
                scrivici direttamente.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Scrivici su WhatsApp
              </a>
            </Reveal>

            {/* Right accordion */}
            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-slate-100 bg-white px-8 py-4 shadow-sm">
                <ContattiAccordion />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          CTA FINALE
      ══════════════════════════════════════ */}
      <section className="bg-white py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-center text-white shadow-2xl md:p-16">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="relative space-y-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Pronti quando sei pronto
                </p>
                <h2 className="text-3xl font-black text-white md:text-5xl">
                  Vieni.
                  <br />
                  <span className="text-cyan-400">Ti aspettiamo.</span>
                </h2>
                <p className="mx-auto max-w-md text-slate-400">
                  Consulenza gratuita, senza appuntamento, senza impegno.
                  Stessa faccia di sempre, stessa agenzia dal 2016.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:bg-cyan-400"
                  >
                    Scrivi su WhatsApp
                  </a>
                  <Link
                    href="/servizi"
                    className="rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Vedi i servizi
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
