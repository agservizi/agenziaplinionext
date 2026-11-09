import fs from "node:fs";
let s = fs.readFileSync("src/lib/gestiio-listini.ts", "utf8");
s = s.replace(
  `.filter((x): x is GestiioListinoRule => Boolean(x));`,
  `.filter((x): x is GestiioListinoRule => x != null);`,
);
s = s.replace(
  `scope: r.scope ? String(r.scope) : undefined,
      } satisfies GestiioListinoRule;`,
  `...(r.scope ? { scope: String(r.scope) } : {}),
      } as GestiioListinoRule;`,
);
fs.writeFileSync("src/lib/gestiio-listini.ts", s);
console.log("fixed listini types");
