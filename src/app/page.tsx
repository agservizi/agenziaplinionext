import VideoHero from "@/components/VideoHero";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import HomeContent from "@/components/HomeContent";
import { buildMetadata } from "@/lib/seo";
import { getYearsActive } from "@/lib/site-data";

export default function Home() {
  return (
    <div>
      <VideoHero
        headingWords={["Servizi", "Senza", "Attese"]}
        stats={[
          { value: 500, label: "Clienti\nAttivi" },
          { value: 30, label: "Servizi\nGestiti" },
          { value: getYearsActive(), label: "Anni\nEsperienza" },
        ]}
        tagline={"Un Punto Di\nRiferimento Per\nLe Tue Esigenze"}
        description="Agenzia di servizi completa a Castellammare di Stabia. Pagamenti, telefonia, energia, logistica, SPID, PEC e siti web dal 2016."
        ctaText="Contattaci"
        ctaHref="/contatti"
      />
      <MarqueeStrip />
      <HomeContent />
    </div>
  );
}

export function generateMetadata() {
  return buildMetadata({
    title: "AG SERVIZI | Pagamenti, Telefonia, Luce e Gas a Castellammare di Stabia",
    description:
      "AG SERVIZI a Castellammare di Stabia: pagamenti bollettini, SPID, PEC, telefonia, luce e gas. Consulenza professionale dal 2016.",
    path: "/",
  });
}
