type BrtConfig = {
  apiBase: string;
  ormBaseUrl: string;
  pudoBaseUrl: string;
  pudoAuthToken: string;
  apiKey: string;
  ormApiKey: string;
  ormRqCustomerCode: string;
  ormCollectionTime: string;
  ormGoodDescription: string;
  manifestEndpoint: string;
  userId: string;
  password: string;
  departureDepot: string;
  senderCustomerCode: string;
  pricingConditionCode: string;
  pricingConditionCodeItalia: string;
  pricingConditionCodePudo: string;
  pricingConditionCodeEurope: string;
  pricingConditionCodeSwiss: string;
  allowedDestinationCountries: string[];
  deliveryFreightTypeCode: string;
  defaultCountry: string;
  defaultServiceType: string;
  labelRequired: boolean;
  labelOutputType: string;
  labelOffsetX: string;
  labelOffsetY: string;
  labelBorderRequired: string;
  labelLogoRequired: string;
  labelBarcodeControlRowRequired: string;
};

export type BrtShipmentInput = {
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
  pudoId?: string;
  parcelCount: number;
  parcelLengthCM: number;
  parcelHeightCM: number;
  parcelDepthCM: number;
  volumeM3: number;
  volumetricWeightKG: number;
  weightKG: number;
  notes: string;
  serviceCode: string;
};

type BrtExecutionMessage = {
  code?: number;
  severity?: string;
  codeDesc?: string;
  message?: string;
};

export type BrtShipmentResult = {
  executionMessage?: BrtExecutionMessage;
  trackingCode: string;
  parcelId: string;
  labelPdfBase64: string;
  shipmentNumberFrom: string;
  shipmentNumberTo: string;
  numericSenderReference: number;
  alphanumericSenderReference: string;
  confirmed: boolean;
  confirmMessage: string;
};

export type BrtRoutingInput = {
  destinationCompanyName: string;
  destinationAddress: string;
  destinationZIPCode: string;
  destinationCity: string;
  destinationProvince: string;
  destinationCountry: string;
  pudoId?: string;
  parcelCount: number;
  volumeM3: number;
  weightKG: number;
  serviceCode: string;
};

export type BrtRoutingResult = {
  executionMessage?: BrtExecutionMessage;
  arrivalTerminal: string;
  arrivalDepot: string;
  deliveryZone: string;
};

export type BrtTrackingEvent = {
  date: string;
  time: string;
  description: string;
  branch: string;
};

export type BrtTrackingResult = {
  executionMessage?: BrtExecutionMessage;
  parcelId: string;
  shipmentId: string;
  status: string;
  statusDescription: string;
  events: BrtTrackingEvent[];
};

export type BrtDeleteInput = {
  numericSenderReference: number;
  alphanumericSenderReference: string;
};

export type BrtDeleteResult = {
  executionMessage?: BrtExecutionMessage;
  deleted: boolean;
  message: string;
};

export type BrtPudoPoint = {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  city: string;
  province: string;
  country: string;
};

export type BrtManifestInput = {
  numericSenderReference: number;
  alphanumericSenderReference: string;
};

export type BrtManifestResult = {
  created: boolean;
  message: string;
  payload: unknown;
};

export type BrtOrmPickupInput = {
  customerName: string;
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
  parcelCount: number;
  weightKG: number;
  notes: string;
};

export type BrtOrmPickupResult = {
  created: boolean;
  message: string;
  reservationNumber: string;
  ormNumber: string;
  collectionDate: string;
  collectionTime: string;
  payload: unknown;
};

const BRT_PUDO_COUNTRY_ALPHA3: Record<string, string> = {
  AT: "AUT",
  BE: "BEL",
  BG: "BGR",
  CH: "CHE",
  CY: "CYP",
  CZ: "CZE",
  DE: "DEU",
  DK: "DNK",
  EE: "EST",
  ES: "ESP",
  FI: "FIN",
  FR: "FRA",
  GB: "GBR",
  GR: "GRC",
  HR: "HRV",
  HU: "HUN",
  IE: "IRL",
  IT: "ITA",
  LT: "LTU",
  LU: "LUX",
  LV: "LVA",
  MT: "MLT",
  NL: "NLD",
  NO: "NOR",
  PL: "POL",
  PT: "PRT",
  RO: "ROU",
  SE: "SWE",
  SI: "SVN",
  SK: "SVK",
  US: "USA",
};

function normalizeBrtPudoBaseUrl(value: string): string {
  const baseUrl = String(value || "").trim().replace(/\/$/, "");
  if (!baseUrl) {
    return "";
  }
  if (baseUrl.endsWith("/get-pudo-by-address")) {
    return baseUrl;
  }
  if (baseUrl.endsWith("/pickup")) {
    return `${baseUrl}/get-pudo-by-address`;
  }
  return baseUrl;
}

function toBrtPudoCountryCode(value: string): string {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  if (!normalized) {
    return "ITA";
  }
  if (normalized.length === 3) {
    return normalized;
  }

  return BRT_PUDO_COUNTRY_ALPHA3[normalized] || normalized;
}

export type BrtConfirmInput = {
  numericSenderReference: number;
  alphanumericSenderReference: string;
  cmrCode?: string;
};

export type BrtConfirmResult = {
  executionMessage?: BrtExecutionMessage;
  confirmed: boolean;
  message: string;
};

function getConfig(): BrtConfig {
  const rawLabelRequired = String(process.env.BRT_LABEL_REQUIRED || "true").trim().toLowerCase();
  const apiBase = String(
    process.env.BRT_SHIPMENT_API_BASE ||
      process.env.BRT_REST_BASE_URL ||
      process.env.BRT_BASE_URL ||
      "",
  )
    .trim()
    .replace(/\/$/, "");

  return {
    apiBase,
    ormBaseUrl: String(process.env.BRT_ORM_BASE_URL || "").trim().replace(/\/$/, ""),
    pudoBaseUrl: normalizeBrtPudoBaseUrl(process.env.BRT_PUDO_BASE_URL || ""),
    pudoAuthToken: String(
      process.env.BRT_PUDO_AUTH_TOKEN || process.env.BRT_PUDO_API_AUTH || "",
    ).trim(),
    apiKey: String(process.env.BRT_API_KEY || "").trim(),
    ormApiKey: String(process.env.BRT_ORM_API_KEY || "").trim(),
    ormRqCustomerCode: String(
      process.env.BRT_ORM_RQ_CUSTOMER_CODE || process.env.BRT_RQ_CUSTOMER_CODE || "",
    ).trim(),
    ormCollectionTime: String(process.env.BRT_ORM_COLLECTION_TIME || "10:00").trim(),
    ormGoodDescription: String(process.env.BRT_ORM_GOOD_DESCRIPTION || "Merce generica").trim(),
    manifestEndpoint: String(process.env.BRT_MANIFEST_ENDPOINT || "").trim(),
    userId: String(
      process.env.BRT_SHIPMENT_USER_ID ||
        process.env.BRT_ACCOUNT_USER_ID ||
        process.env.BRT_USER ||
        "",
    ).trim(),
    password: String(
      process.env.BRT_SHIPMENT_PASSWORD ||
        process.env.BRT_ACCOUNT_PASSWORD ||
        process.env.BRT_PASSWORD ||
        "",
    ).trim(),
    departureDepot: String(process.env.BRT_DEPARTURE_DEPOT || "").trim(),
    senderCustomerCode: String(
      process.env.BRT_SENDER_CUSTOMER_CODE ||
        process.env.BRT_PORTAL_CUSTOMER_CODE ||
        process.env.BRT_ACCOUNT_USER_ID ||
        "",
    ).trim(),
    pricingConditionCode: String(
      process.env.BRT_PRICING_CONDITION_CODE || process.env.BRT_PRICING || "000",
    ).trim(),
    pricingConditionCodeItalia: String(
      process.env.BRT_PRICING_CONDITION_CODE_ITALIA ||
        process.env.BRT_PRICING_CONDITION_CODE ||
        process.env.BRT_PRICING ||
        "000",
    ).trim(),
    pricingConditionCodePudo: String(
      process.env.BRT_PRICING_CONDITION_CODE_PUDO ||
        process.env.BRT_PRICING_CONDITION_CODE ||
        process.env.BRT_PRICING ||
        "000",
    ).trim(),
    pricingConditionCodeEurope: String(
      process.env.BRT_PRICING_CONDITION_CODE_EUROPE ||
        process.env.BRT_PRICING_CONDITION_CODE ||
        process.env.BRT_PRICING ||
        "000",
    ).trim(),
    pricingConditionCodeSwiss: String(
      process.env.BRT_PRICING_CONDITION_CODE_SWISS ||
        process.env.BRT_PRICING_CONDITION_CODE ||
        process.env.BRT_PRICING ||
        "000",
    ).trim(),
    allowedDestinationCountries: String(process.env.BRT_ALLOWED_DESTINATION_COUNTRIES || "IT")
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean),
    deliveryFreightTypeCode: String(process.env.BRT_DELIVERY_FREIGHT_TYPE_CODE || "DAP").trim(),
    defaultCountry: String(process.env.BRT_DEFAULT_COUNTRY || "IT").trim().toUpperCase(),
    defaultServiceType: String(process.env.BRT_DEFAULT_SERVICE_TYPE || "").trim(),
    labelRequired: rawLabelRequired !== "false" && rawLabelRequired !== "0" && rawLabelRequired !== "no",
    labelOutputType: String(process.env.BRT_LABEL_OUTPUT_TYPE || "PDF").trim(),
    labelOffsetX: String(process.env.BRT_LABEL_OFFSET_X || "").trim(),
    labelOffsetY: String(process.env.BRT_LABEL_OFFSET_Y || "").trim(),
    labelBorderRequired:
      String(process.env.BRT_LABEL_BORDER || "").trim().toLowerCase() === "true" ? "1" : "",
    labelLogoRequired:
      String(process.env.BRT_LABEL_LOGO || "").trim().toLowerCase() === "true" ? "1" : "",
    labelBarcodeControlRowRequired:
      String(process.env.BRT_LABEL_BARCODE_ROW || "").trim().toLowerCase() === "true" ? "1" : "",
  };
}

function isAutoConfirmEnabled() {
  const value = String(process.env.BRT_AUTO_CONFIRM || "false").trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function getMissingBrtPudoConfig() {
  const config = getConfig();
  const requiredKeys: Array<keyof BrtConfig> = ["pudoBaseUrl", "pudoAuthToken"];
  return requiredKeys.filter((key) => !String(config[key] ?? "").trim());
}

export function getMissingBrtOrmConfig() {
  const config = getConfig();
  const requiredKeys: Array<keyof BrtConfig> = [
    "ormBaseUrl",
    "ormApiKey",
    "ormRqCustomerCode",
    "senderCustomerCode",
  ];
  return requiredKeys.filter((key) => !String(config[key] ?? "").trim());
}

export function getMissingBrtManifestConfig() {
  const config = getConfig();
  const requiredKeys: Array<keyof BrtConfig> = ["apiBase", "manifestEndpoint", "userId", "password"];
  return requiredKeys.filter((key) => !String(config[key] ?? "").trim());
}

export function getMissingBrtConfig() {
  const config = getConfig();
  const requiredKeys: Array<keyof BrtConfig> = [
    "apiBase",
    "userId",
    "password",
    "departureDepot",
    "senderCustomerCode",
    "pricingConditionCode",
    "deliveryFreightTypeCode",
    "labelOutputType",
  ];

  return requiredKeys.filter((key) => !String(config[key] ?? "").trim());
}

function normalizeServiceType(serviceCode: string) {
  if (serviceCode === "ritiro-nazionale") return "C";
  return "";
}

function selectPricingConditionCode(config: BrtConfig, country: string, pudoId?: string) {
  if (pudoId) return config.pricingConditionCodePudo || config.pricingConditionCode;
  if (country === "IT") return config.pricingConditionCodeItalia || config.pricingConditionCode;
  if (country === "CH") return config.pricingConditionCodeSwiss || config.pricingConditionCode;
  if (config.allowedDestinationCountries.includes(country)) {
    return config.pricingConditionCodeEurope || config.pricingConditionCode;
  }
  return config.pricingConditionCode;
}

function buildReference(value: string) {
  const cleaned = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 15);
  return cleaned || "AGCLIENTI";
}

function getNextOrmCollectionDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  // Avoid requesting collections on Sunday by default.
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildAccount(config: BrtConfig) {
  return {
    userID: config.userId,
    password: config.password,
  };
}

function buildRoutingPayload(input: BrtRoutingInput, config: BrtConfig) {
  const pricingConditionCode = selectPricingConditionCode(
    config,
    input.destinationCountry,
    input.pudoId,
  );
  return {
    account: buildAccount(config),
    routingData: {
      network: "",
      departureDepot: config.departureDepot,
      senderCustomerCode: config.senderCustomerCode,
      deliveryFreightTypeCode: config.deliveryFreightTypeCode,
      consigneeCompanyName: input.destinationCompanyName,
      consigneeAddress: input.destinationAddress,
      consigneeZIPCode: input.destinationZIPCode,
      consigneeCity: input.destinationCity,
      consigneeProvinceAbbreviation: input.destinationProvince,
      consigneeCountryAbbreviationISOAlpha2: input.destinationCountry,
      pricingConditionCode,
      serviceType: normalizeServiceType(input.serviceCode) || config.defaultServiceType,
      numberOfParcels: input.parcelCount,
      weightKG: input.weightKG,
      volumeM3: input.volumeM3,
      pudoId: input.pudoId || "",
      holdForPickup: input.pudoId ? "1" : "",
    },
  };
}

export async function createBrtShipment(input: BrtShipmentInput): Promise<BrtShipmentResult> {
  const config = getConfig();
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT incompleta: ${missing.join(", ")}`);
  }

  const pricingConditionCode = selectPricingConditionCode(
    config,
    input.destinationCountry,
    input.pudoId,
  );
  const serviceType = normalizeServiceType(input.serviceCode) || config.defaultServiceType;
  const reference = buildReference(input.customerName);
  const numericSenderReference = Date.now();
  const payload = {
    account: buildAccount(config),
    createData: {
      network: "",
      departureDepot: config.departureDepot,
      senderCustomerCode: config.senderCustomerCode,
      deliveryFreightTypeCode: config.deliveryFreightTypeCode,
      consigneeCompanyName: input.destinationCompanyName,
      consigneeAddress: input.destinationAddress,
      consigneeZIPCode: input.destinationZIPCode,
      consigneeCity: input.destinationCity,
      consigneeProvinceAbbreviation: input.destinationProvince,
      consigneeCountryAbbreviationISOAlpha2: input.destinationCountry,
      consigneeContactName: input.customerName,
      consigneeTelephone: input.phone,
      consigneeEMail: input.email,
      consigneeMobilePhoneNumber: input.phone,
      isAlertRequired: 1,
      pricingConditionCode,
      serviceType,
      pudoId: input.pudoId || "",
      holdForPickup: input.pudoId ? "1" : "",
      numberOfParcels: String(input.parcelCount),
      weightKG: input.weightKG,
      volumeM3: input.volumeM3,
      insuranceAmount: "0",
      insuranceAmountCurrency: "EUR",
      cashOnDelivery: "0",
      isCODMandatory: "0",
      codCurrency: "EUR",
      numericSenderReference,
      alphanumericSenderReference: reference,
      notes: input.notes || null,
    },
    isLabelRequired: config.labelRequired ? 1 : 0,
    labelParameters: {
      outputType: config.labelOutputType,
      offsetX: config.labelOffsetX || null,
      offsetY: config.labelOffsetY || null,
      isBorderRequired: config.labelBorderRequired || null,
      isLogoRequired: config.labelLogoRequired || null,
      isBarcodeControlRowRequired: config.labelBarcodeControlRowRequired || null,
    },
    actualSender: {
      actualSenderName: input.customerName,
      actualSenderAddress: input.pickupAddress,
      actualSenderZIPCode: input.pickupZIPCode,
      actualSenderCity: input.pickupCity,
      actualSenderProvince: input.pickupProvince,
      actualSenderCountry: config.defaultCountry,
      actualSenderEmail: input.email,
      actualSenderMobilePhoneNumber: input.phone,
    },
  };

  const response = await fetch(`${config.apiBase}/shipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.createResponse?.executionMessage?.message ||
      data?.message ||
      "BRT non ha accettato la richiesta di spedizione.";
    throw new Error(message);
  }

  const createResponse = data?.createResponse;
  const executionMessage = createResponse?.executionMessage;
  const firstLabel = createResponse?.labels?.label?.[0];
  const code = Number(executionMessage?.code ?? 0);

  if (code !== 0) {
    throw new Error(
      executionMessage?.message ||
        executionMessage?.codeDesc ||
        "BRT ha restituito un errore durante la creazione della spedizione.",
    );
  }

  let confirmed = false;
  let confirmMessage = "";
  if (isAutoConfirmEnabled()) {
    try {
      const confirmResult = await confirmBrtShipment({
        numericSenderReference,
        alphanumericSenderReference: reference,
      });
      confirmed = confirmResult.confirmed;
      confirmMessage = confirmResult.message;
    } catch (error) {
      confirmMessage =
        error instanceof Error ? error.message : "Conferma automatica BRT non riuscita.";
    }
  }

  return {
    executionMessage,
    trackingCode: String(firstLabel?.trackingByParcelID || ""),
    parcelId: String(firstLabel?.parcelID || ""),
    labelPdfBase64: String(firstLabel?.stream || ""),
    shipmentNumberFrom: String(createResponse?.parcelNumberFrom || ""),
    shipmentNumberTo: String(createResponse?.parcelNumberTo || ""),
    numericSenderReference,
    alphanumericSenderReference: reference,
    confirmed,
    confirmMessage,
  };
}

export async function createBrtOrmPickup(
  input: BrtOrmPickupInput,
): Promise<BrtOrmPickupResult> {
  const config = getConfig();
  const missing = getMissingBrtOrmConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT ORM incompleta: ${missing.join(", ")}`);
  }

  const reference = buildReference(input.customerName);
  const endpoint = `${config.ormBaseUrl}/colreqs`;
  const collectionDate = getNextOrmCollectionDate();
  const collectionTime = config.ormCollectionTime;
  const payload = [
    {
      requestInfos: {
        parcelCount: input.parcelCount,
        collectionDate,
      },
      customerInfos: {
        custAccNumber: config.senderCustomerCode,
      },
      stakeholders: [
        {
          type: "RQ",
          customerInfos: {
            custAccNumber: config.ormRqCustomerCode,
          },
        },
        {
          type: "SE",
          address: {
            compName: input.customerName,
            street: input.pickupAddress,
            state: input.pickupProvince,
            countryCode: "IT",
            zipCode: input.pickupZIPCode,
            city: input.pickupCity,
          },
          contact: {
            contactDetails: {
              phone: input.phone,
              contactPerson: input.customerName,
            },
          },
        },
        {
          type: "RE",
          address: {
            compName: input.destinationCompanyName,
            street: input.destinationAddress,
            state: input.destinationProvince,
            countryCode: input.destinationCountry,
            zipCode: input.destinationZIPCode,
            city: input.destinationCity,
          },
        },
      ],
      brtSpec: {
        goodDescription: config.ormGoodDescription,
        payerType: "Ordering",
        collectionTime,
        weightKG: input.weightKG,
        notes: input.notes,
        requestRef: reference,
      },
    },
  ];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Api-Key": config.ormApiKey,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let data: any = null;
  let rawText = "";
  try {
    rawText = await response.text();
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const upstreamMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      rawText.slice(0, 300) ||
      "nessun dettaglio restituito";
    throw new Error(`BRT ORM HTTP ${response.status} ${response.statusText}: ${upstreamMessage}`);
  }

  const firstItem = Array.isArray(data) ? data[0] || null : data;
  const reservationNumber = String(
    firstItem?.ormReservationNumber || firstItem?.reservationNumber || "",
  ).trim();
  const ormNumber = String(firstItem?.ormNumber || firstItem?.reservationNumber || "").trim();
  const itemErrors = Array.isArray(firstItem?.errors) ? firstItem.errors : [];

  if (itemErrors.length > 0) {
    const firstError = itemErrors[0];
    throw new Error(
      String(
        firstError?.message ||
          firstError?.description ||
          firstError?.codeDesc ||
          "BRT ORM ha restituito un errore sul ritiro.",
      ).trim(),
    );
  }

  return {
    created: Boolean(reservationNumber || ormNumber),
    message:
      reservationNumber || ormNumber
        ? "Ritiro automatico BRT prenotato."
        : "Richiesta ORM inviata ma nessun numero di prenotazione restituito.",
    reservationNumber,
    ormNumber,
    collectionDate,
    collectionTime,
    payload: data,
  };
}

export async function routeBrtShipment(input: BrtRoutingInput): Promise<BrtRoutingResult> {
  const config = getConfig();
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT incompleta: ${missing.join(", ")}`);
  }

  const response = await fetch(`${config.apiBase}/routing`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildRoutingPayload(input, config)),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const routingResponse = data?.routingResponse;
  const executionMessage = routingResponse?.executionMessage;

  if (!response.ok || Number(executionMessage?.code ?? 0) !== 0) {
    throw new Error(
      executionMessage?.message ||
        executionMessage?.codeDesc ||
        data?.message ||
        "BRT non ha restituito un instradamento valido.",
    );
  }

  return {
    executionMessage,
    arrivalTerminal: String(routingResponse?.arrivalTerminal || ""),
    arrivalDepot: String(routingResponse?.arrivalDepot || ""),
    deliveryZone: String(routingResponse?.deliveryZone || ""),
  };
}

export async function trackBrtParcel(parcelId: string): Promise<BrtTrackingResult> {
  const config = getConfig();
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT incompleta: ${missing.join(", ")}`);
  }

  const safeParcelId = encodeURIComponent(parcelId.trim());
  const response = await fetch(`${config.apiBase}/parcelID/${safeParcelId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      userID: config.userId,
      password: config.password,
    },
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const trackingResponse = data?.ttParcelIdResponse;
  const executionMessage = trackingResponse?.executionMessage;

  if (!response.ok || Number(executionMessage?.code ?? 0) !== 0) {
    throw new Error(
      executionMessage?.message ||
        executionMessage?.codeDesc ||
        data?.message ||
        "BRT non ha restituito i dati di tracking.",
    );
  }

  const shipment = trackingResponse?.bolla?.dati_spedizione || {};
  const events = Array.isArray(trackingResponse?.lista_eventi)
    ? trackingResponse.lista_eventi.map((item: any) => ({
        date: String(item?.evento?.data || ""),
        time: String(item?.evento?.ora || ""),
        description:
          String(item?.evento?.descrizione || "") ||
          String(item?.evento?.descrizione_evento || "") ||
          String(item?.evento?.filiale_descrizione || ""),
        branch: String(item?.evento?.filiale || ""),
      }))
    : [];

  return {
    executionMessage,
    parcelId: String(parcelId),
    shipmentId: String(shipment?.spedizione_id || ""),
    status: String(shipment?.stato_spedizione || ""),
    statusDescription:
      String(shipment?.descrizione_stato_sped_parte1 || "") +
      (shipment?.descrizione_stato_sped_parte2
        ? ` ${String(shipment.descrizione_stato_sped_parte2)}`
        : ""),
    events,
  };
}

export async function confirmBrtShipment(input: BrtConfirmInput): Promise<BrtConfirmResult> {
  const config = getConfig();
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT incompleta: ${missing.join(", ")}`);
  }

  const response = await fetch(`${config.apiBase}/shipment`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      account: buildAccount(config),
      confirmData: {
        senderCustomerCode: config.senderCustomerCode,
        numericSenderReference: input.numericSenderReference,
        alphanumericSenderReference: input.alphanumericSenderReference,
        cmrCode: input.cmrCode || "",
      },
    }),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const confirmResponse = data?.confirmResponse;
  const executionMessage = confirmResponse?.executionMessage;

  if (!response.ok || Number(executionMessage?.code ?? 0) !== 0) {
    throw new Error(
      executionMessage?.message ||
        executionMessage?.codeDesc ||
        data?.message ||
        "BRT non ha confermato la spedizione.",
    );
  }

  return {
    executionMessage,
    confirmed: true,
    message:
      String(executionMessage?.message || "").trim() || "Spedizione confermata correttamente.",
  };
}

export async function deleteBrtShipment(input: BrtDeleteInput): Promise<BrtDeleteResult> {
  const config = getConfig();
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT incompleta: ${missing.join(", ")}`);
  }

  const response = await fetch(`${config.apiBase}/delete`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      account: buildAccount(config),
      deleteData: {
        senderCustomerCode: config.senderCustomerCode,
        numericSenderReference: input.numericSenderReference,
        alphanumericSenderReference: input.alphanumericSenderReference,
      },
    }),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const deleteResponse = data?.deleteResponse;
  const executionMessage = deleteResponse?.executionMessage;

  if (!response.ok || Number(executionMessage?.code ?? 0) !== 0) {
    throw new Error(
      executionMessage?.message ||
        executionMessage?.codeDesc ||
        data?.message ||
        "BRT non ha annullato la spedizione.",
    );
  }

  return {
    executionMessage,
    deleted: true,
    message:
      String(executionMessage?.message || "").trim() || "Spedizione annullata correttamente.",
  };
}

function toPudoPoints(value: any): BrtPudoPoint[] {
  const rawItems = Array.isArray(value)
    ? value
    : Array.isArray(value?.pudo)
      ? value.pudo
    : Array.isArray(value?.items)
      ? value.items
      : Array.isArray(value?.results)
        ? value.results
        : Array.isArray(value?.pickupPoints)
          ? value.pickupPoints
          : Array.isArray(value?.data)
            ? value.data
            : [];

  return rawItems
    .map((item: any) => ({
      id: String(item?.id || item?.pudoId || item?.pickupPointId || "").trim(),
      name: String(
        item?.name || item?.pointName || item?.description || item?.companyName || "",
      ).trim(),
      address: String(
        item?.address || item?.fullAddress || item?.street || item?.locationAddress || "",
      ).trim(),
      zipCode: String(item?.zipCode || item?.postalCode || "").trim(),
      city: String(item?.city || item?.locality || item?.town || "").trim(),
      province: String(item?.province || item?.state || item?.department || "").trim(),
      country: String(item?.country || item?.countryCode || "").trim().toUpperCase(),
    }))
    .filter((item: BrtPudoPoint) => item.id);
}

export async function searchBrtPudo(options: {
  zipCode: string;
  city: string;
  country: string;
}) {
  const config = getConfig();
  const missing = getMissingBrtPudoConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT PUDO incompleta: ${missing.join(", ")}`);
  }

  const url = new URL(config.pudoBaseUrl);
  if (options.zipCode) url.searchParams.set("zipCode", options.zipCode);
  if (options.city) url.searchParams.set("city", options.city);
  url.searchParams.set("countryCode", toBrtPudoCountryCode(options.country));
  url.searchParams.set("maxDistanceSearch", "50000");
  url.searchParams.set("max_pudo_number", "25");
  url.searchParams.set("holiday_tolerant", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-API-Auth": config.pudoAuthToken,
    },
    cache: "no-store",
  });

  let data: any = null;
  let rawText = "";
  try {
    rawText = await response.text();
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const upstreamMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      rawText.slice(0, 300) ||
      "nessun dettaglio restituito";
    throw new Error(
      `BRT PUDO HTTP ${response.status} ${response.statusText}: ${upstreamMessage}`,
    );
  }

  return {
    raw: data,
    points: toPudoPoints(data),
  };
}

export async function createBrtManifest(input: BrtManifestInput): Promise<BrtManifestResult> {
  const config = getConfig();
  const missing = getMissingBrtManifestConfig();
  if (missing.length > 0) {
    throw new Error(`Configurazione BRT manifest incompleta: ${missing.join(", ")}`);
  }

  const endpoint = `${config.apiBase}${config.manifestEndpoint.startsWith("/") ? "" : "/"}${config.manifestEndpoint}`;
  const body = {
    account: buildAccount(config),
    senderCustomerCode: config.senderCustomerCode,
    shipments: [
      {
        numericSenderReference: input.numericSenderReference,
        alphanumericSenderReference: input.alphanumericSenderReference,
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": config.apiKey || config.pudoAuthToken || "",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "BRT non ha generato il manifest.");
  }

  return {
    created: true,
    message: data?.message || "Richiesta manifest inviata a BRT.",
    payload: data,
  };
}
