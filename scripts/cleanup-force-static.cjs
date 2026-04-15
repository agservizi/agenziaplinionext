// Temporary cleanup script - remove force-static from API routes where it was incorrectly added
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

const files = [
  "src/app/api/client-area/spedizioni/brt/pudo/route.ts",
  "src/app/api/client-area/spedizioni/brt/delete/route.ts",
  "src/app/api/client-area/spedizioni/brt/manifest/route.ts",
  "src/app/api/client-area/spedizioni/brt/confirm/route.ts",
  "src/app/api/client-area/spedizioni/brt/route.ts",
  "src/app/api/client-area/spedizioni/brt/tracking/route.ts",
  "src/app/api/client-area/spedizioni/brt/routing/route.ts",
  "src/app/api/client-area/spedizioni/inpost/route.ts",
  "src/app/api/client-area/spedizioni/inpost/points/route.ts",
  "src/app/api/client-area/spedizioni/checkout/verify/route.ts",
  "src/app/api/client-area/spedizioni/checkout/route.ts",
  "src/app/api/client-area/spedizioni/history/route.ts",
  "src/app/api/client-area/visure/magic-link/route.ts",
  "src/app/api/client-area/visure/openapi/route.ts",
  "src/app/api/client-area/visure/checkout/route.ts",
  "src/app/api/client-area/visure/history/route.ts",
  "src/app/api/client-area/visure/pricing/route.ts",
  "src/app/api/client-area/requests/route.ts",
  "src/app/api/client-area/ticket/route.ts",
  "src/app/api/admin/client-area/ticket/route.ts",
  "src/app/api/public/shipping-pricing/route.ts",
  "src/app/api/public/interactive-consulting/route.ts",
  "src/app/api/consent/route.ts",
  "src/app/api/contatti/route.ts",
];

let count = 0;
for (const f of files) {
  const fp = path.join(root, f);
  const content = fs.readFileSync(fp, "utf8");
  const cleaned = content.replace(/^export const dynamic = "force-static";\n/gm, "");
  if (cleaned !== content) {
    fs.writeFileSync(fp, cleaned);
    count++;
    console.log("Cleaned:", f);
  }
}
console.log(`\nDone: ${count} files cleaned`);
