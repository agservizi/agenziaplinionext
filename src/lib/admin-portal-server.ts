import crypto from "crypto";
import fs from "fs";
import path from "path";

type EnvMap = Record<string, string>;

function parseEnvFile(filePath: string): EnvMap {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result: EnvMap = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (!key) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

function loadDotEnvMap(): EnvMap {
  const rootDir = process.cwd();
  const env = parseEnvFile(path.join(rootDir, ".env"));
  const envLocal = parseEnvFile(path.join(rootDir, ".env.local"));
  return { ...env, ...envLocal };
}

const dotEnvMap = loadDotEnvMap();

function getServerEnv(key: string, fallback = "") {
  const runtimeValue = String(process.env[key] || "").trim();
  if (runtimeValue) return runtimeValue;
  const fileValue = String(dotEnvMap[key] || "").trim();
  if (fileValue) return fileValue;
  return fallback;
}

const adminPortalUsername = getServerEnv("STORE_ADMIN_USER", "");
const adminPortalSessionSecret = getServerEnv("ADMIN_PORTAL_SESSION_SECRET", "");
if (!adminPortalSessionSecret) {
  throw new Error("FATAL: ADMIN_PORTAL_SESSION_SECRET is not set");
}
const localPhpApiOrigin = String(process.env.LOCAL_PHP_API_ORIGIN || "http://localhost:8089").replace(
  /\/$/,
  "",
);

export function verifyAdminPortalToken(token: string) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", adminPortalSessionSecret)
    .update(payload)
    .digest("base64url");

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.exp || Number(parsed.exp) < Date.now()) return null;
    if (parsed?.username !== adminPortalUsername) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyAdminPortalSession(token: string) {
  const trimmedToken = String(token || "").trim();
  if (!trimmedToken) return false;

  try {
    const response = await fetch(`${localPhpApiOrigin}/api/admin-auth/session.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ token: trimmedToken }),
    });
    return response.ok;
  } catch {
    return Boolean(verifyAdminPortalToken(trimmedToken));
  }
}
