import Link from "next/link";
import OpenApiVisureHistory from "@/components/client-area/OpenApiVisureHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico Visure | Area Clienti",
    description: "Storico richieste visure con stato pratica e documenti disponibili.",
    path: "/area-clienti/visure/storico",
  });
}

export default function AreaClientiVisureStoricoPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area clienti · Visure</p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Storico visure</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Stato pratica, riferimento richiesta e documento disponibile per ogni visura inviata.
        </p>
        <Link
          href="/area-clienti/visure"
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7] hover:underline"
        >
          Nuova visura
        </Link>
      </section>
      <div className="px-5 py-8 md:px-8">
        <OpenApiVisureHistory />
      </div>
    </div>
  );
}