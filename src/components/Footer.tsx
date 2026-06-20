"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";
import { company, navigation, getYearsActive } from "@/lib/site-data";
import { useConsent } from "@/components/cookies/ConsentProvider";

const WHATSAPP_URL = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Ciao! Vorrei ricevere informazioni sui vostri servizi.")}`;

export default function Footer() {
  const { openPreferences } = useConsent();
  const pathname = usePathname();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950">
      {/* Decorative gradient line top */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-[#5E0ED7]/40 to-transparent" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 bottom-0 h-[300px] w-[300px] rounded-full bg-[#5E0ED7]/8 blur-[100px]" />
        <div className="absolute -right-32 top-0 h-[250px] w-[250px] rounded-full bg-[#22d3ee]/5 blur-[80px]" />
      </div>

      {/* ── Main content ── */}
      <Container className="relative py-16 md:py-20">
        {/* Top: CTA banner */}
        <div className="mb-16 flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white md:text-3xl">
              Pronto a iniziare?
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Consulenza gratuita, senza impegno. Dal 2016.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contatti"
              className="inline-flex items-center gap-2 rounded-full bg-[#5E0ED7] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(94,14,215,0.25)] transition hover:shadow-[0_0_30px_rgba(94,14,215,0.4)]"
            >
              Parla con noi
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path d="M4.5 10h11M10.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-12 h-px bg-white/8" />

        {/* Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex">
              <img src="/logo.png" alt="AG SERVIZI" className="h-9 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Agenzia multiservizi a Castellammare di Stabia. Pagamenti, telefonia, energia, SPID, PEC e web agency. Dal 2016.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-[#25D366]/40 hover:text-[#25D366]"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
              </a>
              <a
                href={company.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/25 hover:text-white"
                aria-label="Google Maps"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
              </a>
              <a
                href={`tel:${company.phone}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:border-white/25 hover:text-white"
                aria-label="Telefono"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Navigazione
            </p>
            <div className="flex flex-col gap-2.5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-400 transition hover:text-[#5E0ED7]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Orari */}
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Orari di apertura
            </p>
            <div className="space-y-2">
              {[
                { day: "Lun – Ven", hours: "08:45–13:20 / 16:20–19:00" },
                { day: "Sabato", hours: "09:20–12:30" },
                { day: "Domenica", hours: "Chiuso" },
              ].map((r) => (
                <div key={r.day} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-400">{r.day}</span>
                  <span className={`font-mono text-xs ${r.hours === "Chiuso" ? "text-slate-600" : "text-slate-300"}`}>
                    {r.hours}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
              <p className="text-xs text-slate-500">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#5E0ED7]" />
                Via Plinio il Vecchio 72, Castellammare di Stabia
              </p>
            </div>
          </div>

          {/* Legale */}
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Legale
            </p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy-policy" className="text-sm text-slate-400 transition hover:text-[#5E0ED7]">
                Privacy Policy
              </Link>
              <Link href="/cookie-policy" className="text-sm text-slate-400 transition hover:text-[#5E0ED7]">
                Cookie Policy
              </Link>
              {company.googleBusinessUrl && (
                <a href={company.googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 transition hover:text-[#5E0ED7]">
                  Google Business
                </a>
              )}
              <button
                type="button"
                onClick={openPreferences}
                className="text-left text-sm text-slate-400 transition hover:text-[#5E0ED7]"
              >
                Gestisci cookie
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            © 2016–{year} {company.name}. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">P.IVA {company.vat}</span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-600">SDI {company.sdi}</span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-600">{getYearsActive()}+ anni di attività</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
