import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  createBrtOrmPickup,
  createBrtManifest,
  createBrtShipment,
  getMissingBrtConfig,
  getMissingBrtManifestConfig,
  getMissingBrtOrmConfig,
  routeBrtShipment,
} from "@/lib/brt-shipment";
import {
  getStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-checkout";
import { resolveShippingPrice } from "@/lib/shipping-pricing-engine";
import { notifyClientAreaEvent } from "@/lib/area-client-notifications";

export const runtime = "nodejs";

function hasDatabaseConfig() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD &&
      process.env.MYSQL_DATABASE,
  );
}

async function ensureClientAreaRequestsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      area VARCHAR(40) NOT NULL,
      service_type VARCHAR(120) NOT NULL,
      customer_name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(80) DEFAULT '',
      notes TEXT DEFAULT '',
      details_json JSON NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_requests_area (area),
      KEY idx_client_area_requests_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaShipmentsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_shipments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      tracking_code VARCHAR(64) NOT NULL DEFAULT '',
      parcel_id VARCHAR(64) NOT NULL DEFAULT '',
      shipment_number_from VARCHAR(32) NOT NULL DEFAULT '',
      shipment_number_to VARCHAR(32) NOT NULL DEFAULT '',
      label_pdf_base64 LONGTEXT NULL,
      brt_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_client_area_shipments_tracking (tracking_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaPaymentsTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      shipment_id INT NULL,
      stripe_session_id VARCHAR(191) NOT NULL,
      amount_cents INT NOT NULL DEFAULT 0,
      currency VARCHAR(8) NOT NULL DEFAULT 'eur',
      payment_status VARCHAR(40) NOT NULL DEFAULT '',
      checkout_status VARCHAR(40) NOT NULL DEFAULT '',
      price_label VARCHAR(191) NOT NULL DEFAULT '',
      stripe_response_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_client_area_payments_session (stripe_session_id),
      KEY idx_client_area_payments_request (request_id),
      KEY idx_client_area_payments_shipment (shipment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function ensureClientAreaInvoicesTable() {
  const pool = getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS client_area_invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NULL,
      payment_id INT NULL,
      shipment_id INT NULL,
      provider VARCHAR(80) NOT NULL DEFAULT 'pending',
      provider_document_id VARCHAR(191) NOT NULL DEFAULT '',
      status VARCHAR(60) NOT NULL DEFAULT 'pending_provider_config',
      invoice_pdf_url TEXT NULL,
      billing_json JSON NULL,
      provider_payload_json JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_client_area_invoices_request (request_id),
      KEY idx_client_area_invoices_payment (payment_id),
      KEY idx_client_area_invoices_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function requireString(value: unknown) {
  return String(value || "").trim();
}

function requirePositiveNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getServiceCountryValidationMessage(serviceCode: string, destinationCountry: string) {
  if (serviceCode === "ritiro-nazionale" && destinationCountry !== "IT") {
    return "Per 'Spedizione nazionale' la destinazione deve essere IT.";
  }
  if (serviceCode === "ritiro-internazionale" && destinationCountry === "IT") {
    return "Per 'Spedizione internazionale' la destinazione deve essere diversa da IT.";
  }
  return "";
}

export async function POST(request: Request) {
  const missing = getMissingBrtConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      {
        message: `Configurazione BRT incompleta: ${missing.join(", ")}.`,
      },
      { status: 503 },
    );
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json({ message: "Database non configurato" }, { status: 503 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ message: "Stripe non configurato" }, { status: 503 });
  }

  const body = await request.json();
  const stripeSessionId = requireString(body?.stripeSessionId);
  const payload = {
    customerName: requireString(body?.customerName),
    email: requireString(body?.email).toLowerCase(),
    phone: requireString(body?.phone),
    billingType: requireString(body?.billingType || "privato"),
    billingCompanyName: requireString(body?.billingCompanyName),
    billingVatNumber: requireString(body?.billingVatNumber).toUpperCase(),
    billingTaxCode: requireString(body?.billingTaxCode).toUpperCase(),
    billingRecipientCode: requireString(body?.billingRecipientCode).toUpperCase(),
    billingCertifiedEmail: requireString(body?.billingCertifiedEmail).toLowerCase(),
    billingAddress: requireString(body?.billingAddress),
    billingZIPCode: requireString(body?.billingZIPCode),
    billingCity: requireString(body?.billingCity),
    billingProvince: requireString(body?.billingProvince).toUpperCase(),
    pickupAddress: requireString(body?.pickupAddress),
    pickupZIPCode: requireString(body?.pickupZIPCode),
    pickupCity: requireString(body?.pickupCity),
    pickupProvince: requireString(body?.pickupProvince).toUpperCase(),
    destinationCompanyName: requireString(body?.destinationCompanyName),
    destinationAddress: requireString(body?.destinationAddress),
    destinationZIPCode: requireString(body?.destinationZIPCode),
    destinationCity: requireString(body?.destinationCity),
    destinationProvince: requireString(body?.destinationProvince).toUpperCase(),
    destinationCountry: requireString(body?.destinationCountry || "IT").toUpperCase(),
    pudoId: requireString(body?.pudoId),
    parcelCount: requirePositiveNumber(body?.parcelCount),
    parcelLengthCM: requirePositiveNumber(body?.parcelLengthCM),
    parcelHeightCM: requirePositiveNumber(body?.parcelHeightCM),
    parcelDepthCM: requirePositiveNumber(body?.parcelDepthCM),
    weightKG: requirePositiveNumber(body?.weightKG),
    notes: requireString(body?.notes),
    serviceCode: requireString(body?.serviceCode || "ritiro-nazionale"),
  };

  const volumeCM3 =
    payload.parcelLengthCM * payload.parcelHeightCM * payload.parcelDepthCM * payload.parcelCount;
  const volumeM3 = Number((volumeCM3 / 1_000_000).toFixed(4));
  const volumetricWeightKG = Number((volumeCM3 / 4000).toFixed(2));

  if (
    !stripeSessionId ||
    !payload.customerName ||
    !payload.email.includes("@") ||
    !payload.phone ||
    !payload.pickupAddress ||
    !payload.pickupZIPCode ||
    !payload.pickupCity ||
    !payload.pickupProvince ||
    !payload.destinationCompanyName ||
    !payload.destinationAddress ||
    !payload.destinationZIPCode ||
    !payload.destinationCity ||
    !payload.destinationProvince ||
    !payload.parcelCount ||
    !payload.parcelLengthCM ||
    !payload.parcelHeightCM ||
    !payload.parcelDepthCM ||
    !payload.weightKG
  ) {
    return NextResponse.json(
      { message: "Pagamento o dati spedizione mancanti. Completa prima il checkout Stripe." },
      { status: 400 },
    );
  }

  const serviceCountryError = getServiceCountryValidationMessage(
    payload.serviceCode,
    payload.destinationCountry,
  );
  if (serviceCountryError) {
    return NextResponse.json({ message: serviceCountryError }, { status: 400 });
  }

  try {
    await ensureClientAreaRequestsTable();
    await ensureClientAreaShipmentsTable();
    await ensureClientAreaPaymentsTable();
    await ensureClientAreaInvoicesTable();

    const pool = getPool();
    const taxableWeightKG = Math.max(payload.weightKG, volumetricWeightKG);
    const expectedPrice = await resolveShippingPrice(
      taxableWeightKG,
      volumeM3,
      payload.destinationCountry,
      { strict: true },
    );
    const stripeSession = await getStripeCheckoutSession(stripeSessionId);
    const paymentCompleted =
      stripeSession.status === "complete" && stripeSession.paymentStatus === "paid";

    if (!paymentCompleted) {
      return NextResponse.json(
        { message: "Il pagamento Stripe non risulta completato." },
        { status: 402 },
      );
    }

    if (
      stripeSession.currency.toLowerCase() !== "eur" ||
      stripeSession.amountTotal !== expectedPrice.amountCents
    ) {
      return NextResponse.json(
        {
          message:
            "Il pagamento Stripe non corrisponde all'importo atteso. La spedizione è stata bloccata.",
        },
        { status: 409 },
      );
    }

    const [requestResult] = await pool.execute(
      `INSERT INTO client_area_requests
        (area, service_type, customer_name, email, phone, notes, details_json, status)
       VALUES ('spedizioni', ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        payload.serviceCode,
        payload.customerName,
        payload.email,
        payload.phone,
        payload.notes,
        JSON.stringify({
          pickupAddress: payload.pickupAddress,
          pickupZIPCode: payload.pickupZIPCode,
          pickupCity: payload.pickupCity,
          pickupProvince: payload.pickupProvince,
          destinationCompanyName: payload.destinationCompanyName,
          destinationAddress: payload.destinationAddress,
          destinationZIPCode: payload.destinationZIPCode,
          destinationCity: payload.destinationCity,
          destinationProvince: payload.destinationProvince,
          destinationCountry: payload.destinationCountry,
          pudoId: payload.pudoId,
          parcelCount: payload.parcelCount,
          parcelLengthCM: payload.parcelLengthCM,
          parcelHeightCM: payload.parcelHeightCM,
          parcelDepthCM: payload.parcelDepthCM,
          volumeM3,
          volumetricWeightKG,
          weightKG: payload.weightKG,
          billingType: payload.billingType,
          billingCompanyName: payload.billingCompanyName,
          billingVatNumber: payload.billingVatNumber,
          billingTaxCode: payload.billingTaxCode,
          billingRecipientCode: payload.billingRecipientCode,
          billingCertifiedEmail: payload.billingCertifiedEmail,
          billingAddress: payload.billingAddress,
          billingZIPCode: payload.billingZIPCode,
          billingCity: payload.billingCity,
          billingProvince: payload.billingProvince,
        }),
      ],
    );

    const requestId = Number((requestResult as any)?.insertId || 0);
    const [paymentResult] = await pool.execute(
      `INSERT INTO client_area_payments
        (request_id, stripe_session_id, amount_cents, currency, payment_status, checkout_status, price_label, stripe_response_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        request_id = VALUES(request_id),
        amount_cents = VALUES(amount_cents),
        currency = VALUES(currency),
        payment_status = VALUES(payment_status),
        checkout_status = VALUES(checkout_status),
        price_label = VALUES(price_label),
        stripe_response_json = VALUES(stripe_response_json),
        updated_at = CURRENT_TIMESTAMP`,
      [
        requestId || null,
        stripeSession.id,
        stripeSession.amountTotal,
        stripeSession.currency,
        stripeSession.paymentStatus,
        stripeSession.status,
        expectedPrice.label,
        JSON.stringify(stripeSession),
      ],
    );
    const paymentId = Number((paymentResult as any)?.insertId || 0);
    const routing = await routeBrtShipment({
      destinationCompanyName: payload.destinationCompanyName,
      destinationAddress: payload.destinationAddress,
      destinationZIPCode: payload.destinationZIPCode,
      destinationCity: payload.destinationCity,
      destinationProvince: payload.destinationProvince,
      destinationCountry: payload.destinationCountry,
      pudoId: payload.pudoId,
      parcelCount: payload.parcelCount,
      volumeM3,
      weightKG: payload.weightKG,
      serviceCode: payload.serviceCode,
    });
    const result = await createBrtShipment({
      ...payload,
      volumeM3,
      volumetricWeightKG,
    });

    const ormReady = getMissingBrtOrmConfig().length === 0;
    let ormCreated = false;
    let ormMessage = "";
    let ormPayload: unknown = null;
    let ormCollectionDate = "";
    let ormCollectionTime = "";

    if (ormReady) {
      try {
        const orm = await createBrtOrmPickup({
          customerName: payload.customerName,
          phone: payload.phone,
          pickupAddress: payload.pickupAddress,
          pickupZIPCode: payload.pickupZIPCode,
          pickupCity: payload.pickupCity,
          pickupProvince: payload.pickupProvince,
          destinationCompanyName: payload.destinationCompanyName,
          destinationAddress: payload.destinationAddress,
          destinationZIPCode: payload.destinationZIPCode,
          destinationCity: payload.destinationCity,
          destinationProvince: payload.destinationProvince,
          destinationCountry: payload.destinationCountry,
          parcelCount: payload.parcelCount,
          weightKG: payload.weightKG,
          notes: payload.notes,
        });
        ormCreated = Boolean(orm.created);
        ormMessage = orm.message;
        ormPayload = orm.payload;
        ormCollectionDate = orm.collectionDate;
        ormCollectionTime = orm.collectionTime;
      } catch (error) {
        ormCreated = false;
        ormMessage =
          error instanceof Error
            ? error.message
            : "Spedizione creata, ma il ritiro automatico ORM non e stato prenotato.";
      }
    } else {
      ormMessage = "Ritiro automatico ORM non configurato.";
    }

    const [shipmentResult] = await pool.execute(
      `INSERT INTO client_area_shipments
        (request_id, tracking_code, parcel_id, shipment_number_from, shipment_number_to, label_pdf_base64, brt_response_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId || null,
        result.trackingCode,
        result.parcelId,
        result.shipmentNumberFrom,
        result.shipmentNumberTo,
        result.labelPdfBase64 || null,
        JSON.stringify(result),
      ],
    );
    const shipmentId = Number((shipmentResult as any)?.insertId || 0);

    const manifestReady = getMissingBrtManifestConfig().length === 0;
    let manifestCreated = false;
    let manifestMessage = "";
    let manifestPayload: unknown = null;

    if (
      manifestReady &&
      result.numericSenderReference > 0 &&
      result.alphanumericSenderReference
    ) {
      try {
        const manifest = await createBrtManifest({
          numericSenderReference: result.numericSenderReference,
          alphanumericSenderReference: result.alphanumericSenderReference,
        });
        manifestCreated = Boolean(manifest.created);
        manifestMessage = manifest.message;
        manifestPayload = manifest.payload;
      } catch (error) {
        manifestCreated = false;
        manifestMessage =
          error instanceof Error
            ? error.message
            : "Spedizione creata, ma il manifest non è stato generato.";
      }
    } else {
      manifestMessage = manifestReady
        ? "Manifest non generato: riferimenti BRT non completi."
        : "Manifest non configurato automaticamente.";
    }

    await pool.execute(
      `UPDATE client_area_shipments
       SET brt_response_json = ?
       WHERE id = ?`,
      [
        JSON.stringify({
          shipment: result,
          routing,
          orm: {
            created: ormCreated,
            message: ormMessage,
            collectionDate: ormCollectionDate,
            collectionTime: ormCollectionTime,
            payload: ormPayload,
          },
          manifest: {
            created: manifestCreated,
            message: manifestMessage,
            payload: manifestPayload,
          },
        }),
        shipmentId || null,
      ],
    );

    await pool.execute(
      `UPDATE client_area_payments
       SET shipment_id = ?, stripe_response_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE stripe_session_id = ?`,
      [shipmentId || (paymentId || null), JSON.stringify(stripeSession), stripeSession.id],
    );

    const invoiceProvider = process.env.INVOICE_PROVIDER || "pending";
    const invoiceStatus =
      invoiceProvider === "acube_stripe"
        ? "managed_in_stripe_acube"
        : invoiceProvider
          ? "pending_provider_issue"
          : "pending_provider_config";

    await pool.execute(
      `INSERT INTO client_area_invoices
        (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId || null,
        paymentId || null,
        shipmentId || null,
        invoiceProvider,
        stripeSession.invoiceId || "",
        invoiceStatus,
        stripeSession.invoicePdf || stripeSession.hostedInvoiceUrl || null,
        JSON.stringify({
          billingType: payload.billingType,
          billingCompanyName: payload.billingCompanyName,
          billingVatNumber: payload.billingVatNumber,
          billingTaxCode: payload.billingTaxCode,
          billingRecipientCode: payload.billingRecipientCode,
          billingCertifiedEmail: payload.billingCertifiedEmail,
          billingAddress: payload.billingAddress,
          billingZIPCode: payload.billingZIPCode,
          billingCity: payload.billingCity,
          billingProvince: payload.billingProvince,
          customerName: payload.customerName,
          email: payload.email,
        }),
        JSON.stringify({
          stripeSession,
          providerReady: Boolean(invoiceProvider && invoiceProvider !== "pending"),
          nextStep:
            invoiceProvider === "acube_stripe"
              ? "La gestione fiscale prosegue nell'app A-Cube dentro Stripe"
              : invoiceProvider
                ? "Invio al provider fiscale da implementare"
                : "Configura il provider fiscale italiano",
        }),
      ],
    );

    if (requestId) {
      await pool.execute(
        `UPDATE client_area_requests
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [result.confirmed ? "confirmed_by_brt" : "submitted_to_brt", requestId],
      );
    }

    void notifyClientAreaEvent({
      area: "spedizioni",
      title: "Spedizione BRT creata",
      customerName: payload.customerName,
      customerEmail: payload.email,
      customerPhone: payload.phone,
      details: {
        tracking: result.trackingCode,
        parcelId: result.parcelId,
        stato: result.confirmed ? "confirmed_by_brt" : "submitted_to_brt",
        importo: `${(stripeSession.amountTotal / 100).toFixed(2)} ${String(stripeSession.currency || "eur").toUpperCase()}`,
      },
    });

    return NextResponse.json(
      {
        message: manifestCreated
          ? ormCreated
            ? "Spedizione BRT creata, ritiro automatico prenotato e manifest driver generato."
            : "Spedizione BRT creata e manifest driver generato."
          : ormCreated
            ? "Spedizione BRT creata e ritiro automatico prenotato."
            : "Spedizione BRT creata correttamente.",
        trackingCode: result.trackingCode,
        parcelId: result.parcelId,
        shipmentNumberFrom: result.shipmentNumberFrom,
        shipmentNumberTo: result.shipmentNumberTo,
        labelPdfBase64: result.labelPdfBase64,
        volumetricWeightKG,
        volumeM3,
        routing,
        payment: {
          amountCents: stripeSession.amountTotal,
          currency: stripeSession.currency,
          sessionId: stripeSession.id,
          priceLabel: expectedPrice.label,
          invoicePdf: stripeSession.invoicePdf,
          hostedInvoiceUrl: stripeSession.hostedInvoiceUrl,
        },
        orm: {
          created: ormCreated,
          message: ormMessage,
          collectionDate: ormCollectionDate,
          collectionTime: ormCollectionTime,
          payload: ormPayload,
        },
        manifest: {
          created: manifestCreated,
          message: manifestMessage,
          payload: manifestPayload,
        },
        numericSenderReference: result.numericSenderReference,
        alphanumericSenderReference: result.alphanumericSenderReference,
        confirmed: result.confirmed,
        confirmMessage: result.confirmMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante la creazione della spedizione BRT.";
    const isShippingLimitExceeded =
      message.includes("non consente spedizioni con peso/volume") ||
      message.includes("non consente spedizioni con peso superiore");
    return NextResponse.json(
      {
        message,
        errorCode: isShippingLimitExceeded ? "SHIPPING_LIMIT_EXCEEDED" : undefined,
      },
      { status: isShippingLimitExceeded ? 409 : 502 },
    );
  }
}
