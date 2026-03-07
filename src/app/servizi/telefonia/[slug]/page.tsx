import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { buildMetadata } from "@/lib/seo";
import { getPhoneServiceBySlug, phoneServiceDetails } from "@/lib/phone-services";

type PhoneServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return phoneServiceDetails.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PhoneServiceDetailPageProps) {
  const resolved = await params;
  const service = getPhoneServiceBySlug(resolved.slug);

  if (!service) {
    return buildMetadata({
      title: "Servizio telefonia",
      description: "Dettaglio servizio telefonia AG SERVIZI.",
      path: "/servizi/telefonia",
    });
  }

  return buildMetadata({
    title: `${service.title} a Castellammare di Stabia`,
    description: service.shortDescription,
    path: `/servizi/telefonia/${service.slug}`,
  });
}

export default async function PhoneServiceDetailPage({ params }: PhoneServiceDetailPageProps) {
  const resolved = await params;
  const service = getPhoneServiceBySlug(resolved.slug);

  if (!service) {
    notFound();
  }

  const relatedServices = phoneServiceDetails
    .filter((item) => item.slug !== service.slug)
    .slice(0, 4);
  const themeBySlug: Record<
    string,
    {
      heroBg: string;
      heroTag: string;
      heroBody: string;
      accentText: string;
      accentBg: string;
      accentBgHover: string;
      dot: string;
      linkHover: string;
      sourceBorder: string;
      sourceBg: string;
      sourceLink: string;
      relatedCard: string;
      backHover: string;
    }
  > = {
    "iliad-space": {
      heroBg: "bg-[#ED1C24]",
      heroTag: "text-[#FFE6E7]",
      heroBody: "text-[#FFEDEE]",
      accentText: "text-[#ED1C24]",
      accentBg: "bg-[#ED1C24]",
      accentBgHover: "hover:bg-[#C9151C]",
      dot: "bg-[#ED1C24]",
      linkHover: "hover:border-[#ED1C24]/45 hover:text-[#ED1C24]",
      sourceBorder: "border-[#ED1C24]/35",
      sourceBg: "bg-[#FFF1F2]",
      sourceLink: "text-[#9F1016] decoration-[#ED1C24]/40 hover:text-[#ED1C24]",
      relatedCard: "bg-[#FFF7F7] hover:border-[#ED1C24]/40 hover:bg-[#FFF1F2] hover:text-[#ED1C24]",
      backHover: "hover:border-white/85 hover:text-white",
    },
    windtre: {
      heroBg: "bg-[#FF6A00]",
      heroTag: "text-[#FFF0E6]",
      heroBody: "text-[#FFF5EE]",
      accentText: "text-[#FF6A00]",
      accentBg: "bg-[#FF6A00]",
      accentBgHover: "hover:bg-[#E35F00]",
      dot: "bg-[#FF6A00]",
      linkHover: "hover:border-[#FF6A00]/45 hover:text-[#FF6A00]",
      sourceBorder: "border-[#FF6A00]/35",
      sourceBg: "bg-[#FFF5EE]",
      sourceLink: "text-[#B24A00] decoration-[#FF6A00]/40 hover:text-[#FF6A00]",
      relatedCard: "bg-[#FFF8F2] hover:border-[#FF6A00]/40 hover:bg-[#FFF1E8] hover:text-[#FF6A00]",
      backHover: "hover:border-white/85 hover:text-white",
    },
    fastweb: {
      heroBg: "bg-[#111111]",
      heroTag: "text-[#FFE680]",
      heroBody: "text-[#FFF4CC]",
      accentText: "text-[#C79700]",
      accentBg: "bg-[#F5C400]",
      accentBgHover: "hover:bg-[#E4B500]",
      dot: "bg-[#F5C400]",
      linkHover: "hover:border-[#C79700]/45 hover:text-[#C79700]",
      sourceBorder: "border-[#F5C400]/35",
      sourceBg: "bg-[#FFF8DA]",
      sourceLink: "text-[#8A6900] decoration-[#F5C400]/40 hover:text-[#C79700]",
      relatedCard: "bg-[#FFFBEC] hover:border-[#F5C400]/40 hover:bg-[#FFF4CB] hover:text-[#8A6900]",
      backHover: "hover:border-white/85 hover:text-white",
    },
    "very-mobile": {
      heroBg: "bg-[#00A651]",
      heroTag: "text-[#E6FFEF]",
      heroBody: "text-[#F0FFF6]",
      accentText: "text-[#00A651]",
      accentBg: "bg-[#00A651]",
      accentBgHover: "hover:bg-[#009349]",
      dot: "bg-[#00A651]",
      linkHover: "hover:border-[#00A651]/45 hover:text-[#00A651]",
      sourceBorder: "border-[#00A651]/35",
      sourceBg: "bg-[#ECFFF4]",
      sourceLink: "text-[#007E3E] decoration-[#00A651]/40 hover:text-[#00A651]",
      relatedCard: "bg-[#F5FFF9] hover:border-[#00A651]/40 hover:bg-[#EFFFF5] hover:text-[#00A651]",
      backHover: "hover:border-white/85 hover:text-white",
    },
    "ho-mobile": {
      heroBg: "bg-[#00AFAA]",
      heroTag: "text-[#DDFDFC]",
      heroBody: "text-[#ECFFFE]",
      accentText: "text-[#008C88]",
      accentBg: "bg-[#00AFAA]",
      accentBgHover: "hover:bg-[#009A95]",
      dot: "bg-[#00AFAA]",
      linkHover: "hover:border-[#00AFAA]/45 hover:text-[#008C88]",
      sourceBorder: "border-[#00AFAA]/35",
      sourceBg: "bg-[#ECFEFE]",
      sourceLink: "text-[#006B67] decoration-[#00AFAA]/40 hover:text-[#008C88]",
      relatedCard: "bg-[#F3FFFF] hover:border-[#00AFAA]/40 hover:bg-[#E9FEFD] hover:text-[#008C88]",
      backHover: "hover:border-white/85 hover:text-white",
    },
    "digi-mobile": {
      heroBg: "bg-[#0047AB]",
      heroTag: "text-[#E8F1FF]",
      heroBody: "text-[#F1F6FF]",
      accentText: "text-[#0047AB]",
      accentBg: "bg-[#0047AB]",
      accentBgHover: "hover:bg-[#003D93]",
      dot: "bg-[#0047AB]",
      linkHover: "hover:border-[#0047AB]/45 hover:text-[#0047AB]",
      sourceBorder: "border-[#0047AB]/35",
      sourceBg: "bg-[#EDF4FF]",
      sourceLink: "text-[#00357E] decoration-[#0047AB]/40 hover:text-[#0047AB]",
      relatedCard: "bg-[#F5F9FF] hover:border-[#0047AB]/40 hover:bg-[#ECF3FF] hover:text-[#0047AB]",
      backHover: "hover:border-white/85 hover:text-white",
    },
  };

  const theme = themeBySlug[service.slug] ?? {
        heroBg: "bg-slate-950",
        heroTag: "text-cyan-400",
        heroBody: "text-slate-300",
        accentText: "text-cyan-700",
        accentBg: "bg-cyan-500",
        accentBgHover: "hover:bg-cyan-400",
        dot: "bg-cyan-600",
        linkHover: "hover:border-cyan-300 hover:text-cyan-700",
        sourceBorder: "border-cyan-200",
        sourceBg: "bg-cyan-50/60",
        sourceLink: "text-cyan-800 decoration-cyan-300 hover:text-cyan-700",
        relatedCard: "bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700",
        backHover: "hover:border-cyan-400 hover:text-cyan-200",
      };

  return (
    <div className="pb-24">
      <section className={`hero-gradient pt-40 pb-16 text-white ${theme.heroBg}`}>
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-5">
            <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${theme.heroTag}`}>Telefonia</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{service.title}</h1>
            <p className={`text-base md:text-lg ${theme.heroBody}`}>{service.heroDescription}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/consulenza?service=telefonia"
                className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition ${theme.accentBg} ${theme.accentBgHover}`}
              >
                Richiedi consulenza
              </Link>
              <Link
                href="/servizi/telefonia"
                className={`rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition ${theme.backHover}`}
              >
                Torna a telefonia
              </Link>
            </div>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Info rapide</p>
            <p className="mt-3 text-sm text-slate-200">{service.shortDescription}</p>
          </div>
        </Container>
      </section>

      <div className="lux-surface pb-20 text-slate-900">
        <section className="-mt-8 py-6">
          <Container>
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Categoria</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Telefonia</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Modalità</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">Attivazione assistita</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Supporto</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">In sede</p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accentText}`}>
                Vantaggi cliente finale
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Perché scegliere questa soluzione</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.customerBenefits.map((item) => (
                  <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accentText}`}>
                Cosa portare
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Checklist attivazione</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {service.requiredInfo.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </Container>
        </section>

        <section className="py-4">
          <Container className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Raccolta dati",
                text: "Verifica anagrafica, esigenze d'uso e dati linea attuale.",
              },
              {
                title: "2. Scelta piano",
                text: "Confronto opzioni con supporto pratico alla decisione.",
              },
              {
                title: "3. Avvio pratica",
                text: "Attivazione o portabilità con assistenza operativa locale.",
              },
            ].map((step) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </article>
            ))}
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accentText}`}>Note operative</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Prima di confermare</h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {service.notes.map((item) => (
                  <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
              {service.officialSources && service.officialSources.length > 0 ? (
                <div className={`mt-7 rounded-2xl border p-5 ${theme.sourceBorder} ${theme.sourceBg}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accentText}`}>
                    Fonti ufficiali
                  </p>
                  <ul className="mt-4 grid gap-2">
                    {service.officialSources.map((source) => (
                      <li key={source.url}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm font-medium underline underline-offset-4 transition ${theme.sourceLink}`}
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Container>
        </section>

        <section className="py-4">
          <Container>
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accentText}`}>Operatori collegati</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Altre tipologie telefonia</h2>
                </div>
                <Link
                  href="/servizi/telefonia"
                  className={`rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition ${theme.linkHover}`}
                >
                  Vedi tutti
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {relatedServices.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/servizi/telefonia/${item.slug}`}
                    className={`rounded-2xl border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition ${theme.relatedCard}`}
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
  );
}
