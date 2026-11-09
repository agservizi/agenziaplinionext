import { Suspense } from "react";
import CafPatronatoPaymentConfirmationClient from "@/components/client-area/CafPatronatoPaymentConfirmationClient";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Conferma pagamento pratica CAF e Patronato",
    description: "Verifica del pagamento Stripe e finalizzazione della pratica CAF o Patronato.",
    path: "/area-clienti/caf-patronato/conferma-pagamento",
  });
}

export default function AreaClientiCafPagamentoPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
          Area clienti · CAF e Patronato
        </p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Conferma pagamento</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Appena Stripe conferma il checkout, invio la pratica al team e preparo il riepilogo finale.
        </p>
      </section>
      <div className="px-5 py-8 md:px-8">
        <Suspense fallback={<p className="text-sm text-[var(--ink)]/50">Caricamento…</p>}>
          <CafPatronatoPaymentConfirmationClient />
        </Suspense>
      </div>
    </div>
  );
}