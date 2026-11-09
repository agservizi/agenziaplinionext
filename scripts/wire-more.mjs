import fs from "node:fs";

function wireServiceFile(file, exportName, fallbackName, category) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("listCmsJsonDir")) {
    console.log("skip", file);
    return;
  }
  src = `import { listCmsJsonDir } from "@/lib/cms/fs";\n\n` + src;
  src = src.replace(
    new RegExp(`export const ${exportName}: \\w+\\[\\] = \\[`),
    `const ${fallbackName}: PhoneServiceDetail[] = [`.replace("PhoneServiceDetail", src.match(/export type (\\w+)/)?.[1] || "any"),
  );
  // simpler approach - replace export const X = [
  src = fs.readFileSync(file, "utf8");
  if (src.includes("listCmsJsonDir")) return;
  const typeMatch = src.match(/export type (\\w+)/);
  const typeName = typeMatch ? typeMatch[1] : "any";
  src =
    `import { listCmsJsonDir } from "@/lib/cms/fs";\n\n` +
    src.replace(`export const ${exportName}`, `const ${fallbackName}`);
  const loader = `

function loadCmsServices(): ${typeName}[] {
  const fromCms = listCmsJsonDir("content/services")
    .filter((e) => String(e.data.category) === "${category}")
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
        officialSources: (entry.data.officialSources as Array<{ label: string; url: string }>) || undefined,
      };
    })
    .filter((s) => s.slug && s.title);
  return fromCms.length ? fromCms : ${fallbackName};
}

export const ${exportName}: ${typeName}[] = loadCmsServices();
`;
  // Insert before first export function
  const idx = src.search(/\nexport function /);
  if (idx === -1) {
    src = src + loader;
  } else {
    src = src.slice(0, idx) + loader + src.slice(idx);
  }
  fs.writeFileSync(file, src);
  console.log("wired", file);
}

wireServiceFile("src/lib/energy-services.ts", "energyServiceDetails", "fallbackEnergyServiceDetails", "energia");
wireServiceFile("src/lib/digital-services.ts", "digitalServiceDetails", "fallbackDigitalServiceDetails", "digitali");
wireServiceFile("src/lib/payment-services.ts", "paymentServiceDetails", "fallbackPaymentServiceDetails", "pagamenti");
wireServiceFile("src/lib/logistics-services.ts", "logisticsServiceDetails", "fallbackLogisticsServiceDetails", "logistica");
wireServiceFile("src/lib/web-agency-services.ts", "webAgencyServiceDetails", "fallbackWebAgencyServiceDetails", "web-agency");

// site-data: overlay company/nav/values/categories from CMS
let site = fs.readFileSync("src/lib/site-data.ts", "utf8");
if (!site.includes("readCmsJson")) {
  site = `import { readCmsJson } from "@/lib/cms/fs";\n\n` + site;
  site = site.replace(
    "export const company = {",
    "const fallbackCompany = {",
  );
  site = site.replace(
    /const fallbackCompany = \{[\s\S]*?\};\n\nexport function getYearsActive/,
    (m) => {
      const body = m.replace(/\n\nexport function getYearsActive$/, "");
      return (
        body +
        `\n\ntype SiteSettingsCms = {
  companyName?: string;
  legalName?: string;
  address?: string;
  vat?: string;
  sdi?: string;
  openedYear?: number;
  openedMonth?: number;
  openedDay?: number;
  phone?: string;
  whatsapp?: string;
  googleBusinessUrl?: string;
  navigation?: Array<{ label: string; href: string }>;
  values?: Array<{ title: string; description: string }>;
  serviceCategories?: typeof serviceCategories;
  marqueeItems?: string[];
  openingHours?: Array<{ day: string; hours: string }>;
};

const cmsSettings = readCmsJson<SiteSettingsCms>("content/site-settings.json");

export const company = {
  name: cmsSettings?.companyName || fallbackCompany.name,
  legalName: cmsSettings?.legalName || fallbackCompany.legalName,
  address: cmsSettings?.address || fallbackCompany.address,
  vat: cmsSettings?.vat || fallbackCompany.vat,
  sdi: cmsSettings?.sdi || fallbackCompany.sdi,
  openedYear: cmsSettings?.openedYear || fallbackCompany.openedYear,
  openedMonth: cmsSettings?.openedMonth || fallbackCompany.openedMonth,
  openedDay: cmsSettings?.openedDay || fallbackCompany.openedDay,
  phone: cmsSettings?.phone || fallbackCompany.phone,
  whatsapp: cmsSettings?.whatsapp || fallbackCompany.whatsapp,
  googleBusinessUrl: cmsSettings?.googleBusinessUrl || fallbackCompany.googleBusinessUrl,
};

export function getYearsActive`
      );
    },
  );
  // This is getting messy because serviceCategories is used before defined.
  // Simpler: append overrides at end of file instead.
}
fs.writeFileSync("src/lib/site-data.ts", fs.readFileSync("src/lib/site-data.ts", "utf8")); // no-op if failed mid
console.log("services wired");
