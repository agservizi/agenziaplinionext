import VideoHero from "@/components/VideoHero";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import HomeContent from "@/components/HomeContent";
import { buildMetadata } from "@/lib/seo";
import { getYearsActive } from "@/lib/site-data";
import { getCmsHome, getCmsMarqueeItems } from "@/lib/cms/server";

const FALLBACK = {
  headingWords: ["TUTTI I TUOI SERVIZI.", "IN UN UNICO POSTO"],
  tagline: "Bollette, SPID, energia, spedizioni e siti web.\nQui li trovi tutti, senza girare.",
  description:
    "Pagamenti, telefonia, energia, spedizioni, SPID, PEC e siti web. In Via Plinio il Vecchio 72 a Castellammare di Stabia, dal 2016.",
  ctaText: "Contattaci",
  ctaHref: "/contatti",
  stats: [
    { value: "500", label: "Clienti\nAttivi" },
    { value: "30", label: "Servizi\nGestiti" },
    { value: "years", label: "Anni\nAperti" },
  ],
  seoTitle: "AG SERVIZI | Pagamenti, Telefonia, Luce e Gas a Castellammare di Stabia",
  seoDescription:
    "AG SERVIZI a Castellammare di Stabia: bollettini, SPID, PEC, telefonia, luce e gas, spedizioni e siti web. In Via Plinio 72, dal 2016.",
};

export default function Home() {
  const home = { ...FALLBACK, ...(getCmsHome() || {}) };
  const stats = (home.stats || FALLBACK.stats).map((stat) => ({
    value: stat.value === "years" ? getYearsActive() : Number(stat.value) || 0,
    label: stat.label,
  }));

  return (
    <div className="home-brutal">
      <VideoHero
        headingWords={(home.headingWords?.length ? home.headingWords : FALLBACK.headingWords).slice(0, 4)}
        stats={stats.slice(0, 3) as [{ value: number; label: string }, { value: number; label: string }, { value: number; label: string }]}
        tagline={home.tagline || FALLBACK.tagline}
        description={home.description || FALLBACK.description}
        ctaText={home.ctaText || FALLBACK.ctaText}
        ctaHref={home.ctaHref || FALLBACK.ctaHref}
      />
      <MarqueeStrip items={getCmsMarqueeItems()} />
      <HomeContent />
    </div>
  );
}

export const revalidate = 3600;

export function generateMetadata() {
  const home = { ...FALLBACK, ...(getCmsHome() || {}) };
  return buildMetadata({
    title: home.seoTitle || FALLBACK.seoTitle,
    description: home.seoDescription || FALLBACK.seoDescription,
    path: "/",
  });
}

