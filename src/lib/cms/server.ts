import "server-only";
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
