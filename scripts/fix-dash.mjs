import fs from "node:fs";
let p = fs.readFileSync("src/app/area-admin/page.tsx", "utf8");
p = p.replace(
  'home?.headingWords?.join(" · ") || "—"',
  'Array.isArray(home?.headingWords) ? (home.headingWords as string[]).join(" · ") : "—"',
);
p = p.replace(
  'settings?.companyName || "—"',
  'typeof settings?.companyName === "string" ? settings.companyName : "—"',
);
fs.writeFileSync("src/app/area-admin/page.tsx", p);
console.log("dashboard fixed");
