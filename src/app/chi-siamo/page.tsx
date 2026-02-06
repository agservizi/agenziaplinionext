import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { company, values } from "@/lib/site-data";

export const metadata = {
  title: "Chi Siamo",
};

export default function ChiSiamoPage() {
  return (
    <div className="space-y-20 pb-24 pt-10">
      <section>
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <SectionHeading
            eyebrow="La nostra storia"
            title="Un’agenzia moderna, dinamica e orientata alla consulenza"
            description="Dal 1° giugno 2016 affianchiamo privati e aziende nella gestione di servizi essenziali, con attenzione alla qualità e alla trasparenza."
          />
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm text-slate-300">
              {company.name} nasce per semplificare le scelte dei clienti in un
              mercato sempre più complesso. La nostra esperienza si concentra su
              telefonia, energia elettrica e gas, con un approccio consulenziale
              che mette al centro il cliente.
            </p>
            <p className="mt-4 text-sm text-slate-300">
              Ogni progetto parte da un’analisi concreta delle esigenze per
              proporre soluzioni personalizzate e sostenibili nel tempo.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900/50 py-16">
        <Container className="grid gap-8 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="glass-card rounded-2xl p-6">
              <p className="text-base font-semibold text-white">{value.title}</p>
              <p className="mt-3 text-sm text-slate-300">{value.description}</p>
            </div>
          ))}
        </Container>
      </section>

      <section>
        <Container className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card rounded-3xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              2016
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Un percorso costruito sulla fiducia
            </h3>
            <p className="mt-3 text-sm text-slate-300">
              Dall’apertura a Castellammare di Stabia abbiamo consolidato una
              rete di partner affidabili per offrire soluzioni efficaci.
            </p>
          </div>
          <div className="space-y-4">
            {["Consulenza trasparente", "Supporto operativo", "Innovazione continua"].map(
              (item) => (
                <div key={item} className="glass-card rounded-2xl p-5">
                  <p className="text-base font-semibold text-white">{item}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Mettiamo al centro risultati misurabili e assistenza
                    costante.
                  </p>
                </div>
              ),
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
