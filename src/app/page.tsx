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
          { value: getYearsActive(), label: "Anni\nAperti" },
        ]}
        tagline={"Ci Pensiamo\nNoi. Vieni\nE Basta."}
        description="Pagamenti, telefonia, energia, spedizioni, SPID, PEC e siti web. In Via Plinio il Vecchio 72 a Castellammare di Stabia, dal 2016."
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
      "AG SERVIZI a Castellammare di Stabia: bollettini, SPID, PEC, telefonia, luce e gas, spedizioni e siti web. In Via Plinio 72, dal 2016.",
    path: "/",
  });
}
