import { Suspense } from "react";
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
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area clienti · Visure</p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Conferma pagamento</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Dopo il checkout verifico l&apos;esito, finalizzo la richiesta visura e ti mostro il riepilogo.
        </p>
      </section>
      <div className="px-5 py-8 md:px-8">
        <Suspense fallback={<p className="text-sm text-[var(--ink)]/50">Caricamento…</p>}>
          <VisuraPaymentConfirmationClient />
        </Suspense>
      </div>
    </div>
  );
}