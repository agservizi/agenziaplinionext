<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

$body = client_area_parse_json_body();
$payload = [
    'customerName' => client_area_require_string($body['customerName'] ?? ''),
    'email' => strtolower(client_area_require_string($body['email'] ?? '')),
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
    'destinationCountry' => strtoupper(client_area_require_string($body['destinationCountry'] ?? 'IT')),
    'destinationCity' => client_area_require_string($body['destinationCity'] ?? ''),
    'parcelCount' => client_area_require_positive_number($body['parcelCount'] ?? 0),
    'parcelLengthCM' => client_area_require_positive_number($body['parcelLengthCM'] ?? 0),
    'parcelHeightCM' => client_area_require_positive_number($body['parcelHeightCM'] ?? 0),
    'parcelDepthCM' => client_area_require_positive_number($body['parcelDepthCM'] ?? 0),
    'weightKG' => client_area_require_positive_number($body['weightKG'] ?? 0),
    'serviceCode' => client_area_require_string($body['serviceCode'] ?? 'ritiro-nazionale'),
];

if (
    $payload['customerName'] === '' ||
    !str_contains($payload['email'], '@') ||
    $payload['destinationCity'] === '' ||
    $payload['parcelCount'] <= 0 ||
    $payload['parcelLengthCM'] <= 0 ||
    $payload['parcelHeightCM'] <= 0 ||
    $payload['parcelDepthCM'] <= 0 ||
    $payload['weightKG'] <= 0
) {
    client_area_json(['message' => 'Compila i campi richiesti prima di procedere al pagamento.'], 400);
}

$countryValidationError = client_area_validate_shipping_service_country($payload['serviceCode'], $payload['destinationCountry']);
if ($countryValidationError !== null) {
    client_area_json(['message' => $countryValidationError], 400);
}

try {
    $volumeCM3 = $payload['parcelCount'] * $payload['parcelLengthCM'] * $payload['parcelHeightCM'] * $payload['parcelDepthCM'];
    $volumeM3 = round($volumeCM3 / 1000000, 4);
    $volumetricWeightKG = round($volumeCM3 / 4000, 2);
    $taxableWeightKG = max($payload['weightKG'], $volumetricWeightKG);
    $price = client_area_resolve_shipping_price($taxableWeightKG, $volumeM3, $payload['destinationCountry'], true);

    $origin = client_area_site_origin();
    $checkout = client_area_create_stripe_checkout_session([
        'amountCents' => (int) ($price['amountCents'] ?? 0),
        'customerEmail' => $payload['email'],
        'description' => $payload['serviceCode'] . ' • ' . $payload['destinationCity'] . ' (' . $payload['destinationCountry'] . ')',
        'successUrl' => $origin . '/area-clienti/spedizioni/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}',
        'cancelUrl' => $origin . '/area-clienti/spedizioni?shipment_checkout=cancel',
        'invoiceDescription' => 'Spedizione ' . $payload['serviceCode'] . ' per ' . $payload['customerName'],
        'metadata' => [
            'service_code' => $payload['serviceCode'],
            'destination_country' => $payload['destinationCountry'],
            'price_label' => (string) ($price['label'] ?? ''),
            'billing_type' => $payload['billingType'] ?: 'privato',
            'billing_name' => $payload['billingCompanyName'] ?: $payload['customerName'],
        ],
    ]);

    $url = client_area_require_string($checkout['url'] ?? '');
    if ($url === '') {
        throw new RuntimeException('URL checkout Stripe non disponibile.');
    }

    client_area_json([
        'url' => $url,
        'amountCents' => (int) ($price['amountCents'] ?? 0),
        'priceLabel' => (string) ($price['label'] ?? ''),
        'message' => 'Reindirizzamento a Stripe per completare il pagamento.',
    ], 200);
} catch (Throwable $error) {
    $message = trim($error->getMessage()) !== '' ? $error->getMessage() : 'Creazione checkout Stripe non riuscita.';
    $isShippingLimitExceeded =
        str_contains($message, 'non consente spedizioni con peso/volume') ||
        str_contains($message, 'non consente spedizioni con peso superiore');
    client_area_json([
        'message' => $message,
        'errorCode' => $isShippingLimitExceeded ? 'SHIPPING_LIMIT_EXCEEDED' : null,
    ], $isShippingLimitExceeded ? 409 : 502);
}
