import Container from "@/components/Container";
import PhotocopyPaymentConfirmationClient from "@/components/client-area/PhotocopyPaymentConfirmationClient";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Conferma Pagamento Fotocopie | Area Clienti",
    description: "Conferma pagamento e presa in carico ordine fotocopie online.",
    path: "/area-clienti/fotocopie/conferma-pagamento",
  });
}

export default function AreaClientiFotocopieConfermaPagamentoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Conferma pagamento
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Sto verificando il pagamento e prendendo in carico il PDF.
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            Dopo Stripe verifico l&apos;ordine e invio subito il file al team per la stampa.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <PhotocopyPaymentConfirmationClient />
          </Container>
        </section>
      </div>
    </div>
  );
}
