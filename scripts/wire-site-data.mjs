import fs from "node:fs";

for (const file of [
  "src/lib/energy-services.ts",
  "src/lib/digital-services.ts",
  "src/lib/payment-services.ts",
  "src/lib/logistics-services.ts",
  "src/lib/web-agency-services.ts",
]) {
  let s = fs.readFileSync(file, "utf8");
  const type = (s.match(/export type (\w+)/) || [])[1];
  if (type) {
    s = s.replace(/function loadCmsServices\(\): any\[\]/, `function loadCmsServices(): ${type}[]`);
    s = s.replace(new RegExp(`export const (\\w+): any\\[\\]`), `export const $1: ${type}[]`);
    fs.writeFileSync(file, s);
    console.log("typed", file, type);
  }
}

// site-data CMS overlay - rewrite company/nav/values/categories via proxy getters at bottom
let site = fs.readFileSync("src/lib/site-data.ts", "utf8");
if (!site.includes("readCmsJson")) {
  const overlay = `

import { readCmsJson } from "@/lib/cms/fs";

type SiteSettingsCms = {
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
  serviceCategories?: ServiceCategory[];
  marqueeItems?: string[];
  openingHours?: Array<{ day: string; hours: string }>;
};

const _cms = readCmsJson<SiteSettingsCms>("content/site-settings.json");

if (_cms) {
  if (_cms.companyName) (company as { name: string }).name = _cms.companyName;
  if (_cms.legalName) (company as { legalName: string }).legalName = _cms.legalName;
  if (_cms.address) (company as { address: string }).address = _cms.address;
  if (_cms.vat) (company as { vat: string }).vat = _cms.vat;
  if (_cms.sdi) (company as { sdi: string }).sdi = _cms.sdi;
  if (_cms.openedYear) (company as { openedYear: number }).openedYear = _cms.openedYear;
  if (_cms.openedMonth) (company as { openedMonth: number }).openedMonth = _cms.openedMonth;
  if (_cms.openedDay) (company as { openedDay: number }).openedDay = _cms.openedDay;
  if (_cms.phone) (company as { phone: string }).phone = _cms.phone;
  if (_cms.whatsapp) (company as { whatsapp: string }).whatsapp = _cms.whatsapp;
  if (_cms.googleBusinessUrl) (company as { googleBusinessUrl: string }).googleBusinessUrl = _cms.googleBusinessUrl;
  if (_cms.navigation?.length) {
    navigation.splice(0, navigation.length, ..._cms.navigation);
  }
  if (_cms.values?.length) {
    values.splice(0, values.length, ..._cms.values);
  }
  if (_cms.serviceCategories?.length) {
    serviceCategories.splice(0, serviceCategories.length, ..._cms.serviceCategories);
  }
}

export function getMarqueeItems(): string[] {
  return _cms?.marqueeItems?.length
    ? _cms.marqueeItems
    : [
        "Bollettini",
        "PagoPA",
        "SPID",
        "PEC",
        "Firma digitale",
        "BRT",
        "SEND",
        "Luce e gas",
        "Telefonia",
        "CAF",
        "Deposito bagagli",
        "Fermo deposito",
      ];
}

export function getOpeningHours() {
  return (
    _cms?.openingHours || [
      { day: "Lun – Ven", hours: "08:45–13:20 / 16:20–19:00" },
      { day: "Sabato", hours: "09:20–12:30" },
      { day: "Domenica", hours: "Chiuso" },
    ]
  );
}
`;
  fs.writeFileSync("src/lib/site-data.ts", site + overlay);
  console.log("site-data overlay added");
}

// MarqueeStrip
fs.writeFileSync(
  "src/components/ui/MarqueeStrip.tsx",
  `"use client";

import { getMarqueeItems } from "@/lib/site-data";

export default function MarqueeStrip() {
  const items = getMarqueeItems();
  const loop = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-[var(--ink)]/10 bg-[var(--ink)] py-4"
      data-gsap-marquee="26"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--ink)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--ink)] to-transparent" />
      <div className="flex w-max gap-10 whitespace-nowrap px-6" data-gsap-marquee-track>
        {loop.map((item, index) => (
          <span
            key={\`\${item}-\${index}\`}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--paper)]/85"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
`,
);
console.log("marquee updated");
