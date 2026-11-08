import fs from "node:fs";
import path from "node:path";

/** Sync FS reader for Keystatic JSON content. Callers: site-data, faq, reviews, *-services. User: wire public P0-P2. */
export function readCmsJson<T>(relPath: string): T | null {
  try {
    const full = path.join(process.cwd(), relPath);
    if (!fs.existsSync(full)) return null;
    return JSON.parse(fs.readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function listCmsJsonDir(relDir: string): Array<{ slug: string; data: Record<string, unknown> }> {
  try {
    const full = path.join(process.cwd(), relDir);
    if (!fs.existsSync(full)) return [];
    return fs
      .readdirSync(full)
      .filter((f) => f.endsWith(".json"))
      .map((file) => {
        const slug = file.replace(/\.json$/, "");
        const data = JSON.parse(fs.readFileSync(path.join(full, file), "utf8")) as Record<string, unknown>;
        return { slug, data };
      });
  } catch {
    return [];
  }
}
