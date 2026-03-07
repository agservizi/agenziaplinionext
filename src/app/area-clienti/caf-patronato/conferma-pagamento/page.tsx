import Container from "@/components/Container";
import CafPatronatoPaymentConfirmationClient from "@/components/client-area/CafPatronatoPaymentConfirmationClient";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Conferma pagamento pratica CAF e Patronato",
    description:
      "Verifica del pagamento Stripe e finalizzazione della pratica CAF o Patronato.",
    path: "/area-clienti/caf-patronato/conferma-pagamento",
  });
}

export default function AreaClientiCafPagamentoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Conferma pagamento
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
            Sto controllando il pagamento della tua pratica.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-300 md:text-lg">
            Appena Stripe conferma il checkout, invio la pratica al team e preparo il riepilogo finale.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <CafPatronatoPaymentConfirmationClient />
          </Container>
        </section>
      </div>
    </div>
  );
}
