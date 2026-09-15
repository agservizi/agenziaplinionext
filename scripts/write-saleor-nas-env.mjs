import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const s = () => crypto.randomBytes(32).toString("hex");

const env = [
  "POSTGRES_USER=saleor",
  `POSTGRES_PASSWORD=${s()}`,
  "POSTGRES_DB=saleor",
  `SECRET_KEY=${s()}${s()}`,
  "ALLOWED_HOSTS=localhost,api,127.0.0.1,192.168.1.50,saleor.agenziaplinio.it",
  "ALLOWED_CLIENT_HOSTS=localhost,127.0.0.1,192.168.1.50,agenziaplinio.it,www.agenziaplinio.it",
  "CORS_ALLOW_ORIGINS=https://agenziaplinio.it,https://www.agenziaplinio.it,http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.50:8100,http://192.168.1.50:9100",
  "DEFAULT_CHANNEL_SLUG=default-channel",
  "PUBLIC_URL=http://192.168.1.50:8100/",
  "DASHBOARD_URL=http://192.168.1.50:9100/",
  "SALEOR_API_PORT=8100",
  "SALEOR_DASHBOARD_PORT=9100",
  "EMAIL_URL=consolemail://",
  "",
].join("\n");

const out = path.join(root, "docker", "saleor", ".env.nas");
fs.writeFileSync(out, env);
console.log("Wrote", out);
