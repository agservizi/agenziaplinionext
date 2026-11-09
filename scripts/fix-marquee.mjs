import fs from "node:fs";

fs.writeFileSync(
  "src/components/ui/MarqueeStrip.tsx",
  `"use client";

const FALLBACK_ITEMS = [
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

type Props = { items?: string[] };

export default function MarqueeStrip({ items }: Props) {
  const source = items?.length ? items : FALLBACK_ITEMS;
  const loop = [...source, ...source];

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
            key={item + "-" + index}
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

let page = fs.readFileSync("src/app/page.tsx", "utf8");
if (!page.includes("getMarqueeItems")) {
  page = page.replace(
    'import { getYearsActive } from "@/lib/site-data";',
    'import { getYearsActive, getMarqueeItems } from "@/lib/site-data";',
  );
  page = page.replace("<MarqueeStrip />", "<MarqueeStrip items={getMarqueeItems()} />");
  fs.writeFileSync("src/app/page.tsx", page);
  console.log("page marquee props");
}
console.log("fixed client fs leak");
