import Container from "@/components/Container";
import VisuraPaymentConfirmationClient from "@/components/client-area/VisuraPaymentConfirmationClient";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Conferma Pagamento Visura | Area Clienti",
    description: "Conferma pagamento e finalizzazione della richiesta visura.",
    path: "/area-clienti/visure/conferma-pagamento",
  });
}

export default function AreaClientiVisureConfermaPagamentoPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Conferma pagamento
          </p>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Sto chiudendo il pagamento e aprendo la tua richiesta.
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            Dopo il checkout verifico l&apos;esito, poi finalizzo la richiesta visura e ti mostro
            subito il riepilogo.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <VisuraPaymentConfirmationClient />
          </Container>
        </section>
      </div>
    </div>
  );
}

