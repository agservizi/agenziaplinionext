<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$missing = public_api_brt_pudo_missing_config();
if ($missing !== []) {
    public_api_json([
        'message' => 'Configurazione BRT PUDO incompleta: ' . implode(', ', $missing) . '.',
    ], 503);
}

$zipCode = trim((string) ($_GET['zipCode'] ?? ''));
$city = trim((string) ($_GET['city'] ?? ''));
$country = public_api_brt_pudo_country_code((string) ($_GET['country'] ?? $_GET['countryCode'] ?? 'IT'));

if ($zipCode === '' && $city === '') {
    public_api_json([
        'message' => 'Inserisci almeno CAP o citta per la ricerca PUDO.',
    ], 400);
}

$config = public_api_brt_pudo_config();
$query = [];
if ($zipCode !== '') {
    $query['zipCode'] = $zipCode;
}
if ($city !== '') {
    $query['city'] = $city;
}
if ($country !== '') {
    $query['countryCode'] = $country;
}
$query['maxDistanceSearch'] = '50000';
$query['max_pudo_number'] = '25';
$query['holiday_tolerant'] = '1';

$url = $config['pudoBaseUrl'];
if ($query !== []) {
    $url .= '?' . http_build_query($query);
}

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
