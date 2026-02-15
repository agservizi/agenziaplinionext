import Link from "next/link";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";

const payhipStoreUrl = process.env.NEXT_PUBLIC_PAYHIP_STORE_URL ?? "";
const payhipEmbedUrl = process.env.NEXT_PUBLIC_PAYHIP_EMBED_URL ?? "";
const embeddedStoreUrl = payhipEmbedUrl || payhipStoreUrl;

export function generateMetadata() {
  return buildMetadata({
    title: "Store digitale AG SERVIZI",
    description:
      "Acquista servizi digitali e prodotti online di AG SERVIZI tramite checkout sicuro Payhip.",
    path: "/store",
  });
}

export default function StorePage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Store
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Acquista online con checkout sicuro Payhip
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              Qui trovi i prodotti e servizi disponibili all’acquisto online.
              Pagamenti gestiti in pagina senza uscire da agenziaplinio.it.
            </p>
            {!embeddedStoreUrl ? (
              <Link
                href="/contatti"
                className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
              >
                Contattaci per attivare lo store
              </Link>
            ) : null}
          </div>
          <div className="glass-card rounded-4xl p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Vantaggi
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• Pagamento online immediato e verificato.</li>
                <li>• Accesso rapido ai prodotti digitali disponibili.</li>
                <li>• Processo d’acquisto semplice, da desktop e mobile.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Catalogo online
            </h2>
            {embeddedStoreUrl ? (
              <div className="lux-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <iframe
                  src={embeddedStoreUrl}
                  title="Store Payhip AG SERVIZI"
                  loading="lazy"
                  className="h-[1100px] w-full"
                />
              </div>
            ) : (
              <div className="lux-card rounded-2xl p-6">
                <p className="text-sm text-slate-600">
                  Configura <strong>NEXT_PUBLIC_PAYHIP_EMBED_URL</strong> (o
                  <strong> NEXT_PUBLIC_PAYHIP_STORE_URL</strong>) per mostrare lo
                  store direttamente in questa pagina.
                </p>
              </div>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
}