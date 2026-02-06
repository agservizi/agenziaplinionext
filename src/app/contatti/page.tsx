import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import SectionHeading from "@/components/SectionHeading";
import { company } from "@/lib/site-data";

export const metadata = {
  title: "Contatti",
};

export default function ContattiPage() {
  return (
    <div className="space-y-16 pb-24 pt-10">
      <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contatti"
            title="Parla con i consulenti AG SERVIZI"
            description="Inviaci una richiesta per una consulenza personalizzata."
          />
          <ContactForm />
        </div>
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Dati aziendali
            </p>
            <p className="mt-3 text-base font-semibold text-white">
              {company.legalName}
            </p>
            <p className="mt-2 text-sm text-slate-300">{company.address}</p>
            <div className="mt-4 text-sm text-slate-300">
              <p>P. IVA: {company.vat}</p>
              <p>Codice SDI: {company.sdi}</p>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Mappa
            </p>
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-6 text-sm text-slate-300">
              Integrazione mappa interattiva disponibile su richiesta.
              <p className="mt-3 text-slate-400">{company.address}</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
