import fs from "node:fs";

// Replace reader.ts with thin re-exports from fs for area-admin pages
fs.writeFileSync(
  "src/lib/cms/reader.ts",
  `import { listCmsJsonDir, readCmsJson } from "@/lib/cms/fs";

/** Sync CMS readers for Brutal /area-admin. User: Keystatic CMS plan. */
export async function readSiteSettings() {
  return readCmsJson<Record<string, unknown>>("content/site-settings.json");
}

export async function readHomePage() {
  return readCmsJson<Record<string, unknown>>("content/home-page.json");
}

export async function readFaqs() {
  return listCmsJsonDir("content/faqs")
    .map((entry) => ({
      slug: entry.slug,
      q: String(entry.data.question ?? ""),
      a: String(entry.data.answer ?? ""),
      order: Number(entry.data.order ?? 0),
    }))
    .filter((f) => f.q)
    .sort((a, b) => a.order - b.order);
}

export async function readReviews() {
  return listCmsJsonDir("content/reviews")
    .map((entry) => ({
      slug: entry.slug,
      name: String(entry.data.name ?? ""),
      initials: String(entry.data.initials ?? ""),
      color: String(entry.data.color ?? "bg-slate-500"),
      rating: Number(entry.data.rating ?? 5),
      text: entry.data.text ? String(entry.data.text) : null,
      order: Number(entry.data.order ?? 0),
    }))
    .filter((r) => r.name)
    .sort((a, b) => a.order - b.order);
}

export async function readServices(category?: string) {
  return listCmsJsonDir("content/services")
    .map((entry) => ({
      slug: entry.slug.includes("--") ? entry.slug.split("--").slice(1).join("--") : entry.slug,
      fileSlug: entry.slug,
      category: String(entry.data.category ?? ""),
      title: String(entry.data.title ?? ""),
      shortDescription: String(entry.data.shortDescription ?? ""),
      heroDescription: String(entry.data.heroDescription ?? ""),
      customerBenefits: ((entry.data.customerBenefits as string[]) || []).map(String),
      requiredInfo: ((entry.data.requiredInfo as string[]) || []).map(String),
      notes: ((entry.data.notes as string[]) || []).map(String),
      officialSources: ((entry.data.officialSources as Array<{ label: string; url: string }>) || []).map((s) => ({
        label: String(s.label ?? ""),
        url: String(s.url ?? ""),
      })),
    }))
    .filter((s) => !category || s.category === category);
}
`,
);

console.log("reader simplified");
