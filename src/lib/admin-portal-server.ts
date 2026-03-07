import crypto from "crypto";

const adminPortalUsername = String(process.env.STORE_ADMIN_USER || "").trim();
const adminPortalSessionSecret = String(
  process.env.ADMIN_PORTAL_SESSION_SECRET || "ag-admin-portal-dev-secret",
).trim();

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
