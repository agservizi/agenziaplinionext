export const CLIENT_PORTAL_TOKEN_KEY = "ag:client-portal-token";

const clientPortalApiBase = (
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_API_BASE ||
  process.env.NEXT_PUBLIC_BOOKING_API_BASE ||
  ""
).replace(/\/$/, "");

function resolveClientPortalApiBase() {
  if (typeof window === "undefined") {
    return clientPortalApiBase;
  }

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const pointsToProduction =
    clientPortalApiBase === "https://agenziaplinio.it" ||
    clientPortalApiBase === "https://www.agenziaplinio.it";

  if (isLocalhost && (!clientPortalApiBase || pointsToProduction)) {
    return "http://localhost:3001";
  }

  return clientPortalApiBase;
}

function buildApiUrl(path: string) {
  const apiBase = resolveClientPortalApiBase();
  return apiBase ? `${apiBase}${path}` : path;
}

export function getClientPortalToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CLIENT_PORTAL_TOKEN_KEY) || "";
}

export function setClientPortalToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLIENT_PORTAL_TOKEN_KEY, token);
}

export function clearClientPortalToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLIENT_PORTAL_TOKEN_KEY);
}

export function readClientPortalTokenPayload() {
  const token = getClientPortalToken();
  const [payload] = String(token || "").split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const raw =
      typeof window !== "undefined" && typeof window.atob === "function"
        ? window.atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(raw) as {
      username?: string;
      userId?: number | null;
      source?: string;
      exp?: number;
    };

    if (!parsed?.username) return null;

    return {
      username: String(parsed.username),
      userId: typeof parsed.userId === "number" ? parsed.userId : null,
      source: parsed.source || "unknown",
    };
  } catch {
    return null;
  }
}

export async function loginClientPortal(username: string, password: string) {
  const response = await fetch(buildApiUrl("/api/client-auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const payload = (await response.json()) as { token?: string; message?: string };
  if (!response.ok || !payload.token) {
    throw new Error(payload.message || "Login non riuscito");
  }

  setClientPortalToken(payload.token);
  return payload.token;
}

export async function validateClientPortalSession(token: string) {
  try {
    const response = await fetch(buildApiUrl("/api/client-auth/session"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      clearClientPortalToken();
      return false;
    }

    return true;
  } catch {
    clearClientPortalToken();
    return false;
  }
}

export type ClientPortalProfile = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  companyName: string;
  source: string;
};

export async function fetchClientPortalProfile(token: string) {
  const response = await fetch(buildApiUrl("/api/client-auth/profile"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const payload = (await response.json()) as {
    message?: string;
    editable?: boolean;
    profile?: ClientPortalProfile;
  };

  if (!response.ok || !payload.profile) {
    throw new Error(payload.message || "Profilo non disponibile");
  }

  return {
    editable: Boolean(payload.editable),
    profile: payload.profile,
  };
}

export async function updateClientPortalProfile(input: {
  token: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const response = await fetch(buildApiUrl("/api/client-auth/profile-update"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as {
    message?: string;
    token?: string;
    profile?: ClientPortalProfile;
  };

  if (!response.ok || !payload.profile) {
    throw new Error(payload.message || "Aggiornamento profilo non riuscito");
  }

  if (payload.token) {
    setClientPortalToken(payload.token);
  }

  return {
    message: payload.message || "Profilo aggiornato",
    profile: payload.profile,
    token: payload.token || "",
  };
}

export async function submitClientPortalRegistrationRequest(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const response = await fetch(buildApiUrl("/api/client-auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      phone: "",
      companyName: "",
    }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Richiesta registrazione non riuscita");
  }

  return payload.message || "Richiesta inviata";
}
