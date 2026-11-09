import fs from "node:fs";

// --- faq-data.ts: keep fallback array, export cms-aware faqs ---
const faqFallback = fs.readFileSync("src/lib/faq-data.ts", "utf8");
if (!faqFallback.includes("listCmsJson")) {
  const patched =
    `import { listCmsJsonDir } from "@/lib/cms/fs";\n\n` +
    faqFallback.replace(
      "export const faqs = [",
      `const fallbackFaqs = [`,
    ) +
    `\nfunction loadFaqs() {
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

export const faqs = loadFaqs();
`;
  fs.writeFileSync("src/lib/faq-data.ts", patched);
  console.log("faq-data patched");
}

// --- google-reviews.ts ---
let reviewsSrc = fs.readFileSync("src/lib/google-reviews.ts", "utf8");
if (!reviewsSrc.includes("listCmsJsonDir")) {
  reviewsSrc =
    `import { listCmsJsonDir } from "@/lib/cms/fs";\n\n` +
    reviewsSrc.replace("export const googleReviews: GoogleReview[] = [", "const fallbackGoogleReviews: GoogleReview[] = [");
  // find end of array - last ]; before googleReviewsCount
  reviewsSrc = reviewsSrc.replace(
    /const fallbackGoogleReviews: GoogleReview\[\] = \[[\s\S]*?\];/,
    (m) =>
      m +
      `\n\nfunction loadGoogleReviews(): GoogleReview[] {
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
    .map(({ order: _order, ...rest }) => rest);
  return fromCms.length ? fromCms : fallbackGoogleReviews;
}

export const googleReviews: GoogleReview[] = loadGoogleReviews();
`,
  );
  fs.writeFileSync("src/lib/google-reviews.ts", reviewsSrc);
  console.log("google-reviews patched");
}

// --- phone-services: load from CMS ---
let phone = fs.readFileSync("src/lib/phone-services.ts", "utf8");
if (!phone.includes("listCmsJsonDir")) {
  phone =
    `import { listCmsJsonDir } from "@/lib/cms/fs";\n\n` +
    phone.replace(
      "export const phoneServiceDetails: PhoneServiceDetail[] = [",
      "const fallbackPhoneServiceDetails: PhoneServiceDetail[] = [",
    );
  phone = phone.replace(
    /const fallbackPhoneServiceDetails: PhoneServiceDetail\[\] = \[[\s\S]*?\];\n\nexport function getPhoneServiceBySlug/,
    (m) => {
      const withoutFn = m.replace(/\n\nexport function getPhoneServiceBySlug$/, "");
      return (
        withoutFn +
        `\n\nfunction loadPhoneServices(): PhoneServiceDetail[] {
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
  return fromCms.length ? fromCms : fallbackPhoneServiceDetails;
}

export const phoneServiceDetails: PhoneServiceDetail[] = loadPhoneServices();

export function getPhoneServiceBySlug`
      );
    },
  );
  fs.writeFileSync("src/lib/phone-services.ts", phone);
  console.log("phone-services patched");
}

console.log("wire step1 done");
