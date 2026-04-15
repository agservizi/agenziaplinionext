<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

// ── InPost config ────────────────────────────────────────────────────────────

$inpostClientId     = trim((string) (public_api_env('INPOST_CLIENT_ID', '') ?: ''));
$inpostClientSecret = trim((string) (public_api_env('INPOST_CLIENT_SECRET', '') ?: ''));
$inpostOrgId        = trim((string) (public_api_env('INPOST_ORGANIZATION_ID', '') ?: ''));
$inpostEnv          = strtolower(trim((string) (public_api_env('INPOST_ENV', '') ?: '')));
$inpostApiBase      = rtrim((string) (public_api_env('INPOST_API_BASE', '') ?: ''), '/');
if ($inpostApiBase === '') {
    $inpostApiBase = $inpostEnv === 'stage'
        ? 'https://stage-api.inpost-group.com'
        : 'https://api.inpost-group.com';
}
$inpostTokenUrl  = trim((string) (public_api_env('INPOST_TOKEN_URL', '') ?: '')) ?: $inpostApiBase . '/oauth2/token';
$inpostLabelAccept = trim((string) (public_api_env('INPOST_LABEL_ACCEPT', '') ?: '')) ?: 'application/pdf+json;format=A6';

$missingInpost = array_values(array_filter([
    $inpostClientId === '' ? 'INPOST_CLIENT_ID' : '',
    $inpostClientSecret === '' ? 'INPOST_CLIENT_SECRET' : '',
    $inpostOrgId === '' ? 'INPOST_ORGANIZATION_ID' : '',
]));

if ($missingInpost !== []) {
    client_area_json(['message' => 'Configurazione InPost incompleta: ' . implode(', ', $missingInpost) . '.'], 503);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

// ── Authentication & payload ─────────────────────────────────────────────────

$body          = client_area_parse_json_body();
$token         = trim((string) ($body['token'] ?? ''));
$clientProfile = client_area_require_authenticated_client($token);
$stripeSessionId = client_area_require_string($body['stripeSessionId'] ?? '');

$payload = [
    'customerName'           => client_area_require_string($body['customerName'] ?? ''),
    'email'                  => strtolower(client_area_require_string($body['email'] ?? '')),
    'phone'                  => client_area_require_string($body['phone'] ?? ''),
    'billingType'            => client_area_require_string($body['billingType'] ?? 'privato'),
    'billingCompanyName'     => client_area_require_string($body['billingCompanyName'] ?? ''),
    'billingVatNumber'       => strtoupper(client_area_require_string($body['billingVatNumber'] ?? '')),
    'billingTaxCode'         => strtoupper(client_area_require_string($body['billingTaxCode'] ?? '')),
    'billingRecipientCode'   => strtoupper(client_area_require_string($body['billingRecipientCode'] ?? '')),
    'billingCertifiedEmail'  => strtolower(client_area_require_string($body['billingCertifiedEmail'] ?? '')),
    'billingAddress'         => client_area_require_string($body['billingAddress'] ?? ''),
    'billingZIPCode'         => client_area_require_string($body['billingZIPCode'] ?? ''),
    'billingCity'            => client_area_require_string($body['billingCity'] ?? ''),
    'billingProvince'        => strtoupper(client_area_require_string($body['billingProvince'] ?? '')),
    'pickupAddress'          => client_area_require_string($body['pickupAddress'] ?? ''),
    'pickupZIPCode'          => client_area_require_string($body['pickupZIPCode'] ?? ''),
    'pickupCity'             => client_area_require_string($body['pickupCity'] ?? ''),
    'pickupProvince'         => strtoupper(client_area_require_string($body['pickupProvince'] ?? '')),
    'destinationCompanyName' => client_area_require_string($body['destinationCompanyName'] ?? ''),
    'destinationAddress'     => client_area_require_string($body['destinationAddress'] ?? ''),
    'destinationZIPCode'     => client_area_require_string($body['destinationZIPCode'] ?? ''),
    'destinationCity'        => client_area_require_string($body['destinationCity'] ?? ''),
    'destinationProvince'    => strtoupper(client_area_require_string($body['destinationProvince'] ?? '')),
    'destinationCountry'     => strtoupper(client_area_require_string($body['destinationCountry'] ?? 'IT')),
    'pudoId'                 => client_area_require_string($body['pudoId'] ?? ''),
    'parcelCount'            => client_area_require_positive_number($body['parcelCount'] ?? 0),
    'parcelLengthCM'         => client_area_require_positive_number($body['parcelLengthCM'] ?? 0),
    'parcelHeightCM'         => client_area_require_positive_number($body['parcelHeightCM'] ?? 0),
    'parcelDepthCM'          => client_area_require_positive_number($body['parcelDepthCM'] ?? 0),
    'weightKG'               => client_area_require_positive_number($body['weightKG'] ?? 0),
    'notes'                  => client_area_require_string($body['notes'] ?? ''),
    'serviceCode'            => client_area_require_string($body['serviceCode'] ?? 'ritiro-nazionale'),
    'inpostPackageSize'      => strtolower(client_area_require_string($body['inpostPackageSize'] ?? '')),
];

if ($payload['customerName'] === '' && $clientProfile['fullName'] !== '') {
    $payload['customerName'] = (string) $clientProfile['fullName'];
}
if ($payload['email'] === '' && $clientProfile['email'] !== '') {
    $payload['email'] = strtolower((string) $clientProfile['email']);
}
if ($payload['phone'] === '' && $clientProfile['phone'] !== '') {
    $payload['phone'] = (string) $clientProfile['phone'];
}
if ($payload['billingCompanyName'] === '' && $clientProfile['companyName'] !== '') {
    $payload['billingCompanyName'] = (string) $clientProfile['companyName'];
}

$volumeCM3         = $payload['parcelLengthCM'] * $payload['parcelHeightCM'] * $payload['parcelDepthCM'] * $payload['parcelCount'];
$volumeM3          = round($volumeCM3 / 1_000_000, 4);
$volumetricWeightKG = round($volumeCM3 / 4000, 2);

// ── Validation ───────────────────────────────────────────────────────────────

if ($payload['destinationCountry'] !== 'IT') {
    client_area_json(['message' => 'InPost e disponibile in questo flusso solo per destinazioni italiane (IT).'], 400);
}

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

// ── InPost helper functions ───────────────────────────────────────────────────

function inpost_get_access_token(string $tokenUrl, string $clientId, string $clientSecret, string $scopes): string
{
    $postBody = http_build_query([
        'grant_type'    => 'client_credentials',
        'scope'         => $scopes,
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
    ]);

    $response = public_api_http_request('POST', $tokenUrl, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json',
    ], $postBody);

    $json = is_array($response['json'] ?? null) ? $response['json'] : [];
    $accessToken = trim((string) ($json['access_token'] ?? ''));

    if ($accessToken === '') {
        $error = (string) ($json['error_description'] ?? $json['error'] ?? 'token non valido');
        throw new RuntimeException('InPost OAuth errore: ' . $error);
    }

    return $accessToken;
}

function inpost_resolve_parcel_template(float $lengthCM, float $heightCM, float $depthCM): string
{
    $dims = [$lengthCM, $heightCM, $depthCM];
    sort($dims);
    [$smallest, $medium, $largest] = $dims;

    if ($medium > 38 || $largest > 64) {
        throw new RuntimeException('InPost accetta colli con lato medio massimo 38 cm e lato lungo massimo 64 cm.');
    }
    if ($smallest <= 8) {
        return 'small';
    }
    if ($smallest <= 19) {
        return 'medium';
    }
    if ($smallest <= 41) {
        return 'large';
    }
    throw new RuntimeException('InPost accetta al massimo il formato L: 41 x 38 x 64 cm.');
}

function inpost_split_name(string $fullName): array
{
    $normalized = preg_replace('/\s+/', ' ', trim($fullName)) ?? '';
    if ($normalized === '') {
        return ['firstName' => 'Cliente', 'lastName' => 'AG SERVIZI'];
    }
    $parts = explode(' ', $normalized);
    if (count($parts) === 1) {
        return ['firstName' => $parts[0], 'lastName' => $parts[0]];
    }
    return [
        'firstName' => implode(' ', array_slice($parts, 0, -1)),
        'lastName'  => $parts[count($parts) - 1],
    ];
}

// ── Main flow ─────────────────────────────────────────────────────────────────

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_shipments_table();
    client_area_ensure_client_area_payments_table();
    client_area_ensure_client_area_invoices_table();

    $db = client_area_require_db();

    $taxableWeightKG = max($payload['weightKG'], $volumetricWeightKG);
    $expectedPrice   = client_area_resolve_shipping_price($taxableWeightKG, $volumeM3, $payload['destinationCountry'], true);

    $stripeSession   = client_area_get_stripe_checkout_session($stripeSessionId);
    $paymentCompleted = (($stripeSession['status'] ?? '') === 'complete') && (($stripeSession['paymentStatus'] ?? '') === 'paid');
    if (!$paymentCompleted) {
        client_area_json(['message' => 'Il pagamento Stripe non risulta completato.'], 402);
    }

    if (
        strtolower((string) ($stripeSession['currency'] ?? 'eur')) !== 'eur' ||
        (int) ($stripeSession['amountTotal'] ?? 0) !== (int) ($expectedPrice['amountCents'] ?? 0)
    ) {
        client_area_json(['message' => 'Il pagamento Stripe non corrisponde all\'importo atteso. La spedizione e stata bloccata.'], 409);
    }

    // ── InPost API ────────────────────────────────────────────────────────────

    $scopes      = 'openid api:shipments:read api:shipments:write api:labels:read';
    $accessToken = inpost_get_access_token($inpostTokenUrl, $inpostClientId, $inpostClientSecret, $scopes);

    $parcelWeightKG  = round($payload['weightKG'] / max(1, (int) $payload['parcelCount']), 2);
    if ($parcelWeightKG > 25) {
        client_area_json(['message' => 'InPost accetta massimo 25 kg per collo.'], 400);
    }

    $parcelTemplate  = inpost_resolve_parcel_template(
        (float) $payload['parcelLengthCM'],
        (float) $payload['parcelHeightCM'],
        (float) $payload['parcelDepthCM']
    );

    $senderName      = inpost_split_name($payload['customerName']);
    $pudoId          = (string) ($payload['pudoId'] ?? '');
    $reference       = 'AG-' . time();

    $shipmentPayload = [
        'service'   => $pudoId !== '' ? 'inpost_locker_standard' : 'inpost_courier_standard',
        'reference' => $reference,
        'sender'    => [
            'firstName' => $senderName['firstName'],
            'lastName'  => $senderName['lastName'],
            'email'     => $payload['email'],
            'phone'     => $payload['phone'],
            'address'   => [
                'line1'       => $payload['pickupAddress'],
                'postCode'    => $payload['pickupZIPCode'],
                'city'        => $payload['pickupCity'],
                'countryCode' => 'IT',
            ],
        ],
        'receiver'  => [
            'companyName' => $payload['destinationCompanyName'],
            'firstName'   => $payload['destinationCompanyName'] ?: $senderName['firstName'],
            'lastName'    => $payload['destinationCompanyName'] ?: $senderName['lastName'],
            'email'       => $payload['email'],
            'phone'       => $payload['phone'],
            'address'     => [
                'line1'       => $payload['destinationAddress'],
                'postCode'    => $payload['destinationZIPCode'],
                'city'        => $payload['destinationCity'],
                'countryCode' => $payload['destinationCountry'],
            ],
        ],
        'parcels'   => array_fill(0, max(1, (int) $payload['parcelCount']), [
            'template'   => $parcelTemplate,
            'dimensions' => [
                'length' => (int) $payload['parcelLengthCM'],
                'width'  => (int) $payload['parcelDepthCM'],
                'height' => (int) $payload['parcelHeightCM'],
            ],
            'weight' => $parcelWeightKG,
        ]),
    ];

    if ($pudoId !== '') {
        $shipmentPayload['customAttributes'] = [
            'targetPoint'  => $pudoId,
            'target_point' => $pudoId,
            'dropoffPoint' => $pudoId,
        ];
    }

    if ($payload['notes'] !== '') {
        $shipmentPayload['comments'] = $payload['notes'];
    }

    $shipmentUrl  = $inpostApiBase . '/shipping/v2/organizations/' . rawurlencode($inpostOrgId) . '/shipments';
    $shipmentBody = json_encode($shipmentPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $shipmentResp = public_api_http_request('POST', $shipmentUrl, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $accessToken,
    ], $shipmentBody);

    $shipmentJson = is_array($shipmentResp['json'] ?? null) ? $shipmentResp['json'] : [];
    $shipmentStatus = (int) ($shipmentResp['status'] ?? 0);

    if ($shipmentStatus < 200 || $shipmentStatus >= 300) {
        $errMsg = (string) ($shipmentJson['message'] ?? $shipmentJson['error'] ?? 'InPost non ha creato la spedizione.');
        throw new RuntimeException($errMsg);
    }

    $inpostShipmentId = trim((string) ($shipmentJson['id'] ?? $shipmentJson['uuid'] ?? $shipmentJson['shipmentId'] ?? ''));
    $trackingCode     = trim((string) ($shipmentJson['trackingNumber'] ?? $shipmentJson['tracking_number'] ?? $shipmentJson['trackingCode'] ?? $shipmentJson['parcelCode'] ?? ''));
    $parcelId         = $pudoId !== '' ? $pudoId : ($inpostShipmentId ?: $trackingCode);

    // ── Get label ─────────────────────────────────────────────────────────────

    $labelPdfBase64 = '';
    if ($inpostShipmentId !== '') {
        $labelUrl  = $inpostApiBase . '/shipping/v2/organizations/' . rawurlencode($inpostOrgId) . '/shipments/' . rawurlencode($inpostShipmentId) . '/label';
        $labelResp = public_api_http_request('GET', $labelUrl, [
            'Accept: ' . $inpostLabelAccept,
            'Authorization: Bearer ' . $accessToken,
        ]);
        $labelJson = is_array($labelResp['json'] ?? null) ? $labelResp['json'] : [];
        $labelPdfBase64 = trim((string) ($labelJson['content'] ?? $labelJson['base64'] ?? $labelJson['label'] ?? $labelJson['data'] ?? ''));
    }

    // ── Save to DB ────────────────────────────────────────────────────────────

    $detailsJson = json_encode([
        'carrierProvider'        => 'inpost',
        'inpostPackageSize'      => $parcelTemplate,
        'pickupAddress'          => $payload['pickupAddress'],
        'pickupZIPCode'          => $payload['pickupZIPCode'],
        'pickupCity'             => $payload['pickupCity'],
        'pickupProvince'         => $payload['pickupProvince'],
        'destinationCompanyName' => $payload['destinationCompanyName'],
        'destinationAddress'     => $payload['destinationAddress'],
        'destinationZIPCode'     => $payload['destinationZIPCode'],
        'destinationCity'        => $payload['destinationCity'],
        'destinationProvince'    => $payload['destinationProvince'],
        'destinationCountry'     => $payload['destinationCountry'],
        'pudoId'                 => $pudoId,
        'parcelCount'            => $payload['parcelCount'],
        'parcelLengthCM'         => $payload['parcelLengthCM'],
        'parcelHeightCM'         => $payload['parcelHeightCM'],
        'parcelDepthCM'          => $payload['parcelDepthCM'],
        'volumeM3'               => $volumeM3,
        'volumetricWeightKG'     => $volumetricWeightKG,
        'weightKG'               => $payload['weightKG'],
        'billingType'            => $payload['billingType'],
        'billingCompanyName'     => $payload['billingCompanyName'],
        'billingVatNumber'       => $payload['billingVatNumber'],
        'billingTaxCode'         => $payload['billingTaxCode'],
        'billingRecipientCode'   => $payload['billingRecipientCode'],
        'billingCertifiedEmail'  => $payload['billingCertifiedEmail'],
        'billingAddress'         => $payload['billingAddress'],
        'billingZIPCode'         => $payload['billingZIPCode'],
        'billingCity'            => $payload['billingCity'],
        'billingProvince'        => $payload['billingProvince'],
        'clientUsername'         => (string) ($clientProfile['username'] ?? ''),
        'clientUserId'           => (int) ($clientProfile['userId'] ?? 0),
        'clientEmail'            => (string) ($clientProfile['email'] ?? $payload['email']),
        'source'                 => 'client-area-spedizioni-inpost',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $requestStmt = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (\'spedizioni\', ?, ?, ?, ?, ?, ?, \'processing\')'
    );
    if (!$requestStmt) {
        throw new RuntimeException('Impossibile registrare la richiesta spedizione InPost.');
    }
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
        $sessionId       = (string) ($stripeSession['id'] ?? '');
        $amountTotal     = (int) ($stripeSession['amountTotal'] ?? 0);
        $currency        = (string) ($stripeSession['currency'] ?? 'eur');
        $paymentStatus   = (string) ($stripeSession['paymentStatus'] ?? '');
        $checkoutStatus  = (string) ($stripeSession['status'] ?? '');
        $priceLabel      = (string) ($expectedPrice['label'] ?? '');
        $stripeJson      = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $paymentStmt->bind_param('isisssss', $requestId, $sessionId, $amountTotal, $currency, $paymentStatus, $checkoutStatus, $priceLabel, $stripeJson);
        $paymentStmt->execute();
        $paymentId = (int) $paymentStmt->insert_id;
        $paymentStmt->close();
    }

    $inpostResponseJson = json_encode([
        'provider'  => 'inpost',
        'shipment'  => $shipmentJson,
        'pointId'   => $pudoId,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $labelValue = $labelPdfBase64 !== '' ? $labelPdfBase64 : null;
    $shipmentStmt = $db->prepare(
        'INSERT INTO client_area_shipments
          (request_id, tracking_code, parcel_id, shipment_number_from, shipment_number_to, label_pdf_base64, brt_response_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $shipmentId = 0;
    if ($shipmentStmt) {
        $shipmentStmt->bind_param('issssss', $requestId, $trackingCode, $parcelId, $inpostShipmentId, $inpostShipmentId, $labelValue, $inpostResponseJson);
        $shipmentStmt->execute();
        $shipmentId = (int) $shipmentStmt->insert_id;
        $shipmentStmt->close();
    }

    if ($shipmentId > 0) {
        $updatePaymentStmt = $db->prepare('UPDATE client_area_payments SET shipment_id = ?, stripe_response_json = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_session_id = ?');
        if ($updatePaymentStmt) {
            $stripeJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $sessionId  = (string) ($stripeSession['id'] ?? '');
            $updatePaymentStmt->bind_param('iss', $shipmentId, $stripeJson, $sessionId);
            $updatePaymentStmt->execute();
            $updatePaymentStmt->close();
        }
    }

    $invoiceProvider = trim((string) (public_api_env('INVOICE_PROVIDER', 'pending') ?: 'pending'));
    $invoiceStatus   = $invoiceProvider === 'acube_stripe'
        ? 'managed_in_stripe_acube'
        : ($invoiceProvider !== '' ? 'pending_provider_issue' : 'pending_provider_config');

    $billingJson = json_encode([
        'billingType'           => $payload['billingType'],
        'billingCompanyName'    => $payload['billingCompanyName'],
        'billingVatNumber'      => $payload['billingVatNumber'],
        'billingTaxCode'        => $payload['billingTaxCode'],
        'billingRecipientCode'  => $payload['billingRecipientCode'],
        'billingCertifiedEmail' => $payload['billingCertifiedEmail'],
        'billingAddress'        => $payload['billingAddress'],
        'billingZIPCode'        => $payload['billingZIPCode'],
        'billingCity'           => $payload['billingCity'],
        'billingProvince'       => $payload['billingProvince'],
        'customerName'          => $payload['customerName'],
        'email'                 => $payload['email'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $providerPayloadJson = json_encode([
        'stripeSession'    => $stripeSession,
        'shipmentProvider' => 'inpost',
        'providerReady'    => (bool) ($invoiceProvider !== '' && $invoiceProvider !== 'pending'),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $providerDocumentId = (string) ($stripeSession['invoiceId'] ?? '');
    $invoicePdf = (string) ($stripeSession['invoicePdf'] ?? $stripeSession['hostedInvoiceUrl'] ?? '');
    $invoicePdfValue = $invoicePdf !== '' ? $invoicePdf : null;

    $invoiceStmt = $db->prepare(
        'INSERT INTO client_area_invoices
          (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    if ($invoiceStmt) {
        $invoiceStmt->bind_param('iiissssss', $requestId, $paymentId, $shipmentId, $invoiceProvider, $providerDocumentId, $invoiceStatus, $invoicePdfValue, $billingJson, $providerPayloadJson);
        $invoiceStmt->execute();
        $invoiceStmt->close();
    }

    if ($requestId > 0) {
        $updateRequestStmt = $db->prepare('UPDATE client_area_requests SET status = \'submitted_to_inpost\', updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        if ($updateRequestStmt) {
            $updateRequestStmt->bind_param('i', $requestId);
            $updateRequestStmt->execute();
            $updateRequestStmt->close();
        }
    }

    client_area_notify_event(
        'spedizioni',
        'Spedizione InPost creata',
        $payload['customerName'],
        $payload['email'],
        $payload['phone'],
        [
            'tracking'  => $trackingCode,
            'parcelId'  => $parcelId,
            'corriere'  => 'InPost',
            'formato'   => strtoupper($parcelTemplate),
            'punto'     => $pudoId,
            'importo'   => number_format(((int) ($stripeSession['amountTotal'] ?? 0)) / 100, 2, '.', '') . ' ' . strtoupper((string) ($stripeSession['currency'] ?? 'eur')),
        ]
    );

    client_area_json([
        'provider'           => 'inpost',
        'message'            => 'Spedizione InPost creata correttamente.',
        'trackingCode'       => $trackingCode,
        'parcelId'           => $parcelId,
        'shipmentNumberFrom' => $inpostShipmentId,
        'shipmentNumberTo'   => $inpostShipmentId,
        'labelPdfBase64'     => $labelPdfBase64,
        'volumetricWeightKG' => $volumetricWeightKG,
        'volumeM3'           => $volumeM3,
        'payment'            => [
            'amountCents'      => (int) ($stripeSession['amountTotal'] ?? 0),
            'currency'         => (string) ($stripeSession['currency'] ?? 'eur'),
            'sessionId'        => (string) ($stripeSession['id'] ?? ''),
            'priceLabel'       => (string) ($expectedPrice['label'] ?? ''),
            'invoicePdf'       => (string) ($stripeSession['invoicePdf'] ?? ''),
            'hostedInvoiceUrl' => (string) ($stripeSession['hostedInvoiceUrl'] ?? ''),
        ],
    ], 200);
} catch (Throwable $error) {
    $message = trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore durante la creazione della spedizione InPost.';
    client_area_json(['message' => $message], 502);
}
