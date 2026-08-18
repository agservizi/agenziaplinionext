#!/usr/bin/env node
/**
 * Smoke test integrazioni Gestiio (locker + send).
 * Usage: node scripts/smoke-integrations.mjs [baseUrl]
 */
const base = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const checks = [
  { name: "locker health", path: "/api/locker-point/health" },
  { name: "locker pricing", path: "/api/locker-point/pricing", expectAuth: true },
  { name: "send pricing", path: "/api/client-area/send/pricing", expectAuth: true },
];

async function run() {
  let failed = 0;
  for (const check of checks) {
    const url = `${base}${check.path}`;
    try {
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));
      const ok =
        check.path.includes("health")
          ? res.ok && (body.status === "ok" || body.success === true)
          : res.status === 200 || res.status === 503 || (check.expectAuth && res.status === 401);
      console.log(`${ok ? "✓" : "✗"} ${check.name} → ${res.status}`);
      if (!ok) failed++;
    } catch (err) {
      console.log(`✗ ${check.name} → ${err instanceof Error ? err.message : "error"}`);
      failed++;
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}

run();
