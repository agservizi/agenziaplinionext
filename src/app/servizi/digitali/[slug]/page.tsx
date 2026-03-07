import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { digitalServiceDetails, getDigitalServiceBySlug } from "@/lib/digital-services";

type DigitalServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return digitalServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: DigitalServiceDetailPageProps) {
  const resolved = await params;
  const service = getDigitalServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio digitale",
      description: "Dettaglio servizio digitale AG SERVIZI.",
      path: "/servizi/digitali",
    });
  }

  return buildMetadata({
    title: `${service.title} a Castellammare di Stabia`,
    description: service.shortDescription,
    path: `/servizi/digitali/${service.slug}`,
  });
}

export default async function DigitalServiceDetailPage({ params }: DigitalServiceDetailPageProps) {
  const resolved = await params;
  const service = getDigitalServiceBySlug(resolved.slug);
  if (!service) notFound();

  const relatedServices = digitalServiceDetails.filter((item) => item.slug !== service.slug).slice(0, 4);

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Servizi Digitali</p>
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{service.title}</h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">{service.heroDescription}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/consulenza?service=digitali" className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Richiedi supporto</Link>
            <Link href="/servizi/digitali" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200">Torna ai servizi digitali</Link>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="py-10">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-7">
              <h2 className="text-2xl font-semibold text-slate-900">Vantaggi</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.customerBenefits.map((item) => (
                  <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">{item}</li>
                ))}
              </ul>
            </article>
            <aside className="rounded-3xl border border-slate-200 bg-white p-7">
              <h2 className="text-2xl font-semibold text-slate-900">Cosa portare</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600" /><span>{item}</span></li>
                ))}
              </ul>
            </aside>
          </Container>
        </section>

        <section className="py-4">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <h2 className="text-2xl font-semibold text-slate-900">Note operative</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {service.notes.map((item) => (
                  <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {relatedServices.map((item) => (
                  <Link key={item.slug} href={`/servizi/digitali/${item.slug}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
