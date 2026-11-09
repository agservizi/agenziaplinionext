import fs from "node:fs";

// keystatic.config.ts storage typing
let ks = fs.readFileSync("keystatic.config.ts", "utf8");
ks = ks.replace(
  /storage: githubConfigured[\s\S]*?: \{ kind: "local" \},/,
  `storage: githubConfigured
    ? {
        kind: "github" as const,
        repo: {
          owner: githubRepo.split("/")[0] || "owner",
          name: githubRepo.split("/")[1] || "repo",
        },
      }
    : { kind: "local" as const },`,
);
fs.writeFileSync("keystatic.config.ts", ks);

// reader import path - keystatic.config is at root, from src/lib/cms need ../../../
let reader = fs.readFileSync("src/lib/cms/reader.ts", "utf8");
reader = reader.replace(
  'import keystaticConfig from "../../keystatic.config";',
  'import keystaticConfig from "../../../keystatic.config";',
);
reader = reader.replace(
  ".map((s) => ({",
  ".map((s: { label?: string; url?: string }) => ({",
);
fs.writeFileSync("src/lib/cms/reader.ts", reader);

// servizi page typing
let servizi = fs.readFileSync("src/app/area-admin/servizi/page.tsx", "utf8");
servizi = servizi.replace(
  "  const byCat = services.reduce((acc, svc) => {\n    (acc[svc.category] ||= []).push(svc);\n    return acc;\n  }, /** @type {Record<string, typeof services>} */ ({}));",
  "  const byCat: Record<string, typeof services> = {};\n  for (const svc of services) {\n    (byCat[svc.category] ||= []).push(svc);\n  }",
);
fs.writeFileSync("src/app/area-admin/servizi/page.tsx", servizi);

// page.tsx tuple casts
let page = fs.readFileSync("src/app/page.tsx", "utf8");
page = page.replace(
  "        headingWords={home.headingWords || FALLBACK.headingWords}\n        stats={stats}",
  "        headingWords={(home.headingWords || FALLBACK.headingWords).slice(0, 3) as [string, string, string]}\n        stats={stats.slice(0, 3) as [{ value: number; label: string }, { value: number; label: string }, { value: number; label: string }]}",
);
fs.writeFileSync("src/app/page.tsx", page);

console.log("tsc fixes applied");
