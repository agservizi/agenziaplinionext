import Link from "next/link";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import SectionHeading from "@/components/SectionHeading";
import { company } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Contatti AG SERVIZI | Castellammare di Stabia",
    description:
      "Contatta AG SERVIZI a Castellammare di Stabia per consulenze su telefonia, luce e gas, pagamenti, SPID e servizi digitali.",
    path: "/contatti",
  });
}

export default function ContattiPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-48 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Contatti
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Parla con i consulenti AG SERVIZI.
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Inviaci una richiesta per una consulenza personalizzata. Ti rispondiamo
              rapidamente con una proposta chiara e mirata.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/servizi"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Scopri i servizi
              </Link>
              <Link
                href="/chi-siamo"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Il nostro metodo
              </Link>
            </div>
            <div className="grid gap-4 pt-6 md:grid-cols-3">
              {[
                { label: "Risposta rapida", value: "Entro 24 ore" },
                { label: "Consulenza", value: "Su misura" },
                { label: "Supporto", value: "Continuativo" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="premium-panel rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,47,73,0.45)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Dati aziendali
              </p>
              <p className="text-base font-semibold text-white">{company.legalName}</p>
              <p className="text-sm text-slate-300">{company.address}</p>
              <div className="text-sm text-slate-300">
                <p>P. IVA: {company.vat}</p>
                <p>Codice SDI: {company.sdi}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <SectionHeading
              eyebrow="Contatti"
              title="Richiedi una consulenza personalizzata"
              description="Raccontaci la tua esigenza e ti guideremo nella scelta più adatta."
              tone="dark"
            />
          </Container>
        </section>

        <section className="py-6">
          <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="lux-panel rounded-3xl p-6">
              <ContactForm tone="light" />
            </div>
            <div className="space-y-6">
              <div className="lux-panel rounded-3xl p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Sede operativa
                </p>
                <p className="mt-3 text-base font-semibold text-slate-900">
                  {company.legalName}
                </p>
                <p className="mt-2 text-sm text-slate-600">{company.address}</p>
                <div className="mt-4 text-sm text-slate-600">
                  <p>P. IVA: {company.vat}</p>
                  <p>Codice SDI: {company.sdi}</p>
                </div>
              </div>
              <div className="lux-panel rounded-3xl p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  Mappa
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <iframe
                    title="Mappa AG SERVIZI"
                    src="https://www.google.com/maps?q=Via%20Plinio%20il%20Vecchio%2072%2C%2080053%20Castellammare%20di%20Stabia%20(NA)&output=embed"
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
