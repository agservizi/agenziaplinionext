<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

$missing = client_area_get_missing_brt_config();
if ($missing !== []) {
    client_area_json(['message' => 'Configurazione BRT incompleta: ' . implode(', ', $missing) . '.'], 503);
}

$body = client_area_parse_json_body();
$payload = [
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
    'serviceCode' => client_area_require_string($body['serviceCode'] ?? 'ritiro-nazionale'),
];

$volumeCM3 = $payload['parcelLengthCM'] * $payload['parcelHeightCM'] * $payload['parcelDepthCM'] * $payload['parcelCount'];
$volumeM3 = round($volumeCM3 / 1000000, 4);

if (
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
    client_area_json(['message' => 'Compila i dati minimi per il routing BRT.'], 400);
}

try {
    $result = client_area_brt_route_shipment([
        ...$payload,
        'volumeM3' => $volumeM3,
    ]);

    client_area_json([
        'message' => 'Instradamento BRT disponibile.',
        'arrivalTerminal' => (string) ($result['arrivalTerminal'] ?? ''),
        'arrivalDepot' => (string) ($result['arrivalDepot'] ?? ''),
        'deliveryZone' => (string) ($result['deliveryZone'] ?? ''),
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore durante il routing della spedizione.',
    ], 502);
}
