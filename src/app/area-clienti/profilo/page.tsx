import Link from "next/link";
import Container from "@/components/Container";
import ClientProfilePanel from "@/components/client-area/ClientProfilePanel";
import { buildMetadata } from "@/lib/seo";

export function generateMetadata() {
  return buildMetadata({
    title: "Profilo Cliente",
    description: "Riepilogo del profilo attivo nell'area clienti AG SERVIZI.",
    path: "/area-clienti/profilo",
  });
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AreaClientiProfiloPage() {
  return (
    <div className="min-h-full bg-[var(--paper)] text-[var(--ink)]">
        <section className="border-b border-[var(--ink)]/10 px-5 py-8 md:px-8">
          <nav className="mb-5 flex items-center gap-2 text-xs text-[var(--ink)]/45">
            <Link href="/area-clienti" className="transition hover:text-[var(--ink)]">Dashboard</Link>
            <Chevron />
            <span>Profilo</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ink)]/40">Area clienti</p>
          <h1 className="display-type mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)]">Impostazioni account</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/55">
            Dati anagrafici, contatti e sicurezza del tuo accesso all&apos;area clienti.
          </p>
        </section>

      <Container className="py-8 pb-16">
        <ClientProfilePanel />
      </Container>
    </div>
  );
}
