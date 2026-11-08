const DEFAULT_BASE_URL = "https://gestiio.agenziaplinio.it/api/public/client-portal";

export type GestiioClientPortalService = {
  slug: string;
  name: string;
  description: string;
  category: string;
  payment_required?: boolean;
  status?: string;
  read_only?: boolean;
};

export type GestiioClientPortalPractice = {
  uuid: string;
  service_slug: string;
  external_customer_id?: string | null;
  customer_email?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  status: string;
  payment_status: string;
  stripe_session_id?: string | null;
  amount?: number | null;
  currency?: string;
  payload?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};


function clientPortalBaseUrl() {
  return (process.env.GESTIIO_CLIENT_PORTAL_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function clientPortalApiKey() {
  const key =
    process.env.GESTIIO_CLIENT_PORTAL_API_KEY?.trim() ||
    process.env.GESTIIO_SEND_API_KEY?.trim();
  if (!key) {
    throw new Error("GESTIIO_CLIENT_PORTAL_API_KEY non configurata");
  }
  return key;
}

type GestiioEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};

async function gestiioFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${clientPortalBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  headers.set("x-api-key", clientPortalApiKey());
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const rawText = await response.text();
  let json: (GestiioEnvelope<T> & Record<string, unknown>) | null = null;
  try {
    json = rawText ? (JSON.parse(rawText) as GestiioEnvelope<T> & Record<string, unknown>) : null;
  } catch {
    json = null;
  }

  const messageFromBody =
    (typeof json?.error === "object" && json.error && "message" in json.error
      ? String((json.error as { message?: string }).message || "")
      : "") ||
    (typeof json?.message === "string" ? json.message : "") ||
    rawText.slice(0, 200) ||
    `Gestiio client-portal error (${response.status})`;

  if (!response.ok || json?.success === false) {
    const error = new Error(messageFromBody) as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code =
      typeof json?.error === "object" && json.error && "code" in json.error
        ? String((json.error as { code?: string }).code || "")
        : undefined;
    throw error;
  }

  if (!json) {
    throw new Error(messageFromBody);
  }

  // Standard envelope: { success, data }
  if ("data" in json && json.data !== undefined) {
    return json.data as T;
  }

  // Unwrapped success payloads (es. simula-bolletta: { success, profile, ranking })
  if (json.success === true) {
    const { success: _success, error: _error, ...rest } = json;
    return rest as T;
  }

  throw new Error(messageFromBody);
}

export async function gestiioClientPortalHealth() {
  const base = clientPortalBaseUrl();
  const response = await fetch(`${base}/health`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Client portal health failed (${response.status})`);
  }
  return response.json();
}

export async function gestiioListServices() {
  const data = await gestiioFetch<{ services: GestiioClientPortalService[] }>("/services");
  return data.services || [];
}

export async function gestiioListPractices(params: {
  customerEmail?: string;
  externalCustomerId?: string;
  serviceSlug?: string;
  status?: string;
  limit?: number;
} = {}) {
  const search = new URLSearchParams();
  if (params.customerEmail) search.set("customer_email", params.customerEmail);
  if (params.externalCustomerId) search.set("external_customer_id", params.externalCustomerId);
  if (params.serviceSlug) search.set("service_slug", params.serviceSlug);
  if (params.status) search.set("status", params.status);
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const data = await gestiioFetch<{ practices: GestiioClientPortalPractice[] }>(
    `/practices${qs ? `?${qs}` : ""}`,
  );
  return data.practices || [];
}

export async function gestiioGetPractice(uuid: string) {
  return gestiioFetch<GestiioClientPortalPractice>(`/practices/${uuid}`);
}

export async function gestiioCreatePractice(body: {
  service_slug: string;
  external_customer_id?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  status?: string;
  payment_status?: string;
  stripe_session_id?: string;
  amount?: number;
  currency?: string;
  payload?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}) {
  return gestiioFetch<GestiioClientPortalPractice>("/practices", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function gestiioUpdatePractice(
  uuid: string,
  body: Partial<{
    status: string;
    payment_status: string;
    stripe_session_id: string;
    amount: number;
    currency: string;
    payload: Record<string, unknown>;
    meta: Record<string, unknown>;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
  }>,
) {
  return gestiioFetch<GestiioClientPortalPractice>(`/practices/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function gestiioSimulaBolletta(body: {
  kwh_anno?: number;
  smc_anno?: number;
  potenza_kw?: number;
  spesa_annua_attuale?: number;
  commodity?: "luce" | "gas" | "dual";
  include_canone_rai?: boolean;
}) {
  return gestiioFetch<{
    success?: boolean;
    profile?: Record<string, unknown>;
    ranking?: Array<Record<string, unknown>>;
    message?: string;
  }>("/simula-bolletta/calcola", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Catalog for segnalazione forms (AG00062 workflow). */
export async function gestiioCatalogEnergiaGestori() {
  const data = await gestiioFetch<{ gestori: Array<{ id: number; nome: string }> }>(
    "/catalog/energia/gestori",
  );
  return data.gestori || [];
}

export async function gestiioCatalogTelefoniaTipi() {
  const data = await gestiioFetch<{
    tipi_contratto: Array<{
      id: number;
      nome: string;
      gestore_id?: number | null;
      gestore_nome?: string | null;
      label: string;
    }>;
  }>("/catalog/telefonia/tipi-contratto");
  return data.tipi_contratto || [];
}





/**
 * Callers: gestiio webhook route. Fail closed without secret.
 * User: procedi con tutto al 100% (security-audit gestiio-webhook).
 */
export async function verifyGestiioClientPortalWebhookSignature(
  rawBody: string,
  signature: string | null,
) {
  const secret = process.env.GESTIIO_CLIENT_PORTAL_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  if (!signature) return false;
  const crypto = await import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
