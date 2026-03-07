export type SupportedVisuraService =
  | "visura-camerale"
  | "visura-catastale"
  | "visura-pra"
  | "visura-crif"
  | "visura-cr";

export const supportedVisuraServices: SupportedVisuraService[] = [
  "visura-camerale",
  "visura-catastale",
  "visura-pra",
  "visura-crif",
  "visura-cr",
];

type OpenApiCatalogItem = {
  serviceType: SupportedVisuraService;
  provider: "visure-camerali" | "catasto" | "visengine2";
  available: boolean;
  title: string;
  description: string;
  resolvedServiceHash?: string;
  resolvedServiceLabel?: string;
};

type OpenApiCatalogResult = {
  sandbox: boolean;
  services: OpenApiCatalogItem[];
};

type OpenApiVisuraInput = {
  serviceType: SupportedVisuraService;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  formData: Record<string, unknown>;
  resolvedServiceHash?: string;
  resolvedServiceLabel?: string;
};

type OpenApiVisuraResult = {
  provider: string;
  providerService: string;
  status: string;
  providerRequestId: string;
  message: string;
  documentUrl: string;
  documentBase64: string;
  summary: Record<string, unknown>;
  raw: unknown;
};

type OpenApiEnvConfig = {
  sandbox: boolean;
  visureCameraliBaseUrl: string;
  visureCameraliBearer: string;
  visureBaseUrl: string;
  visureBearer: string;
  catastoBaseUrl: string;
  catastoBearer: string;
};

type VisengineService = {
  hash: string;
  label: string;
  description: string;
  raw: Record<string, unknown>;
};

function normalizeBaseUrl(value: string) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getConfig(): OpenApiEnvConfig {
  const sandbox = String(process.env.OPENAPI_SANDBOX || "false").trim().toLowerCase() === "true";

  return {
    sandbox,
    visureCameraliBaseUrl: normalizeBaseUrl(
      sandbox
        ? process.env.OPENAPI_VISURE_CAMERALI_BASE_URL_SANDBOX || ""
        : process.env.OPENAPI_VISURE_CAMERALI_BASE_URL_PRODUCTION || "",
    ),
    visureCameraliBearer: String(process.env.OPENAPI_BEARER_VISURE_CAMERALI || "").trim(),
    visureBaseUrl: normalizeBaseUrl(
      sandbox
        ? process.env.OPENAPI_VISURE_BASE_URL_SANDBOX || ""
        : process.env.OPENAPI_VISURE_BASE_URL_PRODUCTION || "",
    ),
    visureBearer: String(process.env.OPENAPI_BEARER_VISURE || "").trim(),
    catastoBaseUrl: normalizeBaseUrl(
      sandbox
        ? process.env.OPENAPI_CATASTO_BASE_URL_SANDBOX || ""
        : process.env.OPENAPI_CATASTO_BASE_URL_PRODUCTION || "",
    ),
    catastoBearer: String(process.env.OPENAPI_BEARER_CATASTO || "").trim(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

function readString(value: unknown) {
  return String(value || "").trim();
}

async function parseResponse(response: Response) {
  const rawText = await response.text();
  let data: unknown = null;

  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      (isObject(data) && (readString(data.message) || readString(data.error) || readString(data.detail))) ||
      rawText.slice(0, 300) ||
      "nessun dettaglio restituito";
    throw new Error(`OpenAPI HTTP ${response.status} ${response.statusText}: ${detail}`);
  }

  return { data, rawText };
}

async function fetchOpenApiJson(
  baseUrl: string,
  path: string,
  bearer: string,
  init?: RequestInit,
) {
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init?.headers || {});
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  return parseResponse(response);
}

function getRequiredProviderConfig(serviceType: SupportedVisuraService) {
  const config = getConfig();

  if (serviceType === "visura-camerale") {
    return {
      available: Boolean(config.visureCameraliBaseUrl && config.visureCameraliBearer),
      missing: [
        !config.visureCameraliBaseUrl ? "OPENAPI_VISURE_CAMERALI_BASE_URL_*" : "",
        !config.visureCameraliBearer ? "OPENAPI_BEARER_VISURE_CAMERALI" : "",
      ].filter(Boolean),
    };
  }

  if (serviceType === "visura-catastale") {
    return {
      available: Boolean(config.catastoBaseUrl && config.catastoBearer),
      missing: [
        !config.catastoBaseUrl ? "OPENAPI_CATASTO_BASE_URL_*" : "",
        !config.catastoBearer ? "OPENAPI_BEARER_CATASTO" : "",
      ].filter(Boolean),
    };
  }

  return {
    available: Boolean(config.visureBaseUrl && config.visureBearer),
    missing: [
      !config.visureBaseUrl ? "OPENAPI_VISURE_BASE_URL_*" : "",
      !config.visureBearer ? "OPENAPI_BEARER_VISURE" : "",
    ].filter(Boolean),
  };
}

function scoreVisengineService(serviceType: SupportedVisuraService, label: string, description: string) {
  const text = `${label} ${description}`.toLowerCase();
  const matchers: Record<SupportedVisuraService, string[]> = {
    "visura-camerale": [],
    "visura-catastale": [],
    "visura-pra": ["pra", "pubblico registro automobilistico", "targa", "veicolo"],
    "visura-crif": ["crif", "eurisc", "creditizia"],
    "visura-cr": ["centrale rischi", "cr banca d'italia", "banca d'italia", "cr"],
  };

  return matchers[serviceType].reduce((score, keyword) => (text.includes(keyword) ? score + 1 : score), 0);
}

async function listVisengineServices() {
  const config = getConfig();
  if (!config.visureBaseUrl || !config.visureBearer) return [];

  const { data } = await fetchOpenApiJson(config.visureBaseUrl, "/visure", config.visureBearer);
  const directRows = asArray<Record<string, unknown>>(data);
  const dataRows = asArray<Record<string, unknown>>(isObject(data) ? data.data : null);
  const resultRows = asArray<Record<string, unknown>>(isObject(data) ? data.results : null);
  const rows = directRows.length > 0 ? directRows : dataRows.length > 0 ? dataRows : resultRows;

  return rows
    .map((row) => {
      const hash =
        readString(row.hash_visura) ||
        readString(row.hash) ||
        readString(row._id) ||
        readString(row.id);
      const label =
        readString(row.nome) ||
        readString(row.label) ||
        readString(row.titolo) ||
        readString(row.descrizione_breve);
      const description =
        readString(row.descrizione) ||
        readString(row.description) ||
        readString(row.descrizione_breve);

      if (!hash || !label) return null;

      return {
        hash,
        label,
        description,
        raw: row,
      } satisfies VisengineService;
    })
    .filter((item): item is VisengineService => Boolean(item));
}

async function resolveVisengineService(serviceType: SupportedVisuraService) {
  const services = await listVisengineServices();
  const sorted = services
    .map((service) => ({
      ...service,
      score: scoreVisengineService(serviceType, service.label, service.description),
    }))
    .filter((service) => service.score > 0)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));

  return sorted[0] || null;
}

function extractVisuraDocument(data: unknown) {
  if (!isObject(data)) {
    return { documentUrl: "", documentBase64: "", providerRequestId: "", status: "" };
  }

  const providerRequestId =
    readString(data.id) ||
    readString(data._id) ||
    readString(data.hash) ||
    readString(data.identificativo);
  const status =
    readString(data.status) ||
    readString(data.stato) ||
    readString(data.esito) ||
    "processing";
  const documentUrl =
    readString(data.document_url) ||
    readString(data.pdf_url) ||
    readString(data.url_pdf) ||
    readString(data.link) ||
    readString(data.url);
  const documentBase64 =
    readString(data.document_base64) ||
    readString(data.pdf_base64) ||
    readString(data.base64);

  return { documentUrl, documentBase64, providerRequestId, status };
}

async function requestCamerale(input: OpenApiVisuraInput): Promise<OpenApiVisuraResult> {
  const config = getConfig();
  const companyTaxId = readString(input.formData.companyTaxId).toUpperCase();

  if (!companyTaxId) {
    throw new Error("Inserisci il codice fiscale o la partita IVA dell'impresa.");
  }

  const { data } = await fetchOpenApiJson(
    config.visureCameraliBaseUrl,
    `/impresa/${encodeURIComponent(companyTaxId)}`,
    config.visureCameraliBearer,
  );

  const payload = isObject(data) ? data : {};
  const summary = {
    denominazione:
      readString(payload.denominazione) ||
      readString(payload.ragione_sociale) ||
      readString(payload.nome),
    rea: readString(payload.rea),
    provincia: readString(payload.provincia),
    statoAttivita:
      readString(payload.stato_attivita) ||
      readString(payload.stato) ||
      "dato recuperato",
    partitaIva: readString(payload.partita_iva) || companyTaxId,
  };

  return {
    provider: "OpenAPI Visure Camerali",
    providerService: "anagrafica impresa",
    status: "completed",
    providerRequestId: companyTaxId,
    message:
      summary.denominazione
        ? `Dati camerali recuperati per ${summary.denominazione}.`
        : "Dati camerali recuperati correttamente.",
    documentUrl: "",
    documentBase64: "",
    summary,
    raw: data,
  };
}

async function requestCatastale(input: OpenApiVisuraInput): Promise<OpenApiVisuraResult> {
  const config = getConfig();
  const subjectTaxCode = readString(input.formData.subjectTaxCode).toUpperCase();
  const province = readString(input.formData.province).toUpperCase();
  const landRegistryType = readString(input.formData.landRegistryType || "F").toUpperCase();
  const reportType = readString(input.formData.reportType || "attuale").toLowerCase();

  if (!subjectTaxCode || !province) {
    throw new Error("Per la visura catastale servono codice fiscale e provincia.");
  }

  const body = {
    entita: "soggetto",
    cf_piva: subjectTaxCode,
    provincia: province,
    tipo_catasto: landRegistryType,
    tipo_visura: reportType,
    richiedente: input.customerName,
  };

  const { data } = await fetchOpenApiJson(
    config.catastoBaseUrl,
    "/visura_catastale",
    config.catastoBearer,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  const parsed = extractVisuraDocument(data);

  return {
    provider: "OpenAPI Catasto",
    providerService: "visura catastale soggetto",
    status: parsed.status || "processing",
    providerRequestId: parsed.providerRequestId,
    message: parsed.documentUrl || parsed.documentBase64
      ? "Visura catastale recuperata correttamente."
      : "Richiesta catastale inviata a OpenAPI e presa in carico.",
    documentUrl: parsed.documentUrl,
    documentBase64: parsed.documentBase64,
    summary: {
      codiceFiscale: subjectTaxCode,
      provincia: province,
      tipoCatasto: landRegistryType,
      tipoVisura: reportType,
    },
    raw: data,
  };
}

function buildVisenginePayload(
  serviceType: SupportedVisuraService,
  input: OpenApiVisuraInput,
  resolvedServiceLabel: string,
) {
  const serviceLabel = resolvedServiceLabel.toLowerCase();

  if (serviceType === "visura-pra") {
    return {
      targa: readString(input.formData.plate).toUpperCase(),
      targa_veicolo: readString(input.formData.plate).toUpperCase(),
      richiedente: input.customerName,
      email: input.email,
    };
  }

  const basePayload = {
    codice_fiscale: readString(input.formData.subjectTaxCode).toUpperCase(),
    cf: readString(input.formData.subjectTaxCode).toUpperCase(),
    nome: readString(input.formData.subjectName),
    cognome: readString(input.formData.subjectSurname),
    nominativo: `${readString(input.formData.subjectName)} ${readString(
      input.formData.subjectSurname,
    )}`.trim(),
    richiedente: input.customerName,
    email: input.email,
  };

  if (serviceLabel.includes("crif")) {
    return {
      ...basePayload,
      consenso_privacy: "1",
      fonte_richiesta: "area_clienti",
    };
  }

  if (serviceLabel.includes("centrale rischi") || serviceLabel.includes("banca d'italia")) {
    return {
      ...basePayload,
      ente: "banca_d_italia",
    };
  }

  return basePayload;
}

async function requestVisengine(input: OpenApiVisuraInput): Promise<OpenApiVisuraResult> {
  const config = getConfig();
  const service =
    input.resolvedServiceHash && input.resolvedServiceLabel
      ? {
          hash: input.resolvedServiceHash,
          label: input.resolvedServiceLabel,
          description: "",
          raw: {},
        }
      : await resolveVisengineService(input.serviceType);

  if (!service) {
    throw new Error("Non ho trovato una visura compatibile sul catalogo OpenAPI per questo servizio.");
  }

  const jsonVisura = buildVisenginePayload(input.serviceType, input, service.label);
  const { data } = await fetchOpenApiJson(
    config.visureBaseUrl,
    "/richiesta",
    config.visureBearer,
    {
      method: "POST",
      body: JSON.stringify({
        hash_visura: service.hash,
        json_visura: jsonVisura,
      }),
    },
  );

  const parsed = extractVisuraDocument(data);

  return {
    provider: "OpenAPI Visengine",
    providerService: service.label,
    status: parsed.status || "processing",
    providerRequestId: parsed.providerRequestId,
    message:
      parsed.documentUrl || parsed.documentBase64
        ? `${service.label} recuperata correttamente.`
        : `${service.label} inviata al provider e ora è in lavorazione.`,
    documentUrl: parsed.documentUrl,
    documentBase64: parsed.documentBase64,
    summary: jsonVisura,
    raw: data,
  };
}

export function getMissingOpenApiConfig(serviceType: SupportedVisuraService) {
  return getRequiredProviderConfig(serviceType).missing;
}

export async function getOpenApiVisureCatalog(): Promise<OpenApiCatalogResult> {
  const config = getConfig();
  const services: OpenApiCatalogItem[] = [
    {
      serviceType: "visura-camerale",
      provider: "visure-camerali",
      available: getRequiredProviderConfig("visura-camerale").available,
      title: "Visura camerale",
      description: "Recupero dati impresa con verifica anagrafica dedicata.",
    },
    {
      serviceType: "visura-catastale",
      provider: "catasto",
      available: getRequiredProviderConfig("visura-catastale").available,
      title: "Visura catastale",
      description: "Richiesta visura catastale per soggetto con flusso dedicato.",
    },
  ];

  const visengineAvailability = getRequiredProviderConfig("visura-pra").available;
  const dynamicItems: OpenApiCatalogItem[] = [
    {
      serviceType: "visura-pra",
      provider: "visengine2",
      available: visengineAvailability,
      title: "Visura PRA",
      description: "Richiesta PRA con collegamento al servizio dedicato.",
    },
    {
      serviceType: "visura-crif",
      provider: "visengine2",
      available: visengineAvailability,
      title: "Visura CRIF",
      description: "Richiesta CRIF con collegamento al servizio dedicato.",
    },
    {
      serviceType: "visura-cr",
      provider: "visengine2",
      available: visengineAvailability,
      title: "Visura Centrale Rischi",
      description: "Richiesta Centrale Rischi con collegamento al servizio dedicato.",
    },
  ];

  if (visengineAvailability) {
    await Promise.all(
      dynamicItems.map(async (item) => {
        try {
          const resolved = await resolveVisengineService(item.serviceType);
          if (resolved) {
            item.resolvedServiceHash = resolved.hash;
            item.resolvedServiceLabel = resolved.label;
          }
        } catch {
          item.available = false;
        }
      }),
    );
  }

  return {
    sandbox: config.sandbox,
    services: [...services, ...dynamicItems],
  };
}

export async function createOpenApiVisuraRequest(
  input: OpenApiVisuraInput,
): Promise<OpenApiVisuraResult> {
  const missing = getMissingOpenApiConfig(input.serviceType);
  if (missing.length > 0) {
    throw new Error(`Configurazione OpenAPI incompleta: ${missing.join(", ")}.`);
  }

  switch (input.serviceType) {
    case "visura-camerale":
      return requestCamerale(input);
    case "visura-catastale":
      return requestCatastale(input);
    case "visura-pra":
    case "visura-crif":
    case "visura-cr":
      return requestVisengine(input);
    default:
      throw new Error("Servizio visura non gestito.");
  }
}
