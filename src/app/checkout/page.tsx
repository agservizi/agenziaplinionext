import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";

const payhipCheckoutUrl = process.env.NEXT_PUBLIC_PAYHIP_CHECKOUT_URL ?? "";

export function generateMetadata() {
  return buildMetadata({
    title: "Checkout online",
    description: "Completa il tuo acquisto online in checkout sicuro.",
    path: "/checkout",
  });
}

export default function CheckoutPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Checkout
          </p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Completa il pagamento
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            Finalizza il tuo ordine direttamente su agenziaplinio.it.
          </p>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            {payhipCheckoutUrl ? (
              <div className="lux-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <iframe
                  src={payhipCheckoutUrl}
                  title="Checkout Payhip AG SERVIZI"
                  loading="lazy"
                  className="h-300 w-full"
                />
              </div>
            ) : (
              <div className="lux-card rounded-2xl p-6">
                <p className="text-sm text-slate-600">
                  Configura <strong>NEXT_PUBLIC_PAYHIP_CHECKOUT_URL</strong> per
                  mostrare il checkout in questa pagina.
                </p>
              </div>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
}
