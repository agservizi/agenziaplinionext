import fs from "node:fs";
import path from "node:path";

function patch(file, fn) {
  const p = path.resolve(file);
  if (!fs.existsSync(p)) {
    console.log("skip missing", file);
    return;
  }
  const s = fs.readFileSync(p, "utf8");
  const n = fn(s);
  if (n !== s) {
    fs.writeFileSync(p, n);
    console.log("patched", file);
  } else {
    console.log("unchanged", file);
  }
}

patch("src/components/client-area/ClientAreaShell.tsx", (s) => {
  s = s.replace(/\n\s*\{ href: "\/area-clienti\/brt"[^\n]*\},?\n/, "\n");
  s = s.replace(/\n\s*\{ href: "\/area-clienti\/ordini"[^\n]*\},?\n/, "\n");
  s = s.replace(
    /const MOBILE_PRIMARY: NavItem\[\] = \[[\s\S]*?\];/,
    `const MOBILE_PRIMARY: NavItem[] = [
  SERVICE_NAV[0],
  SERVICE_NAV.find((i) => i.href.includes("/send"))!,
  SERVICE_NAV.find((i) => i.href.includes("/visure"))!,
  SERVICE_NAV.find((i) => i.href.includes("/caf-patronato"))!,
  SERVICE_NAV.find((i) => i.href.includes("/acquisti"))!,
];`,
  );
  return s;
});

patch("src/lib/client-area.ts", (s) => {
  s = s.replace(/\n\s*\|\s*"brt"/, "");
  s = s.replace(/\n\s*\{\n\s*key: "brt",[\s\S]*?\n\s*\},\n/, "\n");
  return s;
});

patch("src/app/admin-login/AdminLoginHeroPanel.tsx", (s) =>
  s.replace(
    "Le pratiche clienti restano su Gestiio; lo shop su Saleor.",
    "Le pratiche clienti e i listini pubblici restano su Gestiio.",
  ),
);

patch("src/components/client-area/ClientAreaDashboard.tsx", (s) =>
  s.replace(
    /Le spedizioni BRT[\s\S]*?\./g,
    "Gestisci pratiche, documenti e pagamenti da qui.",
  ),
);

patch("src/components/ClientAreaInteractiveHero.tsx", (s) =>
  s.replace(/Le BRT le impostiamo in agenzia[^.]*\./g, ""),
);

patch("src/app/area-clienti/page.tsx", (s) => s.replace(" e tracking BRT", ""));

patch(".env.example", (s) => {
  s = s.replace(/\n# Saleor[\s\S]*?(?=\n# |\n[A-Z]|$)/, "\n");
  s = s.replace(/\nNEXT_PUBLIC_SALEOR_[^\n]*/g, "");
  s = s.replace(/\nSALEOR_[^\n]*/g, "");
  s = s.replace(/\nNEXT_PUBLIC_SHOP_HOME_WIDGET[^\n]*/g, "");
  if (!s.includes("GESTIIO_LUGGAGE_API_KEY")) {
    s = s.replace(
      "GESTIIO_DEPOSITO_API_KEY=\n",
      "GESTIIO_DEPOSITO_API_KEY=\n# Aliases: GESTIIO_LUGGAGE_API_KEY, LUGGAGE_API_KEY\n",
    );
  }
  if (!s.includes("OPENAPI_BEARER_VISURE")) {
    s += `
# OpenAPI Visure
OPENAPI_SANDBOX=false
OPENAPI_BEARER_VISURE_CAMERALI=
OPENAPI_VISURE_CAMERALI_BASE_URL_PRODUCTION=
OPENAPI_VISURE_CAMERALI_BASE_URL_SANDBOX=
OPENAPI_BEARER_VISURE=
OPENAPI_VISURE_BASE_URL_PRODUCTION=
OPENAPI_VISURE_BASE_URL_SANDBOX=
OPENAPI_BEARER_CATASTO=
OPENAPI_CATASTO_BASE_URL_PRODUCTION=
OPENAPI_CATASTO_BASE_URL_SANDBOX=

# CAF / Visure magic links
CAF_PATRONATO_MAGIC_LINK_SECRET=
CAF_PATRONATO_FILE_LINK_SECRET=
VISURE_MAGIC_LINK_SECRET=

# CMS GitHub write from Brutal /api/cms/save
CMS_GITHUB_TOKEN=
`;
  }
  return s;
});

patch("docs/CMS-KEYSTATIC.md", (s) =>
  s.replace(/- Shop Saleor[^\n]*\n?/, "- Shop Saleor (rimosso dal monorepo)\n"),
);

patch("package.json", (s) => {
  const j = JSON.parse(s);
  for (const k of ["saleor:bootstrap", "test:smoke-saleor", "storefront:install", "storefront:dev"]) {
    delete j.scripts[k];
  }
  return JSON.stringify(j, null, 2) + "\n";
});

console.log("batch patch done");
