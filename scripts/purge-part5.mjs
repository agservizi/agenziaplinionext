import fs from "node:fs";

let s = fs.readFileSync("src/components/client-area/GestiioPracticeWorkspace.tsx", "utf8");
s = s.replace(/\n\s*brt_tracking\?: string \| null;/, "");
s = s.replace(/\n\s*const \[tracking, setTracking\][^\n]*;/, "");
s = s.replace(/\n\s*const \[trackResult, setTrackResult\][^\n]*;/, "");
s = s.replace(/\n\s*async function onTrack[\s\S]*?\n\s*\}\n/, "\n");
if (s.includes("Tracking BRT")) {
  s = s.replace(
    /\{readOnly \? \([\s\S]*?\) : \(/,
    `{readOnly ? (
            <p className="text-sm text-[var(--ink)]/55">
              Questa sezione e solo consultazione. Per nuove pratiche usa i moduli attivi dall&apos;area clienti.
            </p>
          ) : (`,
  );
}
fs.writeFileSync("src/components/client-area/GestiioPracticeWorkspace.tsx", s);
console.log("workspace ok");
