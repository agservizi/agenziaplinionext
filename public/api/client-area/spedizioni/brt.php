<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

$missing = client_area_get_missing_brt_config();
if ($missing !== []) {
    client_area_json(['message' => 'Configurazione BRT incompleta: ' . implode(', ', $missing) . '.'], 503);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato'], 503);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato'], 503);
}

$body = client_area_parse_json_body();
$stripeSessionId = client_area_require_string($body['stripeSessionId'] ?? '');

$payload = [
    'customerName' => client_area_require_string($body['customerName'] ?? ''),
    'email' => strtolower(client_area_require_string($body['email'] ?? '')),
    'phone' => client_area_require_string($body['phone'] ?? ''),
    'billingType' => client_area_require_string($body['billingType'] ?? 'privato'),
    'billingCompanyName' => client_area_require_string($body['billingCompanyName'] ?? ''),
    'billingVatNumber' => strtoupper(client_area_require_string($body['billingVatNumber'] ?? '')),
    'billingTaxCode' => strtoupper(client_area_require_string($body['billingTaxCode'] ?? '')),
    'billingRecipientCode' => strtoupper(client_area_require_string($body['billingRecipientCode'] ?? '')),
    'billingCertifiedEmail' => strtolower(client_area_require_string($body['billingCertifiedEmail'] ?? '')),
    'billingAddress' => client_area_require_string($body['billingAddress'] ?? ''),
    'billingZIPCode' => client_area_require_string($body['billingZIPCode'] ?? ''),
    'billingCity' => client_area_require_string($body['billingCity'] ?? ''),
    'billingProvince' => strtoupper(client_area_require_string($body['billingProvince'] ?? '')),
    'pickupAddress' => client_area_require_string($body['pickupAddress'] ?? ''),
    'pickupZIPCode' => client_area_require_string($body['pickupZIPCode'] ?? ''),
    'pickupCity' => client_area_require_string($body['pickupCity'] ?? ''),
    'pickupProvince' => strtoupper(client_area_require_string($body['pickupProvince'] ?? '')),
    'destinationCompanyName' => client_area_require_string($body['destinationCompanyName'] ?? ''),
    'destinationAddress' => client_area_require_string($body['destinationAddress'] ?? ''),
    'destinationZIPCode' => client_area_require_string($body['destinationZIPCode'] ?? ''),
    'destinationCity' => client_area_require_string($body['destinationCity'] ?? ''),
    'destinationProvince' => strtoupper(client_area_require_string($body['destinationProvince'] ?? '')),
    'destinationCountry' => strtoupper(client_area_require_string($body['destinationCountry'] ?? 'IT')),
    'pudoId' => client_area_require_string($body['pudoId'] ?? ''),
    'parcelCount' => client_area_require_positive_number($body['parcelCount'] ?? 0),
    'parcelLengthCM' => client_area_require_positive_number($body['parcelLengthCM'] ?? 0),
    'parcelHeightCM' => client_area_require_positive_number($body['parcelHeightCM'] ?? 0),
    'parcelDepthCM' => client_area_require_positive_number($body['parcelDepthCM'] ?? 0),
    'weightKG' => client_area_require_positive_number($body['weightKG'] ?? 0),
    'notes' => client_area_require_string($body['notes'] ?? ''),
    'serviceCode' => client_area_require_string($body['serviceCode'] ?? 'ritiro-nazionale'),
];

$volumeCM3 = $payload['parcelLengthCM'] * $payload['parcelHeightCM'] * $payload['parcelDepthCM'] * $payload['parcelCount'];
$volumeM3 = round($volumeCM3 / 1000000, 4);
$volumetricWeightKG = round($volumeCM3 / 4000, 2);

if (
    $stripeSessionId === '' ||
    $payload['customerName'] === '' ||
    !str_contains($payload['email'], '@') ||
    $payload['phone'] === '' ||
    $payload['pickupAddress'] === '' ||
    $payload['pickupZIPCode'] === '' ||
    $payload['pickupCity'] === '' ||
    $payload['pickupProvince'] === '' ||
    $payload['destinationCompanyName'] === '' ||
    $payload['destinationAddress'] === '' ||
    $payload['destinationZIPCode'] === '' ||
    $payload['destinationCity'] === '' ||
    $payload['destinationProvince'] === '' ||
    $payload['parcelCount'] <= 0 ||
    $payload['parcelLengthCM'] <= 0 ||
    $payload['parcelHeightCM'] <= 0 ||
    $payload['parcelDepthCM'] <= 0 ||
    $payload['weightKG'] <= 0
) {
    client_area_json(['message' => 'Pagamento o dati spedizione mancanti. Completa prima il checkout Stripe.'], 400);
}

$countryValidationError = client_area_validate_shipping_service_country($payload['serviceCode'], $payload['destinationCountry']);
if ($countryValidationError !== null) {
    client_area_json(['message' => $countryValidationError], 400);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_shipments_table();
    client_area_ensure_client_area_payments_table();
    client_area_ensure_client_area_invoices_table();

    $db = client_area_require_db();
    $taxableWeightKG = max($payload['weightKG'], $volumetricWeightKG);
    $expectedPrice = client_area_resolve_shipping_price($taxableWeightKG, $volumeM3, $payload['destinationCountry'], true);
    $stripeSession = client_area_get_stripe_checkout_session($stripeSessionId);
    $paymentCompleted = (($stripeSession['status'] ?? '') === 'complete') && (($stripeSession['paymentStatus'] ?? '') === 'paid');
    if (!$paymentCompleted) {
        client_area_json(['message' => 'Il pagamento Stripe non risulta completato.'], 402);
    }

    if (strtolower((string) ($stripeSession['currency'] ?? 'eur')) !== 'eur' || (int) ($stripeSession['amountTotal'] ?? 0) !== (int) ($expectedPrice['amountCents'] ?? 0)) {
        client_area_json(['message' => 'Il pagamento Stripe non corrisponde all\'importo atteso. La spedizione è stata bloccata.'], 409);
    }

    $requestStmt = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (\'spedizioni\', ?, ?, ?, ?, ?, ?, \"processing\")'
    );
    if (!$requestStmt) {
        throw new RuntimeException('Impossibile registrare la richiesta spedizione.');
    }

    $detailsJson = json_encode([
        'pickupAddress' => $payload['pickupAddress'],
        'pickupZIPCode' => $payload['pickupZIPCode'],
        'pickupCity' => $payload['pickupCity'],
        'pickupProvince' => $payload['pickupProvince'],
        'destinationCompanyName' => $payload['destinationCompanyName'],
        'destinationAddress' => $payload['destinationAddress'],
        'destinationZIPCode' => $payload['destinationZIPCode'],
        'destinationCity' => $payload['destinationCity'],
        'destinationProvince' => $payload['destinationProvince'],
        'destinationCountry' => $payload['destinationCountry'],
        'pudoId' => $payload['pudoId'],
        'parcelCount' => $payload['parcelCount'],
        'parcelLengthCM' => $payload['parcelLengthCM'],
        'parcelHeightCM' => $payload['parcelHeightCM'],
        'parcelDepthCM' => $payload['parcelDepthCM'],
        'volumeM3' => $volumeM3,
        'volumetricWeightKG' => $volumetricWeightKG,
        'weightKG' => $payload['weightKG'],
        'billingType' => $payload['billingType'],
        'billingCompanyName' => $payload['billingCompanyName'],
        'billingVatNumber' => $payload['billingVatNumber'],
        'billingTaxCode' => $payload['billingTaxCode'],
        'billingRecipientCode' => $payload['billingRecipientCode'],
        'billingCertifiedEmail' => $payload['billingCertifiedEmail'],
        'billingAddress' => $payload['billingAddress'],
        'billingZIPCode' => $payload['billingZIPCode'],
        'billingCity' => $payload['billingCity'],
        'billingProvince' => $payload['billingProvince'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $requestStmt->bind_param('ssssss', $payload['serviceCode'], $payload['customerName'], $payload['email'], $payload['phone'], $payload['notes'], $detailsJson);
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
    $paymentId = 0;
    if ($paymentStmt) {
        $sessionId = (string) ($stripeSession['id'] ?? '');
        $amountTotal = (int) ($stripeSession['amountTotal'] ?? 0);
        $currency = (string) ($stripeSession['currency'] ?? 'eur');
        $paymentStatus = (string) ($stripeSession['paymentStatus'] ?? '');
        $checkoutStatus = (string) ($stripeSession['status'] ?? '');
        $priceLabel = (string) ($expectedPrice['label'] ?? '');
        $stripeJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $paymentStmt->bind_param('isisssss', $requestId, $sessionId, $amountTotal, $currency, $paymentStatus, $checkoutStatus, $priceLabel, $stripeJson);
        $paymentStmt->execute();
        $paymentId = (int) $paymentStmt->insert_id;
        $paymentStmt->close();
    }

    $routing = client_area_brt_route_shipment([
        'destinationCompanyName' => $payload['destinationCompanyName'],
        'destinationAddress' => $payload['destinationAddress'],
        'destinationZIPCode' => $payload['destinationZIPCode'],
        'destinationCity' => $payload['destinationCity'],
        'destinationProvince' => $payload['destinationProvince'],
        'destinationCountry' => $payload['destinationCountry'],
        'pudoId' => $payload['pudoId'],
        'parcelCount' => (int) $payload['parcelCount'],
        'volumeM3' => $volumeM3,
        'weightKG' => $payload['weightKG'],
        'serviceCode' => $payload['serviceCode'],
    ]);

    $shipment = client_area_brt_create_shipment([
        ...$payload,
        'volumeM3' => $volumeM3,
        'volumetricWeightKG' => $volumetricWeightKG,
    ]);

    $ormCreated = false;
    $ormMessage = '';
    $ormPayload = null;
    $ormCollectionDate = '';
    $ormCollectionTime = '';

    $ormMissing = client_area_get_missing_brt_orm_config();
    if ($ormMissing === []) {
        try {
            $orm = client_area_brt_create_orm_pickup([
                'customerName' => $payload['customerName'],
                'phone' => $payload['phone'],
                'pickupAddress' => $payload['pickupAddress'],
                'pickupZIPCode' => $payload['pickupZIPCode'],
                'pickupCity' => $payload['pickupCity'],
                'pickupProvince' => $payload['pickupProvince'],
                'destinationCompanyName' => $payload['destinationCompanyName'],
                'destinationAddress' => $payload['destinationAddress'],
                'destinationZIPCode' => $payload['destinationZIPCode'],
                'destinationCity' => $payload['destinationCity'],
                'destinationProvince' => $payload['destinationProvince'],
                'destinationCountry' => $payload['destinationCountry'],
                'parcelCount' => (int) $payload['parcelCount'],
                'weightKG' => $payload['weightKG'],
                'notes' => $payload['notes'],
            ]);
            $ormCreated = (bool) ($orm['created'] ?? false);
            $ormMessage = (string) ($orm['message'] ?? '');
            $ormPayload = $orm['payload'] ?? null;
            $ormCollectionDate = (string) ($orm['collectionDate'] ?? '');
            $ormCollectionTime = (string) ($orm['collectionTime'] ?? '');
        } catch (Throwable $ormError) {
            $ormCreated = false;
            $ormMessage = trim($ormError->getMessage()) !== '' ? $ormError->getMessage() : 'Spedizione creata, ma il ritiro automatico ORM non è stato prenotato.';
        }
    } else {
        $ormMessage = 'Ritiro automatico ORM non configurato.';
    }

    $shipmentStmt = $db->prepare(
        'INSERT INTO client_area_shipments
          (request_id, tracking_code, parcel_id, shipment_number_from, shipment_number_to, label_pdf_base64, brt_response_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    $shipmentId = 0;
    if ($shipmentStmt) {
        $trackingCode = (string) ($shipment['trackingCode'] ?? '');
        $parcelId = (string) ($shipment['parcelId'] ?? '');
        $shipmentNumberFrom = (string) ($shipment['shipmentNumberFrom'] ?? '');
        $shipmentNumberTo = (string) ($shipment['shipmentNumberTo'] ?? '');
        $labelPdf = (string) ($shipment['labelPdfBase64'] ?? '');
        $labelPdfValue = $labelPdf !== '' ? $labelPdf : null;
        $shipmentJson = json_encode($shipment, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $shipmentStmt->bind_param('issssss', $requestId, $trackingCode, $parcelId, $shipmentNumberFrom, $shipmentNumberTo, $labelPdfValue, $shipmentJson);
        $shipmentStmt->execute();
        $shipmentId = (int) $shipmentStmt->insert_id;
        $shipmentStmt->close();
    }

    $manifestCreated = false;
    $manifestMessage = '';
    $manifestPayload = null;

    $manifestMissing = client_area_get_missing_brt_manifest_config();
    if ($manifestMissing === [] && (int) ($shipment['numericSenderReference'] ?? 0) > 0 && client_area_require_string($shipment['alphanumericSenderReference'] ?? '') !== '') {
        try {
            $manifest = client_area_brt_create_manifest((int) $shipment['numericSenderReference'], (string) $shipment['alphanumericSenderReference']);
            $manifestCreated = (bool) ($manifest['created'] ?? false);
            $manifestMessage = (string) ($manifest['message'] ?? '');
            $manifestPayload = $manifest['payload'] ?? null;
        } catch (Throwable $manifestError) {
            $manifestCreated = false;
            $manifestMessage = trim($manifestError->getMessage()) !== '' ? $manifestError->getMessage() : 'Spedizione creata, ma il manifest non è stato generato.';
        }
    } else {
        $manifestMessage = $manifestMissing === [] ? 'Manifest non generato: riferimenti BRT non completi.' : 'Manifest non configurato automaticamente.';
    }

    if ($shipmentId > 0) {
        $updateShipmentStmt = $db->prepare('UPDATE client_area_shipments SET brt_response_json = ? WHERE id = ?');
        if ($updateShipmentStmt) {
            $fullShipmentJson = json_encode([
                'shipment' => $shipment,
                'routing' => $routing,
                'orm' => [
                    'created' => $ormCreated,
                    'message' => $ormMessage,
                    'collectionDate' => $ormCollectionDate,
                    'collectionTime' => $ormCollectionTime,
                    'payload' => $ormPayload,
                ],
                'manifest' => [
                    'created' => $manifestCreated,
                    'message' => $manifestMessage,
                    'payload' => $manifestPayload,
                ],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $updateShipmentStmt->bind_param('si', $fullShipmentJson, $shipmentId);
            $updateShipmentStmt->execute();
            $updateShipmentStmt->close();
        }

        $updatePaymentStmt = $db->prepare('UPDATE client_area_payments SET shipment_id = ?, stripe_response_json = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_session_id = ?');
        if ($updatePaymentStmt) {
            $stripeJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $sessionId = (string) ($stripeSession['id'] ?? '');
            $updatePaymentStmt->bind_param('iss', $shipmentId, $stripeJson, $sessionId);
            $updatePaymentStmt->execute();
            $updatePaymentStmt->close();
        }
    }

    $invoiceProvider = trim((string) (public_api_env('INVOICE_PROVIDER', 'pending') ?: 'pending'));
    $invoiceStatus = $invoiceProvider === 'acube_stripe'
        ? 'managed_in_stripe_acube'
        : ($invoiceProvider !== '' ? 'pending_provider_issue' : 'pending_provider_config');

    $invoiceStmt = $db->prepare(
        'INSERT INTO client_area_invoices
          (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    if ($invoiceStmt) {
        $providerDocumentId = (string) ($stripeSession['invoiceId'] ?? '');
        $invoicePdf = (string) ($stripeSession['invoicePdf'] ?? '');
        if ($invoicePdf === '') {
            $invoicePdf = (string) ($stripeSession['hostedInvoiceUrl'] ?? '');
        }
        $invoicePdfValue = $invoicePdf !== '' ? $invoicePdf : null;
        $billingJson = json_encode([
            'billingType' => $payload['billingType'],
            'billingCompanyName' => $payload['billingCompanyName'],
            'billingVatNumber' => $payload['billingVatNumber'],
            'billingTaxCode' => $payload['billingTaxCode'],
            'billingRecipientCode' => $payload['billingRecipientCode'],
            'billingCertifiedEmail' => $payload['billingCertifiedEmail'],
            'billingAddress' => $payload['billingAddress'],
            'billingZIPCode' => $payload['billingZIPCode'],
            'billingCity' => $payload['billingCity'],
            'billingProvince' => $payload['billingProvince'],
            'customerName' => $payload['customerName'],
            'email' => $payload['email'],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $providerPayloadJson = json_encode([
            'stripeSession' => $stripeSession,
            'providerReady' => (bool) ($invoiceProvider !== '' && $invoiceProvider !== 'pending'),
            'nextStep' => $invoiceProvider === 'acube_stripe'
                ? 'La gestione fiscale prosegue nell\'app A-Cube dentro Stripe'
                : ($invoiceProvider !== '' ? 'Invio al provider fiscale da implementare' : 'Configura il provider fiscale italiano'),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $invoiceStmt->bind_param('iiissssss', $requestId, $paymentId, $shipmentId, $invoiceProvider, $providerDocumentId, $invoiceStatus, $invoicePdfValue, $billingJson, $providerPayloadJson);
        $invoiceStmt->execute();
        $invoiceStmt->close();
    }

    if ($requestId > 0) {
        $requestStatus = !empty($shipment['confirmed']) ? 'confirmed_by_brt' : 'submitted_to_brt';
        $updateRequestStmt = $db->prepare('UPDATE client_area_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        if ($updateRequestStmt) {
            $updateRequestStmt->bind_param('si', $requestStatus, $requestId);
            $updateRequestStmt->execute();
            $updateRequestStmt->close();
        }
    }

    client_area_notify_event(
        'spedizioni',
        'Spedizione BRT creata',
        $payload['customerName'],
        $payload['email'],
        $payload['phone'],
        [
            'tracking' => (string) ($shipment['trackingCode'] ?? ''),
            'parcelId' => (string) ($shipment['parcelId'] ?? ''),
            'stato' => !empty($shipment['confirmed']) ? 'confirmed_by_brt' : 'submitted_to_brt',
            'importo' => number_format(((int) ($stripeSession['amountTotal'] ?? 0)) / 100, 2, '.', '') . ' ' . strtoupper((string) ($stripeSession['currency'] ?? 'eur')),
        ]
    );

    client_area_json([
        'message' => $manifestCreated
            ? ($ormCreated ? 'Spedizione BRT creata, ritiro automatico prenotato e manifest driver generato.' : 'Spedizione BRT creata e manifest driver generato.')
            : ($ormCreated ? 'Spedizione BRT creata e ritiro automatico prenotato.' : 'Spedizione BRT creata correttamente.'),
        'trackingCode' => (string) ($shipment['trackingCode'] ?? ''),
        'parcelId' => (string) ($shipment['parcelId'] ?? ''),
        'shipmentNumberFrom' => (string) ($shipment['shipmentNumberFrom'] ?? ''),
        'shipmentNumberTo' => (string) ($shipment['shipmentNumberTo'] ?? ''),
        'labelPdfBase64' => (string) ($shipment['labelPdfBase64'] ?? ''),
        'volumetricWeightKG' => $volumetricWeightKG,
        'volumeM3' => $volumeM3,
        'routing' => $routing,
        'payment' => [
            'amountCents' => (int) ($stripeSession['amountTotal'] ?? 0),
            'currency' => (string) ($stripeSession['currency'] ?? 'eur'),
            'sessionId' => (string) ($stripeSession['id'] ?? ''),
            'priceLabel' => (string) ($expectedPrice['label'] ?? ''),
            'invoicePdf' => (string) ($stripeSession['invoicePdf'] ?? ''),
            'hostedInvoiceUrl' => (string) ($stripeSession['hostedInvoiceUrl'] ?? ''),
        ],
        'orm' => [
            'created' => $ormCreated,
            'message' => $ormMessage,
            'collectionDate' => $ormCollectionDate,
            'collectionTime' => $ormCollectionTime,
            'payload' => $ormPayload,
        ],
        'manifest' => [
            'created' => $manifestCreated,
            'message' => $manifestMessage,
            'payload' => $manifestPayload,
        ],
        'numericSenderReference' => (int) ($shipment['numericSenderReference'] ?? 0),
        'alphanumericSenderReference' => (string) ($shipment['alphanumericSenderReference'] ?? ''),
        'confirmed' => (bool) ($shipment['confirmed'] ?? false),
        'confirmMessage' => (string) ($shipment['confirmMessage'] ?? ''),
    ], 200);
} catch (Throwable $error) {
    $message = trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore durante la creazione della spedizione BRT.';
    $isShippingLimitExceeded =
        str_contains($message, 'non consente spedizioni con peso/volume') ||
        str_contains($message, 'non consente spedizioni con peso superiore');
    client_area_json([
        'message' => $message,
        'errorCode' => $isShippingLimitExceeded ? 'SHIPPING_LIMIT_EXCEEDED' : null,
    ], $isShippingLimitExceeded ? 409 : 502);
}
