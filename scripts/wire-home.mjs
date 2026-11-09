import fs from "node:fs";

// Patch page.tsx to async CMS home
fs.writeFileSync("src/app/page.tsx", `import VideoHero from "@/components/VideoHero";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import HomeContent from "@/components/HomeContent";
import ShopHomeSection from "@/components/home/ShopHomeSection";
import { buildMetadata } from "@/lib/seo";
import { getYearsActive } from "@/lib/site-data";
import { readCmsJson } from "@/lib/cms/fs";

type HomeCms = {
  headingWords?: string[];
  tagline?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  stats?: Array<{ value: string; label: string }>;
  seoTitle?: string;
  seoDescription?: string;
};

const FALLBACK_HOME: HomeCms = {
  headingWords: ["Servizi", "Senza", "Attese"],
  tagline: "Ci Pensiamo\\nNoi. Vieni\\nE Basta.",
  description:
    "Pagamenti, telefonia, energia, spedizioni, SPID, PEC e siti web. In Via Plinio il Vecchio 72 a Castellammare di Stabia, dal 2016.",
  ctaText: "Contattaci",
  ctaHref: "/contatti",
  stats: [
    { value: "500", label: "Clienti\\nAttivi" },
    { value: "30", label: "Servizi\\nGestiti" },
    { value: "years", label: "Anni\\nAperti" },
  ],
  seoTitle: "AG SERVIZI | Pagamenti, Telefonia, Luce e Gas a Castellammare di Stabia",
  seoDescription:
    "AG SERVIZI a Castellammare di Stabia: bollettini, SPID, PEC, telefonia, luce e gas, spedizioni e siti web. In Via Plinio 72, dal 2016.",
};

function loadHome(): HomeCms {
  return { ...FALLBACK_HOME, ...(readCmsJson<HomeCms>("content/home-page.json") || {}) };
}

export default function Home() {
  const home = loadHome();
  const stats = (home.stats || FALLBACK_HOME.stats || []).map((stat) => ({
    value: stat.value === "years" ? getYearsActive() : Number(stat.value) || 0,
    label: stat.label,
  }));

  return (
    <div>
      <VideoHero
        headingWords={home.headingWords || FALLBACK_HOME.headingWords!}
        stats={stats}
        tagline={home.tagline || FALLBACK_HOME.tagline!}
        description={home.description || FALLBACK_HOME.description!}
        ctaText={home.ctaText || FALLBACK_HOME.ctaText!}
        ctaHref={home.ctaHref || FALLBACK_HOME.ctaHref!}
      />
      <MarqueeStrip />
      <HomeContent />
      <ShopHomeSection />
    </div>
  );
}

export const revalidate = 3600;

export function generateMetadata() {
  const home = loadHome();
  return buildMetadata({
    title: home.seoTitle || FALLBACK_HOME.seoTitle!,
    description: home.seoDescription || FALLBACK_HOME.seoDescription!,
    path: "/",
  });
}
`);

console.log("page.tsx wired");
