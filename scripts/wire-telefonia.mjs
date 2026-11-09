import fs from "node:fs";

let detail = fs.readFileSync("src/app/servizi/telefonia/[slug]/page.tsx", "utf8");
detail = detail.replace(
  'import { getPhoneServiceBySlug, phoneServiceDetails } from "@/lib/phone-services";',
  'import { getCmsPhoneServices } from "@/lib/cms/server";\n\nfunction getPhoneServiceBySlug(slug: string) {\n  return getCmsPhoneServices().find((item) => item.slug === slug) ?? null;\n}\n\nconst phoneServiceDetails = getCmsPhoneServices();',
);
fs.writeFileSync("src/app/servizi/telefonia/[slug]/page.tsx", detail);

let index = fs.readFileSync("src/app/servizi/telefonia/page.tsx", "utf8");
index = index.replace(
  'import { phoneServiceDetails } from "@/lib/phone-services";',
  'import { getCmsPhoneServices } from "@/lib/cms/server";\n\nconst phoneServiceDetails = getCmsPhoneServices();',
);
fs.writeFileSync("src/app/servizi/telefonia/page.tsx", index);

console.log("telefonia cms");
