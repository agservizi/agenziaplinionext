import Link from "next/link";
import Container from "@/components/Container";
import OpenApiVisureWorkspace from "@/components/client-area/OpenApiVisureWorkspace";
import { buildMetadata } from "@/lib/seo";
import { getClientAreaConfig } from "@/lib/client-area";

const area = getClientAreaConfig("visure");

export function generateMetadata() {
  return buildMetadata({
    title: "Area Clienti Visure",
    description:
      "Area clienti dedicata a visure camerali, catastali, PRA, CRIF e CR con richiesta strutturata e presa in carico.",
    path: "/area-clienti/visure",
  });
}

export default function AreaClientiVisurePage() {
  if (!area) return null;

  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">{area.eyebrow}</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">{area.title}</h1>
            <p className="text-base text-slate-300 md:text-lg">{area.description}</p>
            <Link
              href="/area-clienti"
              className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:border-slate-600 hover:bg-slate-900"
            >
              Torna alla dashboard
            </Link>
          </div>
          <div className="glass-card rounded-4xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Servizi gestiti</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {area.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <div className="lux-surface pt-10 text-slate-900">
        <section className="py-10">
          <Container>
            <OpenApiVisureWorkspace area={area} />
          </Container>
        </section>
      </div>
    </div>
  );
}
