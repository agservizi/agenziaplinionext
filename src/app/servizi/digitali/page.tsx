import Link from "next/link";
import Container from "@/components/Container";
import { serviceCategories } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";
import { digitalServiceDetails } from "@/lib/digital-services";

export function generateMetadata() {
  return buildMetadata({
    title: "Servizi digitali a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: SPID, PEC, firma digitale e servizi telematici con assistenza in sede.",
    path: "/servizi/digitali",
  });
}

export default function DigitaliPage() {
  const category = serviceCategories.find((item) => item.id === "digitali");
  const cardLinksByTitle = Object.fromEntries(
    digitalServiceDetails.map((service) => [service.title, `/servizi/digitali/${service.slug}`]),
  );

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Servizi Digitali</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">Identità e strumenti digitali</h1>
            <p className="text-base text-slate-300 md:text-lg">
              Supporto locale su SPID, PEC, firma digitale e comunicazioni telematiche.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/consulenza?service=digitali" className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Richiedi supporto</Link>
              <Link href="/servizi" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200">Tutti i servizi</Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Assistenza in sede</p>
            <p className="mt-3 text-base text-slate-200">Ti guidiamo passo-passo nelle pratiche digitali più richieste.</p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="py-10">
          <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {category?.items.map((item, index) => (
              <Link
                key={item.title}
                href={cardLinksByTitle[item.title] || "/servizi/digitali"}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_24px_60px_rgba(8,47,73,0.14)]"
              >
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition group-hover:border-cyan-300 group-hover:text-cyan-700">Apri scheda</span>
              </Link>
            ))}
          </Container>
        </section>
      </div>
    </div>
  );
}
