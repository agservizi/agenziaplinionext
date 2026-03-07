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
$parcelId = client_area_require_string($body['parcelId'] ?? '');

if ($parcelId === '') {
	client_area_json(['message' => 'Parcel ID non valido.'], 400);
}

try {
	$result = client_area_brt_track_parcel($parcelId);
	client_area_json([
		'message' => 'Tracking BRT aggiornato.',
		'parcelId' => (string) ($result['parcelId'] ?? $parcelId),
		'shipmentId' => (string) ($result['shipmentId'] ?? ''),
		'status' => (string) ($result['status'] ?? ''),
		'statusDescription' => (string) ($result['statusDescription'] ?? ''),
		'events' => is_array($result['events'] ?? null) ? $result['events'] : [],
	], 200);
} catch (Throwable $error) {
	client_area_json([
		'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore durante il tracking della spedizione.',
	], 502);
}
