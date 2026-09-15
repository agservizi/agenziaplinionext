#!/usr/bin/env node
/**
 * Bootstrap local/NAS Saleor + portal session env secrets.
 * Does not overwrite existing non-empty values.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const secret = () => crypto.randomBytes(32).toString("hex");

function upsertEnvFile(filePath, entries) {
  let text = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (text && !text.endsWith("\n")) text += "\n";

  for (const [key, value] of Object.entries(entries)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(text)) {
      const current = text.match(re)?.[0]?.slice(key.length + 1) ?? "";
      if (current.trim()) continue;
      text = text.replace(re, `${key}=${value}`);
    } else {
      text += `${key}=${value}\n`;
    }
  }
  fs.writeFileSync(filePath, text);
}

upsertEnvFile(path.join(root, ".env.local"), {
  NEXT_PUBLIC_SALEOR_API_URL: "http://localhost:8000/graphql/",
  SALEOR_API_URL: "http://localhost:8000/graphql/",
  NEXT_PUBLIC_SALEOR_CHANNEL: "default-channel",
  SALEOR_APP_TOKEN: "",
  SALEOR_WEBHOOK_SECRET: secret(),
  NEXT_PUBLIC_SHOP_HOME_WIDGET: "1",
  CLIENT_PORTAL_SESSION_SECRET: secret(),
  ADMIN_PORTAL_SESSION_SECRET: secret(),
  SESSION_SECRET: secret(),
});

const saleorEnvPath = path.join(root, "docker", "saleor", ".env");
if (!fs.existsSync(saleorEnvPath)) {
  fs.writeFileSync(
    saleorEnvPath,
    [
      `POSTGRES_USER=saleor`,
      `POSTGRES_PASSWORD=${secret()}`,
      `POSTGRES_DB=saleor`,
      `SECRET_KEY=${secret()}${secret()}`,
      `ALLOWED_HOSTS=localhost,api,127.0.0.1,saleor.agenziaplinio.it`,
      `ALLOWED_CLIENT_HOSTS=localhost,127.0.0.1,agenziaplinio.it,www.agenziaplinio.it`,
      `CORS_ALLOW_ORIGINS=https://agenziaplinio.it,https://www.agenziaplinio.it,http://localhost:3000,http://127.0.0.1:3000`,
      `DEFAULT_CHANNEL_SLUG=default-channel`,
      `PUBLIC_URL=http://localhost:8000/`,
      `DASHBOARD_URL=http://localhost:9000/`,
      `SALEOR_API_PORT=8000`,
      `SALEOR_DASHBOARD_PORT=9000`,
      `EMAIL_URL=consolemail://`,
      "",
    ].join("\n"),
  );
  console.log("Wrote docker/saleor/.env");
} else {
  console.log("docker/saleor/.env already exists — left unchanged");
}

const gitignore = path.join(root, "docker", "saleor", ".gitignore");
if (!fs.existsSync(gitignore)) {
  fs.writeFileSync(gitignore, ".env\n*.pem\n");
}

upsertEnvFile(path.join(root, "storefront", ".env.local"), {
  NEXT_PUBLIC_SALEOR_API_URL: "http://localhost:8000/graphql/",
  NEXT_PUBLIC_DEFAULT_CHANNEL: "default-channel",
  NEXT_PUBLIC_SALEOR_CHANNEL: "default-channel",
  NEXT_PUBLIC_BASE_PATH: "/shop",
});

console.log("OK: .env.local + storefront/.env.local upserted");
console.log("Next: install Docker Desktop (or run compose on NAS), then:");
console.log("  cd docker/saleor && docker compose up -d");
console.log("  npm run test:smoke-saleor");
