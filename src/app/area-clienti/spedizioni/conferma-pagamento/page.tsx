import Container from "@/components/Container";
import ShipmentPaymentConfirmationClient from "@/components/client-area/ShipmentPaymentConfirmationClient";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Conferma Pagamento Spedizione",
    description: "Pagina di conferma pagamento e finalizzazione spedizione BRT.",
    path: "/area-clienti/spedizioni/conferma-pagamento",
  });
}

export default function AreaClientiSpedizioniConfermaPagamentoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Conferma Pagamento
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Sto finalizzando la tua spedizione.
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            Dopo il checkout Stripe verifico il pagamento e completo la creazione della spedizione
            BRT in un passaggio unico, con una schermata dedicata e più chiara.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <ShipmentPaymentConfirmationClient />
          </Container>
        </section>
      </div>
    </div>
  );
}
