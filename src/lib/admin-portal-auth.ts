export const ADMIN_PORTAL_TOKEN_KEY = "ag:admin-portal-token";

export type ShippingPricingRule = {
  id: number;
  label: string;
  minWeightKG: number;
  maxWeightKG: number;
  minVolumeM3: number;
  maxVolumeM3: number;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

export type VisuraPricingRule = {
  id: number;
  serviceType: string;
  label: string;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

export type CafPatronatoPricingRule = {
  id: number;
  serviceType: string;
  label: string;
  priceEUR: number;
  sortOrder: number;
  active: boolean;
};

export type AdminPaymentRecord = {
  id: number;
  requestId: number;
  shipmentId: number;
  stripeSessionId: string;
  amountCents: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  priceLabel: string;
  createdAt: string;
  customerName: string;
  email: string;
  serviceType: string;
  requestStatus: string;
  invoiceStatus: string;
  invoiceProvider: string;
  invoiceDocumentId: string;
  invoicePdfUrl: string;
};

export type AdminVisuraRecord = {
  id: number;
  customerName: string;
  email: string;
  serviceType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  provider: string;
  providerService: string;
  providerRequestId: string;
  providerStatus: string;
  documentUrl: string;
  paymentAmountCents: number;
  paymentCurrency: string;
  priceLabel: string;
  paymentStatus: string;
  summary: Record<string, unknown>;
};

export type AdminCafPatronatoRecord = {
  requestId: number;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  serviceType: string;
  serviceScope: string;
  serviceLabel: string;
  categoryLabel: string;
  preferredContactMethod: string;
  preferredContactDate: string | null;
  urgency: string;
  documentSummary: string;
  status: string;
  intakeStatus: string;
  operatorEmail: string;
  operatorEmailStatus: string;
  operatorEmailSentAt: string | null;
  magicLinkExpiresAt: string | null;
  operatorNotes: string;
  resolvedAt: string | null;
  paymentAmountCents: number;
  paymentCurrency: string;
  priceLabel: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  customerFiles: Array<{
    sourceRole: string;
    originalName: string;
    publicUrl: string;
    downloadUrl: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  resolvedFiles: Array<{
    sourceRole: string;
    originalName: string;
    publicUrl: string;
    downloadUrl: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
};

export type AdminConsultingLead = {
  requestId: number;
  serviceType: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  requestStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
  customerType: string;
  businessName: string;
  vatNumber: string;
  currentProvider: string;
  monthlySpendEUR: number;
  city: string;
  bestContactTime: string;
  marketingConsent: boolean;
  leadStatus: string;
  operatorNotes: string;
  quote: {
    fileName: string;
    url: string;
    sentAt: string;
    note: string;
  };
};

export type AdminEmailNotificationRecord = {
  id: number;
  area: string;
  title: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  details: Record<string, unknown>;
  sendStatus: string;
  sendReason: string;
  responseStatus: number;
  errorMessage: string;
  providerMessageId: string;
  createdAt: string | null;
};

export type AdminTicketMessage = {
  id: number;
  ticketId: number;
  authorRole: "customer" | "admin";
  authorName: string;
  message: string;
  attachments: string[];
  createdAt: string;
};

export type AdminTicketRecord = {
  id: number;
  requestId: number | null;
  customerName: string;
  email: string;
  phone: string;
  ticketArea: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  messages: AdminTicketMessage[];
};

const adminPortalApiBase = (
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_API_BASE ||
  process.env.NEXT_PUBLIC_BOOKING_API_BASE ||
  ""
).replace(/\/$/, "");

function resolveAdminPortalApiBase() {
  if (typeof window === "undefined") {
    return adminPortalApiBase;
  }

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const pointsToProduction =
    adminPortalApiBase === "https://agenziaplinio.it" ||
    adminPortalApiBase === "https://www.agenziaplinio.it";

  if (isLocalhost && (!adminPortalApiBase || pointsToProduction)) {
    return "http://localhost:3001";
  }

  return adminPortalApiBase;
}

function buildApiUrl(path: string) {
  const apiBase = resolveAdminPortalApiBase();
  return apiBase ? `${apiBase}${path}` : path;
}

export function getAdminPortalToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_PORTAL_TOKEN_KEY) || "";
}

export function setAdminPortalToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_PORTAL_TOKEN_KEY, token);
}

export function clearAdminPortalToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_PORTAL_TOKEN_KEY);
}

export async function loginAdminPortal(username: string, password: string) {
  const response = await fetch(buildApiUrl("/api/admin-auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const payload = (await response.json()) as { token?: string; message?: string };
  if (!response.ok || !payload.token) {
    throw new Error(payload.message || "Login admin non riuscito");
  }

  setAdminPortalToken(payload.token);
  return payload.token;
}

export async function validateAdminPortalSession(token: string) {
  const response = await fetch(buildApiUrl("/api/admin-auth/session"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    clearAdminPortalToken();
    return false;
  }

  return true;
}

export async function fetchAdminClientAreaRequests(token: string) {
  const response = await fetch(buildApiUrl("/api/admin/client-area/requests"), {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { requests?: any[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento richieste non riuscito");
  }

  return payload.requests || [];
}

export async function updateAdminClientAreaRequestStatus(
  token: string,
  id: number,
  status: string,
) {
  const response = await fetch(buildApiUrl("/api/admin/client-area/requests/status"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ id, status }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Aggiornamento stato non riuscito");
  }

  return payload.message || "Stato aggiornato";
}

export async function fetchAdminShippingPricing(token: string) {
  const response = await fetch(buildApiUrl("/api/admin/shipping-pricing"), {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { rules?: ShippingPricingRule[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento listino non riuscito");
  }

  return payload.rules || [];
}

export async function upsertAdminShippingPricing(
  token: string,
  rule: Omit<ShippingPricingRule, "id"> & { id?: number },
) {
  const response = await fetch(buildApiUrl("/api/admin/shipping-pricing/upsert"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(rule),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Salvataggio listino non riuscito");
  }

  return payload.message || "Regola salvata";
}

export async function deleteAdminShippingPricing(token: string, id: number) {
  const response = await fetch(buildApiUrl("/api/admin/shipping-pricing/delete"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ id }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Rimozione listino non riuscita");
  }

  return payload.message || "Regola rimossa";
}

export async function fetchAdminClientAreaPayments(token: string) {
  const response = await fetch(buildApiUrl("/api/admin/client-area/payments"), {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { payments?: AdminPaymentRecord[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento pagamenti non riuscito");
  }

  return payload.payments || [];
}

export async function fetchAdminClientAreaVisure(token: string) {
  const response = await fetch(buildApiUrl("/api/admin/client-area/visure"), {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { visure?: AdminVisuraRecord[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento visure non riuscito");
  }

  return payload.visure || [];
}

export async function fetchAdminVisurePricing(token: string) {
  const response = await fetch(buildApiUrl("/api/admin/visure-pricing"), {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { rules?: VisuraPricingRule[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento listino visure non riuscito");
  }

  return payload.rules || [];
}

export async function upsertAdminVisurePricing(
  token: string,
  rule: Omit<VisuraPricingRule, "id"> & { id?: number },
) {
  const response = await fetch(buildApiUrl("/api/admin/visure-pricing/upsert"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(rule),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Salvataggio listino visure non riuscito");
  }

  return payload.message || "Regola visura salvata";
}

export async function deleteAdminVisurePricing(token: string, id: number) {
  const response = await fetch(buildApiUrl("/api/admin/visure-pricing/delete"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ id }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Rimozione listino visure non riuscita");
  }

  return payload.message || "Regola visura rimossa";
}

export async function fetchAdminCafPatronatoRequests(token: string) {
  const response = await fetch("/api/admin/caf-patronato/requests", {
    method: "POST",
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    requests?: AdminCafPatronatoRecord[];
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento pratiche CAF e Patronato non riuscito");
  }

  return payload.requests || [];
}

export async function updateAdminCafPatronatoStatus(
  token: string,
  requestId: number,
  status: string,
  operatorNotes: string,
) {
  const response = await fetch("/api/admin/caf-patronato/requests/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ requestId, status, operatorNotes }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Aggiornamento pratica CAF e Patronato non riuscito");
  }

  return payload.message || "Pratica aggiornata";
}

export async function fetchAdminCafPatronatoPricing(token: string) {
  const response = await fetch("/api/admin/caf-patronato/pricing", {
    method: "POST",
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    rules?: CafPatronatoPricingRule[];
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento listino CAF e Patronato non riuscito");
  }

  return payload.rules || [];
}

export async function upsertAdminCafPatronatoPricing(
  token: string,
  rule: Omit<CafPatronatoPricingRule, "id"> & { id?: number },
) {
  const response = await fetch("/api/admin/caf-patronato/pricing/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify(rule),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Salvataggio listino CAF e Patronato non riuscito");
  }

  return payload.message || "Regola CAF/Patronato salvata";
}

export async function deleteAdminCafPatronatoPricing(token: string, id: number) {
  const response = await fetch("/api/admin/caf-patronato/pricing/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ id }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Rimozione listino CAF e Patronato non riuscita");
  }

  return payload.message || "Regola CAF/Patronato rimossa";
}

export async function fetchAdminConsultingLeads(token: string) {
  const response = await fetch("/api/admin/client-area/consulting-leads", {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    leads?: AdminConsultingLead[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Caricamento lead consulenze non riuscito");
  }

  return payload.leads || [];
}

export async function updateAdminConsultingLeadStatus(
  token: string,
  requestId: number,
  leadStatus: string,
  operatorNotes: string,
) {
  const response = await fetch("/api/admin/client-area/consulting-leads/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ requestId, leadStatus, operatorNotes }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Aggiornamento lead non riuscito");
  }

  return payload.message || "Lead aggiornata";
}

export async function uploadAdminConsultingQuote(
  token: string,
  requestId: number,
  file: File,
  note: string,
) {
  const formData = new FormData();
  formData.set("requestId", String(requestId));
  formData.set("note", note);
  formData.append("quoteFile", file);

  const response = await fetch("/api/admin/client-area/consulting-leads/quote", {
    method: "POST",
    headers: {
      "x-admin-token": token,
    },
    body: formData,
  });

  const payload = (await response.json()) as {
    message?: string;
    quote?: AdminConsultingLead["quote"];
  };

  if (!response.ok) {
    throw new Error(payload.message || "Upload preventivo non riuscito");
  }

  return {
    message: payload.message || "Preventivo inviato",
    quote: payload.quote || { fileName: "", url: "", sentAt: "", note: "" },
  };
}

export async function fetchAdminEmailNotifications(
  token: string,
  filters?: { area?: string; status?: string },
) {
  const params = new URLSearchParams();
  if (filters?.area) {
    params.set("area", filters.area);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const url = `/api/admin/client-area/email-notifications${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    headers: {
      "x-admin-token": token,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    notifications?: AdminEmailNotificationRecord[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Caricamento notifiche email non riuscito");
  }

  return payload.notifications || [];
}

export async function fetchAdminClientAreaTickets(
  token: string,
  filters?: { area?: string; status?: string; search?: string },
) {
  const response = await fetch("/api/admin/client-area/ticket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    cache: "no-store",
    body: JSON.stringify({
      action: "list",
      area: filters?.area || "all",
      status: filters?.status || "all",
      search: filters?.search || "",
    }),
  });

  const payload = (await response.json()) as { tickets?: AdminTicketRecord[]; message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Caricamento ticket non riuscito");
  }

  return payload.tickets || [];
}

export async function updateAdminClientAreaTicketStatus(
  token: string,
  ticketId: number,
  status: string,
) {
  const response = await fetch("/api/admin/client-area/ticket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
    },
    body: JSON.stringify({ action: "status", ticketId, status }),
  });

  const payload = (await response.json()) as { message?: string };
  if (!response.ok) {
    throw new Error(payload.message || "Aggiornamento stato ticket non riuscito");
  }

  return payload.message || "Stato ticket aggiornato";
}

export async function replyAdminClientAreaTicket(
  token: string,
  args: {
    ticketId: number;
    message: string;
    status?: string;
    adminName?: string;
    files?: File[];
  },
) {
  const formData = new FormData();
  formData.set("ticketId", String(args.ticketId));
  formData.set("message", args.message);
  formData.set("status", args.status || "in_lavorazione");
  formData.set("adminName", args.adminName || "Backoffice");
  for (const file of args.files || []) {
    formData.append("files", file);
  }

  const response = await fetch("/api/admin/client-area/ticket", {
    method: "POST",
    headers: {
      "x-admin-token": token,
    },
    body: formData,
  });

  const payload = (await response.json()) as {
    message?: string;
    reply?: AdminTicketMessage & { status?: string };
  };
  if (!response.ok) {
    throw new Error(payload.message || "Invio risposta ticket non riuscito");
  }

  return {
    message: payload.message || "Risposta ticket inviata",
    reply: payload.reply,
  };
}

export async function createAdminClientAreaTicket(
  token: string,
  args: {
    customerName: string;
    email: string;
    phone?: string;
    requestId?: number | null;
    ticketArea?: string;
    priority?: string;
    subject: string;
    message: string;
    files?: File[];
  },
) {
  const formData = new FormData();
  formData.set("action", "create");
  formData.set("customerName", args.customerName);
  formData.set("email", args.email);
  formData.set("phone", args.phone || "");
  formData.set("requestId", String(args.requestId || ""));
  formData.set("ticketArea", args.ticketArea || "generale");
  formData.set("priority", args.priority || "normale");
  formData.set("subject", args.subject);
  formData.set("message", args.message);
  for (const file of args.files || []) {
    formData.append("files", file);
  }

  const response = await fetch("/api/admin/client-area/ticket", {
    method: "POST",
    headers: {
      "x-admin-token": token,
    },
    body: formData,
  });

  const payload = (await response.json()) as {
    message?: string;
    ticket?: AdminTicketRecord;
  };
  if (!response.ok) {
    throw new Error(payload.message || "Apertura ticket da admin non riuscita");
  }

  return {
    message: payload.message || "Ticket aperto",
    ticket: payload.ticket,
  };
}
