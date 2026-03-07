import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { getWebAgencyServiceBySlug, webAgencyServiceDetails } from "@/lib/web-agency-services";

type WebAgencyServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return webAgencyServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: WebAgencyServiceDetailPageProps) {
  const resolved = await params;
  const service = getWebAgencyServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio Web Agency",
      description: "Dettaglio servizio Web Agency AG SERVIZI.",
      path: "/servizi/web-agency",
    });
  }

  return buildMetadata({
    title: `${service.title} su misura`,
    description: service.shortDescription,
    path: `/servizi/web-agency/${service.slug}`,
  });
}

export default async function WebAgencyServiceDetailPage({ params }: WebAgencyServiceDetailPageProps) {
  const resolved = await params;
  const service = getWebAgencyServiceBySlug(resolved.slug);
  if (!service) notFound();

  const relatedServices = webAgencyServiceDetails.filter((item) => item.slug !== service.slug).slice(0, 4);
  const isWebsiteProject = service.slug === "realizzazione-siti-web";

  return (
    <div className="pb-24">
      <section
        className={`relative overflow-hidden pt-40 pb-24 md:pb-28 text-white ${
          isWebsiteProject
            ? "bg-[radial-gradient(circle_at_15%_15%,rgba(14,165,233,0.24),transparent_44%),radial-gradient(circle_at_85%_0%,rgba(45,212,191,0.16),transparent_40%),linear-gradient(150deg,#020617_0%,#0f172a_50%,#111827_100%)]"
            : "bg-slate-950"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        </div>
        <Container className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {isWebsiteProject ? "Web Agency" : "Web Agency"}
            </p>
            <h1
              className={`font-semibold leading-[0.95] text-white ${
                isWebsiteProject ? "text-5xl md:text-6xl lg:text-7xl" : "text-4xl md:text-5xl"
              }`}
            >
              {service.title}
            </h1>
            <p className="max-w-2xl text-base text-slate-200 md:text-lg">{service.heroDescription}</p>
            {isWebsiteProject ? (
              <p className="max-w-2xl text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/90">
                Strategia digitale, performance tecnica, conversione.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=web-agency"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {isWebsiteProject ? "Prenota analisi progetto" : "Richiedi consulenza"}
              </Link>
              <Link
                href="/servizi/web-agency"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                Torna a web agency
              </Link>
            </div>
          </div>
          <div
            className={`rounded-3xl border p-6 backdrop-blur ${
              isWebsiteProject
                ? "border-cyan-200/30 bg-gradient-to-br from-cyan-400/10 via-white/5 to-transparent"
                : "border-white/15 bg-white/5"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Quadro Progetto
            </p>
            <div className={`mt-5 grid gap-3 sm:grid-cols-2 ${isWebsiteProject ? "md:gap-4" : ""}`}>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Focus</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isWebsiteProject ? "Conversione + performance" : "Automazione + controllo"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Approccio</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isWebsiteProject ? "Brand UX + CRO + SEO tecnico" : "UX + sviluppo su misura"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Output</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {isWebsiteProject
                    ? "Website scalabile, tracciato e orientato alla crescita commerciale."
                    : "Deliverable chiari, rilascio progressivo e supporto operativo locale."}
                </p>
              </div>
            </div>
            {isWebsiteProject ? (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {["UX", "CRO", "SEO"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <div className="lux-surface relative z-30 -mt-10 pb-20 text-slate-900 md:-mt-14">
        <section className="py-14 md:py-16">
          <Container className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article
              className={`rounded-3xl border p-7 shadow-[0_20px_60px_rgba(2,6,23,0.07)] ${
                isWebsiteProject
                  ? "border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Perche scegliere questo servizio
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">Vantaggi concreti</h2>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {service.customerBenefits.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <aside
              className={`rounded-3xl border p-7 shadow-[0_20px_60px_rgba(2,6,23,0.07)] ${
                isWebsiteProject ? "border-cyan-100 bg-white" : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Preparazione
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Informazioni iniziali</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900">
                Portando queste informazioni in consulenza riduciamo i tempi di analisi e definiamo
                subito priorita, tempi e budget.
              </div>
            </aside>
          </Container>
        </section>

        <section className="py-6 md:py-8">
          <Container className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article
              className={`rounded-3xl border p-7 shadow-[0_20px_60px_rgba(2,6,23,0.07)] ${
                isWebsiteProject
                  ? "border-cyan-100 bg-gradient-to-br from-white via-cyan-50/40 to-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Metodo
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Come lavoriamo</h2>
              <div className="mt-6 space-y-4">
                {(isWebsiteProject
                  ? [
                      "Discovery strategica e benchmark competitivo",
                      "Design UX/UI e prototipazione ad alta fedelta",
                      "Sviluppo e QA tecnico con focus performance",
                      "Go-live con piano ottimizzazione progressiva",
                    ]
                  : [
                      "Kickoff e obiettivi",
                      "Prototipo e contenuti",
                      "Rilascio e ottimizzazione",
                    ]
                ).map((step, index) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-6 space-y-3">
                {service.notes.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article
              className={`rounded-3xl border p-7 shadow-[0_20px_60px_rgba(2,6,23,0.07)] ${
                isWebsiteProject ? "border-cyan-100 bg-white" : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Altri servizi utili
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Espandi il progetto</h2>
              <p className="mt-3 text-sm text-slate-600">
                Puoi attivare altri moduli web agency in continuita con questo servizio.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {relatedServices.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/servizi/web-agency/${item.slug}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Consulenza guidata
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  Ti aiutiamo a scegliere la roadmap migliore in base alla fase del tuo business.
                </p>
                <Link
                  href="/consulenza?service=web-agency"
                  className="mt-4 inline-flex rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Prenota analisi progetto
                </Link>
              </div>
            </article>
          </Container>
        </section>

      </div>
    </div>
  );
}
