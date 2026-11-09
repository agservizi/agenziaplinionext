/**
 * Importers/callers: `node scripts/check-prod-env.mjs` (smoke / CI). No HTTP API.
 * Schema: env key checklist. User: "Implement the plan as specified" (prod_ready_full F/A).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());

function loadEnvFile(name) {
  const path = resolve(ROOT, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileEnv = {
  ...loadEnvFile(".env"),
  ...loadEnvFile(".env.local"),
};
const env = { ...fileEnv, ...process.env };

const required = [
  "MYSQL_HOST",
  "MYSQL_USER",
  "MYSQL_DATABASE",
  "MYSQL_PASSWORD",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "GESTIIO_CLIENT_PORTAL_API_KEY",
  "GESTIIO_SEND_API_KEY",
  "GESTIIO_DEPOSITO_API_KEY",
  "CLIENT_PORTAL_SESSION_SECRET",
  "ADMIN_PORTAL_SESSION_SECRET",
];

const recommended = [
  "OPENAPI_BEARER_VISURE",
  "OPENAPI_BEARER_CATASTO",
  "CAF_PATRONATO_MAGIC_LINK_SECRET",
  "VISURE_MAGIC_LINK_SECRET",
  "CMS_GITHUB_TOKEN",
  "KEYSTATIC_GITHUB_CLIENT_ID",
  "KEYSTATIC_GITHUB_CLIENT_SECRET",
  "KEYSTATIC_SECRET",
  "NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG",
  "GESTIIO_CLIENT_PORTAL_WEBHOOK_SECRET",
  "NEXT_PUBLIC_NUVERA_DEMO_URL",
];

const forbidden = ["SALEOR_API_URL", "SALEOR_APP_TOKEN", "NEXT_PUBLIC_SHOP_HOME_WIDGET"];

function present(key) {
  const v = env[key];
  return typeof v === "string" && v.trim().length > 0;
}

let failed = false;
console.log("=== check-prod-env ===\n");

console.log("Required:");
for (const key of required) {
  const ok = present(key);
  console.log(`  ${ok ? "OK  " : "MISS"} ${key}`);
  if (!ok) failed = true;
}

console.log("\nRecommended:");
for (const key of recommended) {
  console.log(`  ${present(key) ? "OK  " : "----"} ${key}`);
}

console.log("\nForbidden env (Saleor leftovers — warn if still in local .env; must be absent on Vercel):");
for (const key of forbidden) {
  const bad = present(key);
  console.log(`  ${bad ? "WARN" : "OK  "} ${key}`);
}

const saleorDirs = ["storefront", "docker/saleor", "src/lib/saleor", "src/app/shop"];
console.log("\nRepo paths:");
for (const rel of saleorDirs) {
  const exists = existsSync(resolve(ROOT, rel));
  console.log(`  ${exists ? "BAD " : "OK  "} absent ${rel}`);
  if (exists) failed = true;
}
const brt = existsSync(resolve(ROOT, "src/app/area-clienti/brt"));
console.log(`  ${brt ? "BAD " : "OK  "} absent src/app/area-clienti/brt`);
if (brt) failed = true;

console.log(failed ? "\nRESULT: FAIL" : "\nRESULT: PASS");
process.exit(failed ? 1 : 0);
