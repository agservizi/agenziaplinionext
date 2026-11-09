import fs from "node:fs";
import path from "node:path";
import { company, navigation, values, serviceCategories } from "../src/lib/site-data";
import { faqs } from "../src/lib/faq-data";
import { googleReviews } from "../src/lib/google-reviews";
import { phoneServiceDetails } from "../src/lib/phone-services";
import { energyServiceDetails } from "../src/lib/energy-services";
import { digitalServiceDetails } from "../src/lib/digital-services";
import { paymentServiceDetails } from "../src/lib/payment-services";
import { logisticsServiceDetails } from "../src/lib/logistics-services";
import { webAgencyServiceDetails } from "../src/lib/web-agency-services";

const root = process.cwd();

function writeJson(rel: string, data: unknown) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", rel);
}

function slugify(input: string) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

writeJson("content/site-settings.json", {
  companyName: company.name,
  legalName: company.legalName,
  address: company.address,
  vat: company.vat,
  sdi: company.sdi,
  openedYear: company.openedYear,
  openedMonth: company.openedMonth,
  openedDay: company.openedDay,
  phone: company.phone,
  whatsapp: company.whatsapp,
  googleBusinessUrl: company.googleBusinessUrl,
  marqueeItems: [
    "Pagamenti & Bollettini",
    "Telefonia & Energia",
    "SPID · PEC · Firma Digitale",
    "Spedizioni BRT & InPost",
    "Deposito Bagagli",
    "CAF & Patronato",
    "Web Agency",
    "Area Clienti Online",
  ],
  openingHours: [
    { day: "Lun – Ven", hours: "08:45–13:20 / 16:20–19:00" },
    { day: "Sabato", hours: "09:20–12:30" },
    { day: "Domenica", hours: "Chiuso" },
  ],
  navigation,
  values,
  serviceCategories,
});

/**
 * Fact-forcing: seed for Keystatic home singleton; keeps hero copy in sync with page FALLBACK.
 * User: "cambierei il copy nella home hero in TUTTI I TUOI SERVIZI. IN UN UNICO POSTO..."
 */
writeJson("content/home-page.json", {
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
});

faqs.forEach((faq, index) => {
  const slug = slugify(faq.q);
  writeJson(`content/faqs/${slug}.json`, {
    question: faq.q,
    answer: faq.a,
    order: index,
  });
});

googleReviews.forEach((review, index) => {
  const slug = slugify(review.name) || `review-${index}`;
  writeJson(`content/reviews/${slug}.json`, {
    name: review.name,
    initials: review.initials,
    color: review.color,
    rating: review.rating,
    text: review.text || "",
    order: index,
  });
});

type Svc = {
  slug: string;
  title: string;
  shortDescription: string;
  heroDescription: string;
  customerBenefits: string[];
  requiredInfo: string[];
  notes: string[];
  officialSources?: Array<{ label: string; url: string }>;
};

function writeServices(category: string, list: Svc[]) {
  for (const svc of list) {
    writeJson(`content/services/${category}--${svc.slug}.json`, {
      title: svc.title,
      category,
      shortDescription: svc.shortDescription,
      heroDescription: svc.heroDescription,
      customerBenefits: svc.customerBenefits,
      requiredInfo: svc.requiredInfo,
      notes: svc.notes,
      officialSources: svc.officialSources || [],
    });
  }
}

writeServices("telefonia", phoneServiceDetails);
writeServices("energia", energyServiceDetails);
writeServices("digitali", digitalServiceDetails);
writeServices("pagamenti", paymentServiceDetails);
writeServices("logistica", logisticsServiceDetails);
writeServices("web-agency", webAgencyServiceDetails);

console.log("seed complete");
