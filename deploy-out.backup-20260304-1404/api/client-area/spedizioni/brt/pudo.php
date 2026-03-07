<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../public/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    public_api_json(['message' => 'Metodo non consentito.'], 405);
}

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : [];
if (!is_array($body)) {
    $body = [];
}

$zipCode = trim((string) ($body['zipCode'] ?? ''));
$city = trim((string) ($body['city'] ?? ''));
$country = trim((string) ($body['country'] ?? 'IT'));

if ($zipCode === '' || $city === '') {
    public_api_json(['message' => 'CAP e città sono obbligatori.'], 400);
}

$missing = public_api_brt_pudo_missing_config();
if ($missing !== []) {
    public_api_json([
        'message' => 'Configurazione BRT PUDO incompleta: ' . implode(', ', $missing) . '.',
    ], 503);
}

$countryCode = public_api_brt_pudo_country_code($country);
$config = public_api_brt_pudo_config();
$query = [
    'zipCode' => $zipCode,
    'city' => $city,
    'countryCode' => $countryCode,
    'maxDistanceSearch' => '50000',
    'max_pudo_number' => '25',
    'holiday_tolerant' => '1',
];

$url = $config['pudoBaseUrl'] . '?' . http_build_query($query);

try {
    $response = public_api_http_request('GET', $url, [
        'Accept: application/json',
        'X-API-Auth: ' . $config['pudoAuthToken'],
    ]);

    $json = $response['json'];
    $rawText = (string) ($response['body'] ?? '');

    if (($response['status'] ?? 0) < 200 || ($response['status'] ?? 0) >= 300) {
        $upstreamMessage = '';
        if (is_array($json)) {
            $upstreamMessage = (string) ($json['message'] ?? $json['error'] ?? $json['detail'] ?? '');
        }
        if ($upstreamMessage === '') {
            $upstreamMessage = trim(substr($rawText, 0, 300));
        }
        if ($upstreamMessage === '') {
            $upstreamMessage = 'nessun dettaglio restituito';
        }

        public_api_json([
            'message' => 'BRT PUDO HTTP ' . (int) $response['status'] . ': ' . $upstreamMessage,
        ], 502);
    }

    $points = public_api_brt_pudo_points($json);
    public_api_json([
        'message' => $points !== []
            ? 'Punti BRT disponibili.'
            : 'Nessun punto BRT trovato per i criteri indicati.',
        'points' => $points,
    ]);
} catch (Throwable $error) {
    public_api_json([
        'message' => $error instanceof Error ? $error->getMessage() : 'Errore durante la ricerca dei punti BRT.',
    ], 502);
}
