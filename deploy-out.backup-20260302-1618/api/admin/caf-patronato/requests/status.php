<?php

declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_caf_requests_table();

$body = admin_api_parse_json_body();
$requestId = (int) ($body['requestId'] ?? 0);
$status = trim((string) ($body['status'] ?? ''));
$operatorNotes = trim((string) ($body['operatorNotes'] ?? ''));
$normalizedStatus = in_array($status, ['completed', 'processing', 'waiting-documents'], true)
    ? $status
    : 'awaiting_review';

if ($requestId <= 0) {
    admin_api_json(['message' => 'Pratica non valida'], 400);
}

$db = admin_api_require_db();

$stmt = $db->prepare(
    "UPDATE client_area_requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND area = 'caf-patronato'"
);
if (!$stmt) {
    admin_api_json(['message' => 'Impossibile aggiornare la pratica.'], 500);
}
$stmt->bind_param('si', $normalizedStatus, $requestId);
$stmt->execute();
$stmt->close();

$stmt = $db->prepare(
    "UPDATE client_area_caf_requests
     SET intake_status = ?,
         operator_notes = ?,
         resolved_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
         updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?"
);
if (!$stmt) {
    admin_api_json(['message' => 'Impossibile aggiornare la pratica.'], 500);
}
$stmt->bind_param('sssi', $normalizedStatus, $operatorNotes, $normalizedStatus, $requestId);
$stmt->execute();
$stmt->close();

admin_api_json(['message' => 'Stato pratica aggiornato.']);
