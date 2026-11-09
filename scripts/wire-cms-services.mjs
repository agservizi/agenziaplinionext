import fs from "node:fs";
import path from "path";

const categories = [
  { dir: "energia", getter: "getCmsEnergyServices", fallbackImport: "energyServiceDetails", fallbackFrom: "@/lib/energy-services", alias: "energyServiceDetails" },
  { dir: "digitali", getter: "getCmsDigitalServices", fallbackImport: "digitalServiceDetails", fallbackFrom: "@/lib/digital-services", alias: "digitalServiceDetails" },
  { dir: "pagamenti", getter: "getCmsPaymentServices", fallbackImport: "paymentServiceDetails", fallbackFrom: "@/lib/payment-services", alias: "paymentServiceDetails" },
  { dir: "logistica", getter: "getCmsLogisticsServices", fallbackImport: "logisticsServiceDetails", fallbackFrom: "@/lib/logistics-services", alias: "logisticsServiceDetails" },
  { dir: "web-agency", getter: "getCmsWebAgencyServices", fallbackImport: "webAgencyServiceDetails", fallbackFrom: "@/lib/web-agency-services", alias: "webAgencyServiceDetails" },
];

for (const cat of categories) {
  for (const file of ["page.tsx", path.join("[slug]", "page.tsx")]) {
    const p = path.join("src/app/servizi", cat.dir, file);
    if (!fs.existsSync(p)) continue;
    let s = fs.readFileSync(p, "utf8");
    if (s.includes(cat.getter)) {
      console.log("already", p);
      continue;
    }
    // replace catalog import with cms getter
    const importRe = new RegExp(
      `import \\{[^}]*${cat.fallbackImport}[^}]*\\} from "${cat.fallbackFrom.replace("/", "\\/")}";`,
    );
    if (importRe.test(s)) {
      s = s.replace(
        importRe,
        `import { ${cat.getter} } from "@/lib/cms/server";\nconst ${cat.alias} = ${cat.getter}();`,
      );
    } else if (s.includes(cat.fallbackFrom)) {
      s = s.replace(
        new RegExp(`from "${cat.fallbackFrom}";`),
        `from "${cat.fallbackFrom}";\nimport { ${cat.getter} } from "@/lib/cms/server";\nconst ${cat.alias} = ${cat.getter}();`,
      );
      // remove named import of details if duplicated awkwardly - skip complex
    } else {
      console.log("no import match", p);
      continue;
    }
    fs.writeFileSync(p, s);
    console.log("wired", p);
  }
}
