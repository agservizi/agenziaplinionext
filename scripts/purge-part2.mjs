import fs from "node:fs";

// package.json
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const k of ["saleor:bootstrap", "test:smoke-saleor", "storefront:install", "storefront:dev"]) {
  delete pkg.scripts[k];
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("package.json");

// CMS docs
if (fs.existsSync("docs/CMS-KEYSTATIC.md")) {
  let d = fs.readFileSync("docs/CMS-KEYSTATIC.md", "utf8");
  d = d.replace(/- Shop Saleor[^\n]*\n?/, "- Shop Saleor (rimosso dal monorepo)\n");
  fs.writeFileSync("docs/CMS-KEYSTATIC.md", d);
  console.log("CMS docs");
}

// next.config - remove spedizioni rewrites
let nc = fs.readFileSync("next.config.ts", "utf8");
nc = nc.replace(/\n\s*\{\s*\n\s*source: "\/api\/client-area\/spedizioni[^"]*",\n\s*destination: `[^\`]*`,\n\s*\},?/g, "");
fs.writeFileSync("next.config.ts", nc);
console.log("next.config");

// gestiio-client-portal BRT strip
let g = fs.readFileSync("src/lib/gestiio-client-portal.ts", "utf8");
g = g.replace(/\n\s*brt_shipment_id\?: string \| null;/g, "");
g = g.replace(/\n\s*brt_tracking\?: string \| null;/g, "");
g = g.replace(/\n\s*brt_shipment_id: string;/g, "");
g = g.replace(/\n\s*brt_tracking: string;/g, "");
g = g.replace(/\nexport type GestiioBrtShipment = \{[\s\S]*?\};\n/, "\n");
g = g.replace(/\nexport async function gestiioTrackBrt[\s\S]*?\n\}\n/, "\n");
g = g.replace(/\nexport async function gestiioGetBrtShipment[\s\S]*?\n\}\n/, "\n");
g = g.replace(/\nexport function gestiioBrtLabelUrl[\s\S]*?\n\}\n/, "\n");
g = g.replace(/\nexport async function gestiioFetchBrtLabel[\s\S]*?\n\}\n/, "\n");
fs.writeFileSync("src/lib/gestiio-client-portal.ts", g);
console.log("gestiio-client-portal");
