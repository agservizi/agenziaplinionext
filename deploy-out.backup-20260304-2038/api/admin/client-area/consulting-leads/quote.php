<?php

declare(strict_types=1);

require __DIR__ . '/../../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_consulting_leads_table();

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    admin_api_json(['message' => 'Metodo non consentito'], 405);
}

$requestId = (int) ($_POST['requestId'] ?? 0);
$note = trim((string) ($_POST['note'] ?? ''));

if ($requestId <= 0) {
    admin_api_json(['message' => 'ID lead non valido'], 400);
}

$file = $_FILES['quoteFile'] ?? null;
if (!is_array($file) || (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    admin_api_json(['message' => 'Allega un file preventivo valido.'], 400);
}

$tmpPath = (string) ($file['tmp_name'] ?? '');
if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
    admin_api_json(['message' => 'Upload file non valido.'], 400);
}

$originalName = trim((string) ($file['name'] ?? 'preventivo.pdf'));
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExtensions = ['pdf', 'doc', 'docx'];
if (!in_array($extension, $allowedExtensions, true)) {
    admin_api_json(['message' => 'Formato file non supportato. Usa PDF o DOC/DOCX.'], 400);
}

$publicRoot = realpath(__DIR__ . '/../../../../');
if (!is_string($publicRoot) || $publicRoot === '') {
    admin_api_json(['message' => 'Percorso pubblico non disponibile.'], 500);
}

$uploadDir = $publicRoot . '/uploads/consulting-quotes';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    admin_api_json(['message' => 'Impossibile creare cartella upload preventivi.'], 500);
}

$safeName = preg_replace('/[^a-zA-Z0-9._-]+/', '-', $originalName) ?: 'preventivo.' . $extension;
$storedName = sprintf('lead-%d-%s-%s', $requestId, date('YmdHis'), $safeName);
$destination = $uploadDir . '/' . $storedName;

if (!move_uploaded_file($tmpPath, $destination)) {
    admin_api_json(['message' => 'Impossibile salvare il file preventivo.'], 500);
}

$publicUrl = '/uploads/consulting-quotes/' . rawurlencode($storedName);

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
$payload['quote'] = [
    'fileName' => $originalName,
    'storedName' => $storedName,
    'url' => $publicUrl,
    'sentAt' => date('c'),
    'note' => $note,
];
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
    admin_api_json(['message' => 'Errore aggiornamento preventivo lead'], 500);
}
$leadStatus = 'offerta';
$update->bind_param('ssi', $leadStatus, $payloadJson, $requestId);
$update->execute();
$update->close();

admin_api_json([
    'ok' => true,
    'message' => 'Preventivo allegato e inviato al cliente.',
    'quote' => [
        'fileName' => $originalName,
        'url' => $publicUrl,
        'sentAt' => date('c'),
        'note' => $note,
    ],
]);
