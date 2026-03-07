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

export default function AreaClientiProfiloPage() {
  return (
    <div className="pb-24">
      <section className="hero-gradient bg-slate-950 pt-40 pb-16 text-white">
        <Container>
          <ClientProfilePanel />
        </Container>
      </section>
    </div>
  );
}
