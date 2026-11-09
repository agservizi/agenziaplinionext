import fs from "node:fs";
import path from "path";

const fixes = [
  { dir: "energia", getter: "getCmsEnergyServices", bySlug: "getEnergyServiceBySlug", details: "energyServiceDetails" },
  { dir: "digitali", getter: "getCmsDigitalServices", bySlug: "getDigitalServiceBySlug", details: "digitalServiceDetails" },
  { dir: "pagamenti", getter: "getCmsPaymentServices", bySlug: "getPaymentServiceBySlug", details: "paymentServiceDetails" },
  { dir: "logistica", getter: "getCmsLogisticsServices", bySlug: "getLogisticsServiceBySlug", details: "logisticsServiceDetails" },
  { dir: "web-agency", getter: "getCmsWebAgencyServices", bySlug: "getWebAgencyServiceBySlug", details: "webAgencyServiceDetails" },
];

for (const f of fixes) {
  const p = path.join("src/app/servizi", f.dir, "[slug]", "page.tsx");
  let s = fs.readFileSync(p, "utf8");
  if (!s.includes(`function ${f.bySlug}`)) {
    s = s.replace(
      `import { ${f.getter} } from "@/lib/cms/server";\nconst ${f.details} = ${f.getter}();`,
      `import { ${f.getter} } from "@/lib/cms/server";\n\nfunction ${f.bySlug}(slug: string) {\n  return ${f.getter}().find((item) => item.slug === slug) ?? null;\n}\n\nconst ${f.details} = ${f.getter}();`,
    );
    fs.writeFileSync(p, s);
    console.log("fixed slug helper", p);
  }
}

 // energia hub catalog helper
const hub = "src/app/servizi/energia/page.tsx";
let h = fs.readFileSync(hub, "utf8");
if (h.includes("getEnergyServiceSlugByCatalogTitle") && !h.includes("function getEnergyServiceSlugByCatalogTitle")) {
  h = h.replace(
    `import { getCmsEnergyServices } from "@/lib/cms/server";\nconst energyServiceDetails = getCmsEnergyServices();`,
    `import { getCmsEnergyServices } from "@/lib/cms/server";\n\nconst energyServiceDetails = getCmsEnergyServices();\nfunction getEnergyServiceSlugByCatalogTitle(title: string) {\n  return energyServiceDetails.find((s) => s.title === title)?.slug;\n}\n`,
  );
  fs.writeFileSync(hub, h);
  console.log("fixed energia hub");
}
