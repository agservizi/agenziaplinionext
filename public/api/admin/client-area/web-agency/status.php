<?php

declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_web_agency_projects_table();

$body = admin_api_parse_json_body();
$requestId = (int) ($body['requestId'] ?? 0);
$projectStatus = trim((string) ($body['projectStatus'] ?? ''));
$operatorNotes = trim((string) ($body['operatorNotes'] ?? ''));

$allowed = ['nuova', 'brief_ricevuto', 'qualificata', 'offerta', 'in_lavorazione', 'chiusa'];

if ($requestId <= 0) {
    admin_api_json(['message' => 'ID progetto non valido'], 400);
}

if (!in_array($projectStatus, $allowed, true)) {
    admin_api_json(['message' => 'Stato progetto non valido'], 400);
}

$db = admin_api_require_db();
$stmt = $db->prepare('SELECT intake_payload_json FROM client_area_web_agency_projects WHERE request_id = ? LIMIT 1');
if (!$stmt) {
    admin_api_json(['message' => 'Errore lettura progetto'], 500);
}
$stmt->bind_param('i', $requestId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$row) {
    admin_api_json(['message' => 'Progetto non trovato'], 404);
}

$payload = admin_api_decode_json_value($row['intake_payload_json'] ?? null);
$payload['operatorNotes'] = $operatorNotes;
$payloadJson = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($payloadJson === false) {
    $payloadJson = '{}';
}

$update = $db->prepare(
    'UPDATE client_area_web_agency_projects
     SET project_status = ?, intake_payload_json = ?, updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?'
);

if (!$update) {
    admin_api_json(['message' => 'Errore aggiornamento progetto'], 500);
}

$update->bind_param('ssi', $projectStatus, $payloadJson, $requestId);
$update->execute();
$update->close();

admin_api_json(['ok' => true, 'message' => 'Stato progetto aggiornato']);
