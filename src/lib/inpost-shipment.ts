import { randomUUID } from "crypto";

export type InpostPoint = {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  city: string;
  province: string;
  country: string;
  type: string;
};

export type SearchInpostPointsInput = {
  zipCode: string;
  city: string;
  country: string;
};

export type CreateInpostShipmentInput = {
  customerName: string;
  email: string;
  phone: string;
  pickupAddress: string;
  pickupZIPCode: string;
  pickupCity: string;
  pickupProvince: string;
  destinationCompanyName: string;
  destinationAddress: string;
  destinationZIPCode: string;
  destinationCity: string;
  destinationProvince: string;
  destinationCountry: string;
  pudoId: string;
  parcelCount: number;
  parcelLengthCM: number;
  parcelHeightCM: number;
  parcelDepthCM: number;
  weightKG: number;
  notes: string;
  serviceCode: string;
};

export type CreateInpostShipmentResult = {
  provider: "inpost";
  shipmentId: string;
  trackingCode: string;
  parcelId: string;
  labelPdfBase64: string;
  pointId: string;
  response: unknown;
};

type InpostConfig = {
  apiBase: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  organizationId: string;
  scopes: string;
  pointSearchLimit: number;
  labelAccept: string;
  defaultCountry: string;
  italyPointsBaseUrl: string;
};

const INPOST_MAX_WIDTH_CM = 38;
const INPOST_MAX_LENGTH_CM = 64;
const INPOST_MAX_WEIGHT_KG = 25;

function resolveInpostParcelTemplate(dimensions: {
  lengthCM: number;
  heightCM: number;
  depthCM: number;
}) {
  const ordered = [dimensions.lengthCM, dimensions.heightCM, dimensions.depthCM]
    .map((value) => Number(value) || 0)
    .sort((left, right) => left - right);
  const [smallest, medium, largest] = ordered;

  if (medium > INPOST_MAX_WIDTH_CM || largest > INPOST_MAX_LENGTH_CM) {
    throw new Error(
      `InPost accetta colli con lato medio massimo ${INPOST_MAX_WIDTH_CM} cm e lato lungo massimo ${INPOST_MAX_LENGTH_CM} cm.`,
    );
  }
  if (smallest <= 8) return "small";
  if (smallest <= 19) return "medium";
  if (smallest <= 41) return "large";

  throw new Error(
    "InPost accetta al massimo il formato L: 41 x 38 x 64 cm.",
  );
}

function getInpostConfig(): InpostConfig {
  const env = String(process.env.INPOST_ENV || "").trim().toLowerCase();
  const apiBase =
    String(process.env.INPOST_API_BASE || "").trim().replace(/\/$/, "") ||
    (env === "stage" ? "https://stage-api.inpost-group.com" : "https://api.inpost-group.com");

  return {
    apiBase,
    tokenUrl: String(process.env.INPOST_TOKEN_URL || "").trim() || `${apiBase}/oauth2/token`,
    clientId: String(process.env.INPOST_CLIENT_ID || "").trim(),
    clientSecret: String(process.env.INPOST_CLIENT_SECRET || "").trim(),
    organizationId: String(process.env.INPOST_ORGANIZATION_ID || "").trim(),
    scopes: String(
      process.env.INPOST_SCOPES ||
        "openid api:points:read api:shipments:read api:shipments:write api:tracking:read api:labels:read",
    ).trim(),
    pointSearchLimit: Math.max(1, Number(process.env.INPOST_POINT_SEARCH_LIMIT || 20) || 20),
    labelAccept: String(process.env.INPOST_LABEL_ACCEPT || "application/pdf+json;format=A6").trim(),
    defaultCountry: String(process.env.INPOST_DEFAULT_COUNTRY || "IT").trim().toUpperCase(),
    italyPointsBaseUrl: String(
      process.env.INPOST_IT_POINTS_BASE_URL || "https://api-shipx-it.easypack24.net",
    )
      .trim()
      .replace(/\/$/, ""),
  };
}

export function getMissingInpostPointsConfig() {
  return [];
}

export function getMissingInpostConfig() {
  const config = getInpostConfig();
  const missing: string[] = [];

  if (!config.clientId) missing.push("INPOST_CLIENT_ID");
  if (!config.clientSecret) missing.push("INPOST_CLIENT_SECRET");
  if (!config.organizationId) missing.push("INPOST_ORGANIZATION_ID");

  return missing;
}

type InpostFetchOptions = {
  method?: string;
  body?: unknown;
  scopes?: string;
  headers?: Record<string, string>;
  accept?: string;
};

async function getInpostAccessToken(scopes?: string) {
  const config = getInpostConfig();
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("scope", scopes || config.scopes);
  body.set("client_id", config.clientId);
  body.set("client_secret", config.clientSecret);

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const payloadText = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = payloadText ? (JSON.parse(payloadText) as Record<string, unknown>) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(
      `InPost OAuth HTTP ${response.status} ${response.statusText}: ${String(payload.error_description || payload.error || payloadText || "token request failed")}`,
    );
  }

  const accessToken = String(payload.access_token || "");
  if (!accessToken) {
    throw new Error("InPost OAuth non ha restituito un access token valido.");
  }

  return accessToken;
}

async function inpostFetch<T = unknown>(path: string, options?: InpostFetchOptions) {
  const config = getInpostConfig();
  const accessToken = await getInpostAccessToken(options?.scopes);
  const url = path.startsWith("http") ? path : `${config.apiBase}${path}`;
  const response = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: options?.accept || "application/json",
      "Content-Type": options?.body ? "application/json" : "application/json",
      "X-Request-Id": randomUUID(),
      ...(options?.headers || {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const responseText = await response.text();
  let payload: unknown = null;
  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = responseText;
  }

  if (!response.ok) {
    const upstreamMessage =
      payload && typeof payload === "object"
        ? String(
            (payload as Record<string, unknown>).message ||
              (payload as Record<string, unknown>).error ||
              responseText ||
              "request failed",
          )
        : String(responseText || "request failed");
    throw new Error(`InPost HTTP ${response.status} ${response.statusText}: ${upstreamMessage}`);
  }

  return payload as T;
}

function parseItalyPointAddress(raw: Record<string, unknown>) {
  const address = raw.address && typeof raw.address === "object"
    ? (raw.address as Record<string, unknown>)
    : {};
  const addressDetails = raw.address_details && typeof raw.address_details === "object"
    ? (raw.address_details as Record<string, unknown>)
    : {};
  const fullAddress = [String(address.line1 || "").trim(), String(address.line2 || "").trim()]
    .filter(Boolean)
    .join(", ");

  return {
    address: fullAddress,
    zipCode: String(addressDetails.post_code || "").trim(),
    city: String(addressDetails.city || "").trim(),
    province: String(addressDetails.province || "").trim(),
    country: String(raw.country || "").trim().toUpperCase(),
  };
}

export async function searchInpostPoints(input: SearchInpostPointsInput) {
  const config = getInpostConfig();
  const country = String(input.country || config.defaultCountry).trim().toUpperCase();
  const normalizedZip = String(input.zipCode || "").trim().toUpperCase();
  const normalizedCity = String(input.city || "").trim().toUpperCase();
  const buildParams = (options?: { includeZip?: boolean; includeCity?: boolean }) => {
    const params = new URLSearchParams();
    params.set("per_page", String(config.pointSearchLimit));
    params.set("page", "1");
    params.set("functions", "parcel_send");
    params.set("type", "parcel_locker,pop");
    params.set("status", "Operating");
    if (options?.includeZip && normalizedZip) params.set("post_code", normalizedZip);
    if (options?.includeCity && normalizedCity) params.set("city", input.city.trim());
    return params;
  };

  const fetchPoints = async (options?: { includeZip?: boolean; includeCity?: boolean }) => {
    const response = await fetch(
      `${config.italyPointsBaseUrl}/v1/points?${buildParams(options).toString()}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );
    const payload = (await response.json()) as { items?: unknown[] };

    if (!response.ok) {
      throw new Error("InPost Italia points endpoint non disponibile.");
    }

    return Array.isArray(payload?.items) ? payload.items : [];
  };

  const normalizePoints = (items: unknown[], options?: { enforceZip?: boolean; enforceCity?: boolean }) =>
    items
    .map((item) => {
      const raw = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const normalizedAddress = parseItalyPointAddress(raw);
      const typeValue = Array.isArray(raw.type) ? raw.type.join(",") : String(raw.type || "").trim();

      return {
        id: String(raw.name || raw.id || "").trim(),
        name: String(raw.location_description || raw.name || raw.id || "").trim(),
        address: normalizedAddress.address,
        zipCode: normalizedAddress.zipCode,
        city: normalizedAddress.city,
        province: normalizedAddress.province,
        country: normalizedAddress.country || country,
        type: typeValue,
      };
    })
    .filter((point) => {
      if (!point.id) return false;
      if (country && point.country && point.country !== country) return false;
      if (
        options?.enforceZip &&
        normalizedZip &&
        point.zipCode &&
        point.zipCode.toUpperCase() !== normalizedZip
      ) {
        return false;
      }
      if (
        options?.enforceCity &&
        normalizedCity &&
        point.city &&
        !point.city.toUpperCase().includes(normalizedCity)
      ) {
        return false;
      }
      return true;
    });

  const strictItems = await fetchPoints({ includeZip: Boolean(normalizedZip), includeCity: Boolean(normalizedCity) });
  const strictPoints = normalizePoints(strictItems, {
    enforceZip: Boolean(normalizedZip),
    enforceCity: Boolean(normalizedCity),
  });
  if (strictPoints.length > 0) {
    return { points: strictPoints };
  }

  if (normalizedCity) {
    const cityItems = await fetchPoints({ includeCity: true });
    const cityPoints = normalizePoints(cityItems, { enforceCity: true });
    if (cityPoints.length > 0) {
      return { points: cityPoints };
    }
  }

  if (normalizedZip) {
    const zipItems = await fetchPoints({ includeZip: true });
    const zipPoints = normalizePoints(zipItems, { enforceZip: true });
    if (zipPoints.length > 0) {
      return { points: zipPoints };
    }
  }

  const fallbackItems = await fetchPoints({});
  const fallbackPoints = normalizePoints(fallbackItems);
  return { points: fallbackPoints };
}

function splitName(fullName: string) {
  const normalized = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "Cliente", lastName: "AG SERVIZI" };
  }

  const parts = normalized.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.slice(-1).join(" "),
  };
}

function buildInpostShipmentPayload(input: CreateInpostShipmentInput) {
  const senderName = splitName(input.customerName);
  const parcelWeight = Number((input.weightKG / Math.max(1, input.parcelCount)).toFixed(2));
  if (parcelWeight > INPOST_MAX_WEIGHT_KG) {
    throw new Error(`InPost accetta massimo ${INPOST_MAX_WEIGHT_KG} kg per collo.`);
  }
  const parcelTemplate = resolveInpostParcelTemplate({
    lengthCM: input.parcelLengthCM,
    heightCM: input.parcelHeightCM,
    depthCM: input.parcelDepthCM,
  });

  const receiverAddress = {
    line1: input.destinationAddress,
    postCode: input.destinationZIPCode,
    city: input.destinationCity,
    countryCode: input.destinationCountry,
  };

  const senderAddress = {
    line1: input.pickupAddress,
    postCode: input.pickupZIPCode,
    city: input.pickupCity,
    countryCode: "IT",
  };

  const basePayload: Record<string, unknown> = {
    service: input.pudoId ? "inpost_locker_standard" : "inpost_courier_standard",
    reference: `AG-${Date.now()}`,
    comments: input.notes || undefined,
    sender: {
      firstName: senderName.firstName,
      lastName: senderName.lastName,
      email: input.email,
      phone: input.phone,
      address: senderAddress,
    },
    receiver: {
      companyName: input.destinationCompanyName,
      firstName: input.destinationCompanyName || senderName.firstName,
      lastName: input.destinationCompanyName || senderName.lastName,
      email: input.email,
      phone: input.phone,
      address: receiverAddress,
    },
    parcels: Array.from({ length: Math.max(1, input.parcelCount) }).map(() => ({
      template: parcelTemplate,
      dimensions: {
        length: input.parcelLengthCM,
        width: input.parcelDepthCM,
        height: input.parcelHeightCM,
      },
      weight: parcelWeight,
    })),
  };

  if (input.pudoId) {
    basePayload.customAttributes = {
      targetPoint: input.pudoId,
      target_point: input.pudoId,
      dropoffPoint: input.pudoId,
    };
  }

  return basePayload;
}

function pickTrackingCode(payload: Record<string, unknown>) {
  return String(
    payload.trackingNumber ||
      payload.tracking_number ||
      payload.trackingCode ||
      payload.parcelCode ||
      payload.parcel_code ||
      "",
  ).trim();
}

function pickShipmentId(payload: Record<string, unknown>) {
  return String(payload.id || payload.uuid || payload.shipmentId || payload.shipment_id || "").trim();
}

async function fetchInpostLabel(shipmentId: string) {
  if (!shipmentId) return "";

  const config = getInpostConfig();
  const payload = await inpostFetch<Record<string, unknown> | string>(
    `/shipping/v2/organizations/${encodeURIComponent(config.organizationId)}/shipments/${encodeURIComponent(shipmentId)}/label`,
    {
      scopes: "openid api:shipments:read api:labels:read",
      accept: config.labelAccept,
    },
  );

  if (typeof payload === "string") {
    return "";
  }

  return String(payload.content || payload.base64 || payload.label || payload.data || "").trim();
}

export async function createInpostShipment(
  input: CreateInpostShipmentInput,
): Promise<CreateInpostShipmentResult> {
  const config = getInpostConfig();
  const payload = buildInpostShipmentPayload(input);
  const response = await inpostFetch<Record<string, unknown>>(
    `/shipping/v2/organizations/${encodeURIComponent(config.organizationId)}/shipments`,
    {
      method: "POST",
      body: payload,
      scopes: "openid api:shipments:read api:shipments:write",
    },
  );

  const shipmentId = pickShipmentId(response);
  const trackingCode = pickTrackingCode(response);
  const labelPdfBase64 = shipmentId ? await fetchInpostLabel(shipmentId) : "";

  return {
    provider: "inpost",
    shipmentId,
    trackingCode,
    parcelId: input.pudoId || shipmentId || trackingCode,
    labelPdfBase64,
    pointId: input.pudoId,
    response,
  };
}
