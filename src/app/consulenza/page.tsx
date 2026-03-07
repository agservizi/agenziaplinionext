import { Suspense } from "react";
import Container from "@/components/Container";
import InteractiveConsultingWizard from "@/components/InteractiveConsultingWizard";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Consulenza Interattiva | AG SERVIZI",
    description:
      "Richiedi una consulenza interattiva per tutti i servizi AG SERVIZI e ricevi codice pratica via email.",
    path: "/consulenza",
  });
}

export default function ConsulenzaPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Consulenza Interattiva
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
            Costruiamo la consulenza migliore per il tuo servizio.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-300 md:text-lg">
            Percorso guidato, rapido e coinvolgente. Al termine ricevi conferma email con codice
            richiesta e il backoffice prende in carico immediatamente la pratica.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-7">Caricamento...</div>}>
              <InteractiveConsultingWizard />
            </Suspense>
          </Container>
        </section>
      </div>
    </div>
  );
}
