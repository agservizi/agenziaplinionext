<?php

declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_consulting_leads_table();

$body = admin_api_parse_json_body();
$requestId = (int) ($body['requestId'] ?? 0);
$leadStatus = trim((string) ($body['leadStatus'] ?? ''));
$operatorNotes = trim((string) ($body['operatorNotes'] ?? ''));

$allowed = ['nuova', 'contattata', 'qualificata', 'offerta', 'chiusa'];

if ($requestId <= 0) {
    admin_api_json(['message' => 'ID lead non valido'], 400);
}

if (!in_array($leadStatus, $allowed, true)) {
    admin_api_json(['message' => 'Stato lead non valido'], 400);
}

$db = admin_api_require_db();

$stmt = $db->prepare('SELECT intake_payload_json FROM client_area_consulting_leads WHERE request_id = ? LIMIT 1');
if (!$stmt) {
    admin_api_json(['message' => 'Errore lettura lead'], 500);
}
$stmt->bind_param('i', $requestId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$row) {
    admin_api_json(['message' => 'Lead non trovata'], 404);
}

$payload = admin_api_decode_json_value($row['intake_payload_json'] ?? null);
$payload['operatorNotes'] = $operatorNotes;
$payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($payloadJson === false) {
    $payloadJson = '{}';
}

$update = $db->prepare(
    'UPDATE client_area_consulting_leads
     SET lead_status = ?, intake_payload_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?'
);

if (!$update) {
    admin_api_json(['message' => 'Errore aggiornamento lead'], 500);
}

$update->bind_param('ssi', $leadStatus, $payloadJson, $requestId);
$update->execute();
$update->close();

admin_api_json(['ok' => true, 'message' => 'Stato lead aggiornato']);
