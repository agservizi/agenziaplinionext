import Link from "next/link";
import CafPatronatoHistory from "@/components/client-area/CafPatronatoHistory";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Storico pratiche CAF e Patronato",
    description:
      "Cronologia delle pratiche CAF e Patronato con documenti caricati, stato lavorazione e file evasi disponibili.",
    path: "/area-clienti/caf-patronato/storico",
  });
}

export default function AreaClientiCafStoricoPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">
          Area clienti · CAF e Patronato
        </p>
        <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Storico pratiche</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
          Avanzamento, documenti caricati e file evasi per ogni pratica CAF e Patronato avviata.
        </p>
        <Link
          href="/area-clienti/caf-patronato"
          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-[#5E0ED7] hover:underline"
        >
          Nuova pratica
        </Link>
      </section>
      <div className="px-5 py-8 md:px-8">
        <CafPatronatoHistory />
      </div>
    </div>
  );
}