type StripeCheckoutSessionConfig = {
  amountCents: number;
  customerEmail: string;
  description: string;
  productName?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  invoiceDescription?: string;
};

type StripeCheckoutSessionResponse = {
  id: string;
  url: string;
};

type StripeCheckoutSessionDetails = {
  id: string;
  status: string;
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  invoiceId: string;
  invoicePdf: string;
  hostedInvoiceUrl: string;
};

function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || "";
}

export function isStripeConfigured() {
  return Boolean(getStripeSecretKey());
}

async function callStripeApi(path: string, init?: RequestInit) {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("Stripe non configurato.");
  }

  const response = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let payload: any = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Stripe HTTP ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}

export async function createStripeCheckoutSession({
  amountCents,
  customerEmail,
  description,
  productName = "Servizio AG SERVIZI",
  successUrl,
  cancelUrl,
  metadata = {},
  invoiceDescription = "",
}: StripeCheckoutSessionConfig): Promise<StripeCheckoutSessionResponse> {
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  body.set("customer_email", customerEmail);
  body.set("line_items[0][price_data][currency]", "eur");
  body.set("line_items[0][price_data][product_data][name]", productName);
  body.set("line_items[0][price_data][product_data][description]", description);
  body.set("line_items[0][price_data][unit_amount]", String(amountCents));
  body.set("line_items[0][quantity]", "1");
  body.set("payment_method_types[0]", "card");
  body.set("invoice_creation[enabled]", "true");
  if (invoiceDescription) {
    body.set("invoice_creation[invoice_data][description]", invoiceDescription);
  }

  for (const [key, value] of Object.entries(metadata)) {
    body.set(`metadata[${key}]`, value);
  }

  const payload = await callStripeApi("/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  return {
    id: String(payload?.id || ""),
    url: String(payload?.url || ""),
  };
}

export async function getStripeCheckoutSession(sessionId: string): Promise<StripeCheckoutSessionDetails> {
  const payload = await callStripeApi(
    `/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=invoice`,
  );
  const invoice = payload?.invoice || {};

  return {
    id: String(payload?.id || ""),
    status: String(payload?.status || ""),
    paymentStatus: String(payload?.payment_status || ""),
    amountTotal: Number(payload?.amount_total || 0),
    currency: String(payload?.currency || "eur"),
    invoiceId: String(invoice?.id || ""),
    invoicePdf: String(invoice?.invoice_pdf || ""),
    hostedInvoiceUrl: String(invoice?.hosted_invoice_url || ""),
  };
}
