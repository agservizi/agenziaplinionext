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
$numericSenderReference = (int) ($body['numericSenderReference'] ?? 0);
$alphanumericSenderReference = client_area_require_string($body['alphanumericSenderReference'] ?? '');

if ($numericSenderReference <= 0) {
	client_area_json(['message' => 'Riferimento numerico non valido.'], 400);
}

if ($alphanumericSenderReference === '') {
	client_area_json(['message' => 'Riferimento alfanumerico non valido.'], 400);
}

try {
	$result = client_area_brt_delete_shipment($numericSenderReference, $alphanumericSenderReference);
	client_area_json([
		'message' => (string) ($result['message'] ?? 'Annullamento spedizione completato.'),
		'deleted' => (bool) ($result['deleted'] ?? false),
	], 200);
} catch (Throwable $error) {
	client_area_json([
		'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : "Errore durante l'annullamento della spedizione.",
	], 502);
}
