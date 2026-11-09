import fs from "node:fs";

// Revert faq-data to pure fallbacks (no fs) for client safety; keep CMS load behind server-only helper
fs.writeFileSync(
  "src/lib/cms/server.ts",
  `import "server-only";
import { listCmsJsonDir, readCmsJson } from "@/lib/cms/fs";
import { faqs as fallbackFaqs } from "@/lib/faq-data";
import { googleReviews as fallbackReviews } from "@/lib/google-reviews";
import { phoneServiceDetails as fallbackPhone } from "@/lib/phone-services";

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
  const fromCms = listCmsJsonDir("content/services")
    .filter((e) => String(e.data.category) === "telefonia")
    .map((entry) => {
      const slug = entry.slug.includes("--") ? entry.slug.split("--").slice(1).join("--") : entry.slug;
      return {
        slug,
        title: String(entry.data.title ?? ""),
        shortDescription: String(entry.data.shortDescription ?? ""),
        heroDescription: String(entry.data.heroDescription ?? ""),
        customerBenefits: (entry.data.customerBenefits as string[]) || [],
        requiredInfo: (entry.data.requiredInfo as string[]) || [],
        notes: (entry.data.notes as string[]) || [],
        officialSources: (entry.data.officialSources as Array<{ label: string; url: string }>) || [],
      };
    })
    .filter((s) => s.slug && s.title);
  return fromCms.length ? fromCms : fallbackPhone;
}

export function getCmsHome() {
  return readCmsJson("content/home-page.json");
}

export function getCmsSiteSettings() {
  return readCmsJson("content/site-settings.json");
}
`,
);

// Strip fs from faq-data
let faq = fs.readFileSync("src/lib/faq-data.ts", "utf8");
faq = faq.replace(/import \{ listCmsJsonDir \} from "@\/lib\/cms\/fs";\n\n/, "");
faq = faq.replace("const fallbackFaqs = [", "export const faqs = [");
faq = faq.replace(/\nfunction loadFaqs\(\)[\s\S]*export const faqs = loadFaqs\(\);\n?/, "\n");
fs.writeFileSync("src/lib/faq-data.ts", faq);
console.log("faq reverted");

// Strip fs from google-reviews
let rev = fs.readFileSync("src/lib/google-reviews.ts", "utf8");
rev = rev.replace(/import \{ listCmsJsonDir \} from "@\/lib\/cms\/fs";\n\n/, "");
rev = rev.replace("const fallbackGoogleReviews: GoogleReview[] = [", "export const googleReviews: GoogleReview[] = [");
rev = rev.replace(/\nfunction loadGoogleReviews\(\)[\s\S]*export const googleReviews: GoogleReview\[\] = loadGoogleReviews\(\);\n?/, "\n");
fs.writeFileSync("src/lib/google-reviews.ts", rev);
console.log("reviews reverted");

// Strip fs from phone-services
let phone = fs.readFileSync("src/lib/phone-services.ts", "utf8");
phone = phone.replace(/import \{ listCmsJsonDir \} from "@\/lib\/cms\/fs";\n\n/, "");
phone = phone.replace("const fallbackPhoneServiceDetails: PhoneServiceDetail[] = [", "export const phoneServiceDetails: PhoneServiceDetail[] = [");
phone = phone.replace(/\nfunction loadPhoneServices\(\)[\s\S]*export const phoneServiceDetails: PhoneServiceDetail\[\] = loadPhoneServices\(\);\n?/, "\n");
fs.writeFileSync("src/lib/phone-services.ts", phone);
console.log("phone reverted");

for (const file of [
  "src/lib/energy-services.ts",
  "src/lib/digital-services.ts",
  "src/lib/payment-services.ts",
  "src/lib/logistics-services.ts",
  "src/lib/web-agency-services.ts",
]) {
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(/import \{ listCmsJsonDir \} from "@\/lib\/cms\/fs";\n\n/, "");
  s = s.replace(/const fallback(\w+):/g, "export const $1:".replace("$1", (m) => m)); // noop wrong
  // replace fallbackX with export const originalName - detect from loadCmsServices export line
  const exp = s.match(/export const (\w+):/);
  const fb = s.match(/const (fallback\w+):/);
  if (fb && exp) {
    // already has export from load - remove loader block and rename fallback to export
    s = s.replace(`const ${fb[1]}:`, `export const ${exp[1]}:`);
    s = s.replace(/\nfunction loadCmsServices\(\)[\s\S]*export const \w+:[\s\S]*? = loadCmsServices\(\);\n?/, "\n");
  } else if (fb) {
    const name = fb[1].replace(/^fallback/, "");
    const camel = name.charAt(0).toLowerCase() + name.slice(1);
    // energy: fallbackEnergyServiceDetails -> energyServiceDetails
    const exportName = fb[1].replace(/^fallback/, "");
    const fixed = exportName.charAt(0).toLowerCase() + exportName.slice(1);
    // fallbackEnergyServiceDetails -> EnergyServiceDetails -> energyServiceDetails
    const proper = fb[1].replace(/^fallback/, "");
    const properExport = proper.charAt(0).toLowerCase() + proper.slice(1);
    s = s.replace(`const ${fb[1]}:`, `export const ${properExport}:`);
    s = s.replace(/\nfunction loadCmsServices\(\)[\s\S]*export const \w+:[\s\S]*? = loadCmsServices\(\);\n?/, "\n");
  }
  fs.writeFileSync(file, s);
  console.log("reverted", file);
}

// Strip site-data overlay
let site = fs.readFileSync("src/lib/site-data.ts", "utf8");
const cut = site.indexOf("\nimport { readCmsJson }");
if (cut !== -1) {
  site = site.slice(0, cut) + "\n";
  // keep getMarqueeItems without cms - add simple export
  site += `
export function getMarqueeItems(): string[] {
  return [
    "Bollettini",
    "PagoPA",
    "SPID",
    "PEC",
    "Firma digitale",
    "BRT",
    "SEND",
    "Luce e gas",
    "Telefonia",
    "CAF",
    "Deposito bagagli",
    "Fermo deposito",
  ];
}

export function getOpeningHours() {
  return [
    { day: "Lun – Ven", hours: "08:45–13:20 / 16:20–19:00" },
    { day: "Sabato", hours: "09:20–12:30" },
    { day: "Domenica", hours: "Chiuso" },
  ];
}
`;
  fs.writeFileSync("src/lib/site-data.ts", site);
  console.log("site-data cleaned");
}

console.log("done revert client-safe");
