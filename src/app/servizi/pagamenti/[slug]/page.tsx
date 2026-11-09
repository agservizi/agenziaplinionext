import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { buildMetadata } from "@/lib/seo";
import { getCmsPaymentServices } from "@/lib/cms/server";

function getPaymentServiceBySlug(slug: string) {
  return getCmsPaymentServices().find((item) => item.slug === slug) ?? null;
}

const paymentServiceDetails = getCmsPaymentServices();

type PaymentServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return paymentServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PaymentServiceDetailPageProps) {
  const resolved = await params;
  const service = getPaymentServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio di pagamento",
      description: "Dettaglio servizio di pagamento AG SERVIZI.",
      path: "/servizi/pagamenti",
    });
  }

  return buildMetadata({
    title: `${service.title} a Castellammare di Stabia`,
    description: service.shortDescription,
    path: `/servizi/pagamenti/${service.slug}`,
  });
}

export default async function PaymentServiceDetailPage({ params }: PaymentServiceDetailPageProps) {
  const resolved = await params;
  const service = getPaymentServiceBySlug(resolved.slug);

  if (!service) {
    notFound();
  }

  const relatedServices = paymentServiceDetails
    .filter((item) => item.slug !== service.slug)
    .slice(0, 4);

  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: "Servizi", href: "/servizi" },
      { name: "Pagamenti", href: "/servizi/pagamenti" },
      { name: service.title, href: `/servizi/pagamenti/${service.slug}` },
    ]} />
    <div className="pb-24">
      <section className="border-b border-[var(--ink)]/10 bg-[var(--paper)] pt-40 pb-16 text-[var(--ink)]">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Servizi di pagamento</p>
            <h1 className="text-4xl font-semibold text-[var(--ink)] md:text-5xl">{service.title}</h1>
            <p className="text-base text-[var(--ink)]/40 md:text-lg">{service.heroDescription}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=pagamenti"
                className="cta-glass cta-glass-md cta-glass-primary-light"
              >
                Richiedi assistenza
              </Link>
              <Link
                href="/servizi/pagamenti"
                className="cta-glass cta-glass-md cta-glass-secondary"
              >
                Torna ai pagamenti
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/40">Info rapide</p>
            <p className="mt-3 text-sm text-[var(--ink)]/55">{service.shortDescription}</p>
          </div>
        </Container>
      </section>

      <div className="bg-[var(--paper)] pb-20 text-[var(--ink)]">
        <section className="-mt-8 py-6">
          <Container>
            <div className="grid gap-4 rounded-3xl border border-[var(--ink)]/15 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:grid-cols-3">
              <div className="rounded-2xl bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/55">Categoria</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Servizi di pagamento</p>
              </div>
              <div className="rounded-2xl bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/55">Modalità</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Pagamento assistito in sede</p>
              </div>
              <div className="rounded-2xl bg-[color-mix(in_srgb,var(--paper)_88%,white)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink)]/55">Output</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Ricevuta operazione</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Vantaggi cliente finale
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Perché usare questo servizio</h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--ink)]/65">
                {service.customerBenefits.map((item) => (
                  <li key={item} className="rounded-xl bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <aside className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Prima di venire in sede
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Cosa portare</h2>
              <ul className="mt-5 space-y-3 text-sm text-[var(--ink)]/65">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Prima di confermare, verifichiamo insieme i dati principali del pagamento.
              </div>
            </aside>
          </Container>
        </section>

        <section className="py-4">
          <Container className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Verifica dati",
                text: "Controllo operativo di codici, importi e riferimenti principali.",
              },
              {
                title: "2. Esecuzione pagamento",
                text: "Procedura assistita in sede con conferma passaggio finale.",
              },
              {
                title: "3. Rilascio ricevuta",
                text: "Consegna immediata della ricevuta da conservare.",
              },
            ].map((step) => (
              <article key={step.title} className="rounded-2xl border border-[var(--ink)]/15 bg-white p-5">
                <h3 className="text-base font-semibold text-[var(--ink)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink)]/65">{step.text}</p>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Note operative</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Informazioni utili prima del pagamento</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {service.notes.map((item) => (
                  <li key={item} className="rounded-xl border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-3 text-sm text-[var(--ink)]/65">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="py-4">
          <Container>
            <div className="rounded-3xl border border-[var(--ink)]/15 bg-white p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Servizi collegati</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">Altre tipologie di pagamento</h2>
                </div>
                <Link
                  href="/servizi/pagamenti"
                  className="rounded-full border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-2 text-sm font-semibold text-[var(--ink)]/65 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  Vedi tutti
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {relatedServices.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/servizi/pagamenti/${item.slug}`}
                    className="rounded-2xl border border-[var(--ink)]/15 bg-[color-mix(in_srgb,var(--paper)_88%,white)] px-4 py-4 text-sm font-medium text-[var(--ink)]/65 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
    </>
  );
}
