import fs from "node:fs";

// Expand server.ts with all service categories + site settings marquee
fs.writeFileSync(
  "src/lib/cms/server.ts",
  `import "server-only";
import { listCmsJsonDir, readCmsJson } from "@/lib/cms/fs";
import { faqs as fallbackFaqs } from "@/lib/faq-data";
import { googleReviews as fallbackReviews } from "@/lib/google-reviews";
import { phoneServiceDetails as fallbackPhone } from "@/lib/phone-services";
import { energyServiceDetails as fallbackEnergy } from "@/lib/energy-services";
import { digitalServiceDetails as fallbackDigital } from "@/lib/digital-services";
import { paymentServiceDetails as fallbackPayment } from "@/lib/payment-services";
import { logisticsServiceDetails as fallbackLogistics } from "@/lib/logistics-services";
import { webAgencyServiceDetails as fallbackWeb } from "@/lib/web-agency-services";
import { getMarqueeItems as fallbackMarquee } from "@/lib/site-data";

type ServiceRow = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
  officialSources?: Array<{ label: string; url: string }>;
};

function loadServices(category: string, fallback: ServiceRow[]): ServiceRow[] {
  const fromCms = listCmsJsonDir("content/services")
    .filter((e) => String(e.data.category) === category)
    .map((entry) => {
      const slug = entry.slug.includes("--") ? entry.slug.split("--").slice(1).join("--") : entry.slug;
      return {
        slug,
        title: String(entry.data.title ?? ""),
        shortDescription: String(entry.data.shortDescription ?? ""),
        heroDescription: String(entry.data.heroDescription ?? ""),
        customerBenefits: ((entry.data.customerBenefits as string[]) || []).map(String),
        requiredInfo: ((entry.data.requiredInfo as string[]) || []).map(String),
        notes: ((entry.data.notes as string[]) || []).map(String),
        officialSources: (entry.data.officialSources as Array<{ label: string; url: string }>) || undefined,
      };
    })
    .filter((s) => s.slug && s.title);
  return fromCms.length ? fromCms : fallback;
}

export function getCmsFaqs() {
  const fromCms = listCmsJsonDir("content/faqs")
    .map((entry) => ({
      q: String(entry.data.question ?? ""),
      a: String(entry.data.answer ?? ""),
      order: Number(entry.data.order ?? 0),
    }))
    .filter((f) => f.q)
    .sort((a, b) => a.order - b.order)
    .map(({ q, a }) => ({ q, a }));
  return fromCms.length ? fromCms : fallbackFaqs;
}

export function getCmsReviews() {
  const fromCms = listCmsJsonDir("content/reviews")
    .map((entry) => ({
      name: String(entry.data.name ?? ""),
      initials: String(entry.data.initials ?? ""),
      color: String(entry.data.color ?? "bg-slate-500"),
      rating: Number(entry.data.rating ?? 5),
      text: entry.data.text ? String(entry.data.text) : null,
      order: Number(entry.data.order ?? 0),
    }))
    .filter((r) => r.name)
    .sort((a, b) => a.order - b.order)
    .map(({ order: _o, ...rest }) => rest);
  return fromCms.length ? fromCms : fallbackReviews;
}

export function getCmsPhoneServices() {
  return loadServices("telefonia", fallbackPhone);
}

export function getCmsEnergyServices() {
  return loadServices("energia", fallbackEnergy);
}

export function getCmsDigitalServices() {
  return loadServices("digitali", fallbackDigital);
}

export function getCmsPaymentServices() {
  return loadServices("pagamenti", fallbackPayment);
}

export function getCmsLogisticsServices() {
  return loadServices("logistica", fallbackLogistics);
}

export function getCmsWebAgencyServices() {
  return loadServices("web-agency", fallbackWeb);
}

export function getCmsHome() {
  return readCmsJson<{
    headingWords?: string[];
    tagline?: string;
    description?: string;
    ctaText?: string;
    ctaHref?: string;
    stats?: Array<{ value: string; label: string }>;
    seoTitle?: string;
    seoDescription?: string;
  }>("content/home-page.json");
}

export function getCmsMarqueeItems() {
  const settings = readCmsJson<{ marqueeItems?: string[] }>("content/site-settings.json");
  return settings?.marqueeItems?.length ? settings.marqueeItems : fallbackMarquee();
}
`,
);

// Update page.tsx to use server helpers
fs.writeFileSync(
  "src/app/page.tsx",
  `import VideoHero from "@/components/VideoHero";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import HomeContent from "@/components/HomeContent";
import ShopHomeSection from "@/components/home/ShopHomeSection";
import { buildMetadata } from "@/lib/seo";
import { getYearsActive } from "@/lib/site-data";
import { getCmsHome, getCmsMarqueeItems } from "@/lib/cms/server";

const FALLBACK = {
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

export default function Home() {
  const home = { ...FALLBACK, ...(getCmsHome() || {}) };
  const stats = (home.stats || FALLBACK.stats).map((stat) => ({
    value: stat.value === "years" ? getYearsActive() : Number(stat.value) || 0,
    label: stat.label,
  }));

  return (
    <div>
      <VideoHero
        headingWords={home.headingWords || FALLBACK.headingWords}
        stats={stats}
        tagline={home.tagline || FALLBACK.tagline}
        description={home.description || FALLBACK.description}
        ctaText={home.ctaText || FALLBACK.ctaText}
        ctaHref={home.ctaHref || FALLBACK.ctaHref}
      />
      <MarqueeStrip items={getCmsMarqueeItems()} />
      <HomeContent />
      <ShopHomeSection />
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
`.replace(/\\\\n/g, "\\n"),
);

// FaqJsonLd
fs.writeFileSync(
  "src/components/seo/FaqJsonLd.tsx",
  `import { getCmsFaqs } from "@/lib/cms/server";

export default function FaqJsonLd() {
  const faqs = getCmsFaqs();
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
`,
);

console.log("server cms wired");
