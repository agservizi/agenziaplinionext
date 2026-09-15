/** Client + server safe next-path helper (no node deps). */
export function safeNextPath(raw: string | null | undefined, fallback: string) {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("\\") || raw.includes("@")) return fallback;
  return raw;
}
