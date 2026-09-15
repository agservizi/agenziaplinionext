/**
 * Smoke checks for authz helpers.
 * Run: node scripts/smoke-authz.mjs
 */
import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function sign(payload, secret) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${body}.${b64url(sig)}`;
}

function verify(token, secret) {
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = fromB64url(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return JSON.parse(fromB64url(body).toString("utf8"));
}

function safeNextPath(raw, fallback) {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("\\") || raw.includes("@")) return fallback;
  return raw;
}

function canAccessAdminModule(role, module) {
  if (role === "SUPERADMIN") return true;
  if (role === "ADMIN") return module !== "staff" && module !== "settings";
  if (role === "OPERATOR") return module === "ops" || module === "shop_read";
  return false;
}

const secret = "test-secret";
const token = sign(
  {
    sub: "customer:1",
    role: "CUSTOMER",
    username: "demo",
    userId: 1,
    exp: Date.now() + 60_000,
    v: 1,
  },
  secret,
);
const payload = verify(token, secret);
assert.equal(payload.username, "demo");
assert.equal(verify(token + "x", secret), null);
assert.equal(safeNextPath("//evil.com", "/area-clienti"), "/area-clienti");
assert.equal(safeNextPath("/area-clienti/ordini", "/x"), "/area-clienti/ordini");
assert.equal(canAccessAdminModule("OPERATOR", "refund"), false);
assert.equal(canAccessAdminModule("ADMIN", "shop_write"), true);
assert.equal(canAccessAdminModule("CUSTOMER", "ops"), false);

console.log("smoke-authz: ok");
