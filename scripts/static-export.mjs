#!/usr/bin/env node
/**
 * Static Export Script
 * 
 * Temporarily hides server-only API routes (using Next.js _ prefix convention)
 * during the static export build, then restores them.
 * Output is copied to deploy-out/.
 */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const apiDir = resolve(root, "src/app/api");
const apiHidden = resolve(root, "src/app/_api");
const outDir = resolve(root, "out");
const deployDir = resolve(root, "deploy-out");

function restore() {
  if (existsSync(apiHidden) && !existsSync(apiDir)) {
    renameSync(apiHidden, apiDir);
    console.log("✓ API routes restored");
  }
}

// Safety: always restore on exit
process.on("exit", restore);
process.on("SIGINT", () => { restore(); process.exit(1); });
process.on("SIGTERM", () => { restore(); process.exit(1); });
process.on("uncaughtException", (err) => { restore(); console.error(err); process.exit(1); });

try {
  // 1. Hide API routes
  if (existsSync(apiDir)) {
    renameSync(apiDir, apiHidden);
    console.log("→ API routes hidden (_api)");
  }

  // 2. Run static export build
  console.log("→ Building static export...\n");
  execSync("NEXT_STATIC_EXPORT=true npx next build --webpack", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_STATIC_EXPORT: "true" },
  });

  // 3. Restore API routes
  restore();

  // 4. Copy output to deploy-out
  if (existsSync(outDir)) {
    if (existsSync(deployDir)) {
      rmSync(deployDir, { recursive: true });
    }
    cpSync(outDir, deployDir, { recursive: true });
    console.log(`\n✓ Static export copied to deploy-out/`);
  } else {
    console.error("✗ out/ directory not found after build");
    process.exit(1);
  }

  console.log("✓ Export complete!");
} catch (error) {
  restore();
  console.error("\n✗ Build failed:", error.message);
  process.exit(1);
}
