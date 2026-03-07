<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

$body = client_area_parse_json_body();
$action = trim((string) ($body['action'] ?? 'request'));

if ($action === 'catalog') {
    try {
        $catalog = client_area_get_openapi_catalog();
        client_area_json($catalog, 200);
    } catch (Throwable $error) {
        client_area_json([
            'sandbox' => false,
            'services' => [],
            'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Catalogo OpenAPI visure non disponibile.',
        ], 502);
    }
}

$serviceType = trim((string) ($body['serviceType'] ?? ''));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$notes = trim((string) ($body['notes'] ?? ''));
$stripeSessionId = trim((string) ($body['stripeSessionId'] ?? ''));
$resolvedServiceHash = trim((string) ($body['resolvedServiceHash'] ?? ''));
$resolvedServiceLabel = trim((string) ($body['resolvedServiceLabel'] ?? ''));
$formData = is_array($body['formData'] ?? null) ? $body['formData'] : [];

if ($serviceType === '' || $customerName === '' || !str_contains($email, '@')) {
    client_area_json(['message' => 'Compila almeno nome, email e tipologia di visura.'], 400);
}

if (!in_array($serviceType, client_area_supported_visura_services(), true)) {
    client_area_json(['message' => 'Tipologia visura non valida.'], 400);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

if ($stripeSessionId === '') {
    client_area_json(['message' => 'Pagamento non trovato. Completa prima il checkout Stripe.'], 400);
}

try {
    $price = client_area_resolve_visura_price($serviceType);
    $stripeSession = client_area_get_stripe_checkout_session($stripeSessionId);
    $paymentCompleted = ($stripeSession['status'] ?? '') === 'complete' && ($stripeSession['paymentStatus'] ?? '') === 'paid';

    if (!$paymentCompleted) {
        client_area_json(['message' => 'Il pagamento Stripe non risulta completato.'], 402);
    }

    if (strtolower((string) ($stripeSession['currency'] ?? 'eur')) !== 'eur' || (int) ($stripeSession['amountTotal'] ?? 0) !== (int) ($price['amountCents'] ?? 0)) {
        client_area_json([
            'message' => 'Il pagamento Stripe non corrisponde all\'importo atteso. La richiesta è stata bloccata.',
        ], 409);
    }

    $providerResult = client_area_create_openapi_visura_request([
        'serviceType' => $serviceType,
        'customerName' => $customerName,
        'email' => $email,
        'phone' => $phone,
        'notes' => $notes,
        'formData' => $formData,
        'resolvedServiceHash' => $resolvedServiceHash,
        'resolvedServiceLabel' => $resolvedServiceLabel,
    ]);

    $requestId = 0;
    $paymentId = 0;

    if (client_area_has_database_config()) {
        client_area_ensure_client_area_requests_table();
        client_area_ensure_client_area_visure_requests_table();
        client_area_ensure_client_area_payments_table();
        client_area_ensure_client_area_invoices_table();

        $db = client_area_require_db();
        $requestStatus = (($providerResult['status'] ?? '') === 'completed') ? 'completed' : 'processing';
        $details = [
            'provider' => (string) ($providerResult['provider'] ?? ''),
            'providerService' => (string) ($providerResult['providerService'] ?? ''),
            'providerRequestId' => (string) ($providerResult['providerRequestId'] ?? ''),
            'providerStatus' => (string) ($providerResult['status'] ?? ''),
            'providerSummary' => is_array($providerResult['summary'] ?? null) ? $providerResult['summary'] : [],
            'formData' => $formData,
        ];

        $requestStmt = $db->prepare(
            'INSERT INTO client_area_requests
              (area, service_type, customer_name, email, phone, notes, details_json, status)
             VALUES (\'visure\', ?, ?, ?, ?, ?, ?, ?)'
        );

        if (!$requestStmt) {
            throw new RuntimeException('Impossibile salvare richiesta visura.');
        }

        $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $requestStmt->bind_param(
            'sssssss',
            $serviceType,
            $customerName,
            $email,
            $phone,
            $notes,
            $detailsJson,
            $requestStatus
        );
        $requestStmt->execute();
        $requestId = (int) $requestStmt->insert_id;
        $requestStmt->close();

        $paymentStmt = $db->prepare(
            'INSERT INTO client_area_payments
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
              updated_at = CURRENT_TIMESTAMP'
        );

        if (!$paymentStmt) {
            throw new RuntimeException('Impossibile salvare pagamento visura.');
        }

        $requestIdForPayment = $requestId > 0 ? $requestId : null;
        $stripePayloadJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $amountTotal = (int) ($stripeSession['amountTotal'] ?? 0);
        $currency = (string) ($stripeSession['currency'] ?? 'eur');
        $paymentStatus = (string) ($stripeSession['paymentStatus'] ?? '');
        $checkoutStatus = (string) ($stripeSession['status'] ?? '');
        $priceLabel = (string) ($price['label'] ?? 'Visura');
        $sessionId = (string) ($stripeSession['id'] ?? '');

        $paymentStmt->bind_param(
            'isisssss',
            $requestIdForPayment,
            $sessionId,
            $amountTotal,
            $currency,
            $paymentStatus,
            $checkoutStatus,
            $priceLabel,
            $stripePayloadJson
        );
        $paymentStmt->execute();
        $paymentId = (int) $paymentStmt->insert_id;
        $paymentStmt->close();

        $visuraStmt = $db->prepare(
            'INSERT INTO client_area_visure_requests
              (request_id, provider, provider_service, provider_request_id, provider_status, document_url, provider_response_json)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        if (!$visuraStmt) {
            throw new RuntimeException('Impossibile salvare risposta provider visura.');
        }

        $provider = (string) ($providerResult['provider'] ?? '');
        $providerService = (string) ($providerResult['providerService'] ?? '');
        $providerRequestId = (string) ($providerResult['providerRequestId'] ?? '');
        $providerStatus = (string) ($providerResult['status'] ?? 'processing');
        $documentUrl = (string) ($providerResult['documentUrl'] ?? '');
        $documentUrlValue = $documentUrl !== '' ? $documentUrl : null;
        $providerResponseJson = json_encode($providerResult['raw'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $requestIdForVisura = $requestId > 0 ? $requestId : null;

        $visuraStmt->bind_param(
            'issssss',
            $requestIdForVisura,
            $provider,
            $providerService,
            $providerRequestId,
            $providerStatus,
            $documentUrlValue,
            $providerResponseJson
        );
        $visuraStmt->execute();
        $visuraStmt->close();

        $invoiceProvider = trim((string) (public_api_env('INVOICE_PROVIDER', 'pending') ?: 'pending'));
        $invoiceStatus = $invoiceProvider === 'acube_stripe'
            ? 'managed_in_stripe_acube'
            : ($invoiceProvider !== '' ? 'pending_provider_issue' : 'pending_provider_config');

        $invoiceStmt = $db->prepare(
            'INSERT INTO client_area_invoices
              (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
             VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)'
        );

        if ($invoiceStmt) {
            $requestIdForInvoice = $requestId > 0 ? $requestId : null;
            $paymentIdForInvoice = $paymentId > 0 ? $paymentId : null;
            $providerDocumentId = (string) ($stripeSession['invoiceId'] ?? '');
            $invoicePdfUrl = (string) ($stripeSession['invoicePdf'] ?? '');
            if ($invoicePdfUrl === '') {
                $invoicePdfUrl = (string) ($stripeSession['hostedInvoiceUrl'] ?? '');
            }
            $invoicePdfUrlValue = $invoicePdfUrl !== '' ? $invoicePdfUrl : null;
            $billingJson = json_encode([
                'customerName' => $customerName,
                'email' => $email,
                'phone' => $phone,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $providerPayloadJson = json_encode([
                'stripeSession' => $stripeSession,
                'visuraService' => $serviceType,
                'nextStep' => $invoiceProvider === 'acube_stripe'
                    ? 'La gestione fiscale prosegue nell\'app A-Cube dentro Stripe'
                    : 'Documento fiscale in attesa di gestione',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $invoiceStmt->bind_param(
                'iissssss',
                $requestIdForInvoice,
                $paymentIdForInvoice,
                $invoiceProvider,
                $providerDocumentId,
                $invoiceStatus,
                $invoicePdfUrlValue,
                $billingJson,
                $providerPayloadJson
            );
            $invoiceStmt->execute();
            $invoiceStmt->close();
        }
    }

    client_area_notify_event(
        'visure',
        'Nuova visura creata',
        $customerName,
        $email,
        $phone,
        [
            'servizio' => $serviceType,
            'provider' => (string) ($providerResult['provider'] ?? ''),
            'providerRequestId' => (string) ($providerResult['providerRequestId'] ?? ''),
            'statoProvider' => (string) ($providerResult['status'] ?? ''),
            'importo' => number_format(((int) ($stripeSession['amountTotal'] ?? 0)) / 100, 2, '.', '') . ' ' . strtoupper((string) ($stripeSession['currency'] ?? 'eur')),
        ]
    );

    client_area_json([
        'message' => (string) ($providerResult['message'] ?? 'Richiesta visura creata.'),
        'requestId' => $requestId,
        'provider' => (string) ($providerResult['provider'] ?? ''),
        'providerService' => (string) ($providerResult['providerService'] ?? ''),
        'providerStatus' => (string) ($providerResult['status'] ?? ''),
        'providerRequestId' => (string) ($providerResult['providerRequestId'] ?? ''),
        'documentUrl' => (string) ($providerResult['documentUrl'] ?? ''),
        'documentBase64' => (string) ($providerResult['documentBase64'] ?? ''),
        'summary' => is_array($providerResult['summary'] ?? null) ? $providerResult['summary'] : [],
        'payment' => [
            'amountCents' => (int) ($stripeSession['amountTotal'] ?? 0),
            'currency' => (string) ($stripeSession['currency'] ?? 'eur'),
            'sessionId' => (string) ($stripeSession['id'] ?? ''),
            'priceLabel' => (string) ($price['label'] ?? 'Visura'),
            'invoicePdf' => (string) ($stripeSession['invoicePdf'] ?? ''),
            'hostedInvoiceUrl' => (string) ($stripeSession['hostedInvoiceUrl'] ?? ''),
        ],
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Richiesta visura OpenAPI non riuscita.',
    ], 502);
}
