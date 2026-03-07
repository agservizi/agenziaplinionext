<?php

declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();

$body = admin_api_parse_json_body();
$id = (int) ($body['id'] ?? 0);
$status = trim((string) ($body['status'] ?? ''));
$allowed = ['new', 'processing', 'submitted_to_brt', 'confirmed_by_brt', 'completed', 'cancelled'];

if ($id <= 0) {
    admin_api_json(['message' => 'ID richiesta non valido'], 400);
}

if (!in_array($status, $allowed, true)) {
    admin_api_json(['message' => 'Stato non valido'], 400);
}

$db = admin_api_require_db();
$stmt = $db->prepare(
    "UPDATE client_area_requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?"
);

if (!$stmt) {
    admin_api_json(['message' => 'Errore aggiornamento stato'], 500);
}

$stmt->bind_param('si', $status, $id);
$stmt->execute();
$stmt->close();

admin_api_json(['ok' => true, 'message' => 'Stato aggiornato']);
