<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato'], 503);
}

$body = client_area_parse_json_body();
$area = trim((string) ($body['area'] ?? ''));
$serviceType = trim((string) ($body['serviceType'] ?? ''));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$notes = trim((string) ($body['notes'] ?? ''));
$details = is_array($body['details'] ?? null) ? $body['details'] : [];

$allowedAreas = ['caf-patronato', 'spedizioni', 'visure'];
if (!in_array($area, $allowedAreas, true)) {
    client_area_json(['message' => 'Area non valida.'], 400);
}

if ($serviceType === '' || $customerName === '' || !str_contains($email, '@')) {
    client_area_json(['message' => 'Compila nome, email e servizio richiesto.'], 400);
}

try {
    client_area_ensure_client_area_requests_table();
    $db = client_area_require_db();

    $stmt = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)' 
    );

    if (!$stmt) {
        throw new RuntimeException('Impossibile registrare la richiesta.');
    }

    $status = 'new';
    $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $stmt->bind_param('ssssssss', $area, $serviceType, $customerName, $email, $phone, $notes, $detailsJson, $status);
    $stmt->execute();
    $stmt->close();

    client_area_notify_event(
        $area,
        'Nuova richiesta area clienti',
        $customerName,
        $email,
        $phone,
        [
            'servizio' => $serviceType,
            'stato' => 'new',
        ]
    );

    client_area_json([
        'message' => 'Richiesta registrata. Ti contatteremo per conferma operativa, documenti e prossimi passaggi.',
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile inviare la richiesta.',
    ], 500);
}
