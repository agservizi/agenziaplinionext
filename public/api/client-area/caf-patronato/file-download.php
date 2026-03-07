<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function caf_file_token_secret(): string
{
    return trim((string) (public_api_env('CAF_PATRONATO_FILE_LINK_SECRET', public_api_env('CAF_PATRONATO_MAGIC_LINK_SECRET', 'ag-caf-file-link')) ?: 'ag-caf-file-link'));
}

function caf_parse_token(string $token): ?array
{
    $decoded = base64_decode(strtr($token, '-_', '+/'), true);
    if (!is_string($decoded) || $decoded === '') return null;

    $parts = explode(':', $decoded, 3);
    if (count($parts) !== 3) return null;

    $fileId = (int) ($parts[0] ?? 0);
    $exp = (int) ($parts[1] ?? 0);
    $sig = (string) ($parts[2] ?? '');
    if ($fileId <= 0 || $exp <= 0 || $sig === '') return null;

    $expected = hash_hmac('sha256', $fileId . ':' . $exp, caf_file_token_secret());
    if (!hash_equals($expected, $sig)) return null;
    if ($exp < time()) return null;

    return ['fileId' => $fileId];
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato'], 503);
}

$body = client_area_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));

if ($token === '') {
    client_area_json(['message' => 'Token file mancante.'], 400);
}

$parsed = caf_parse_token($token);
if (!$parsed) {
    client_area_json(['message' => 'Link file non valido o scaduto.'], 400);
}

try {
    $db = client_area_require_db();

    $stmt = $db->prepare(
        'SELECT id, source_role, original_name, stored_name, mime_type
         FROM client_area_caf_files
         WHERE id = ?
         LIMIT 1'
    );

    if (!$stmt) {
        throw new RuntimeException('File non trovato.');
    }

    $fileId = (int) ($parsed['fileId'] ?? 0);
    $stmt->bind_param('i', $fileId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$row) {
        throw new RuntimeException('File non trovato.');
    }

    $sourceRole = (string) ($row['source_role'] ?? 'customer');
    $storedName = (string) ($row['stored_name'] ?? '');
    $basePath = __DIR__ . '/../../../../storage/caf-patronato/' . $sourceRole . '/' . $storedName;

    if ($storedName === '' || !is_file($basePath)) {
        throw new RuntimeException('File non disponibile.');
    }

    $mimeType = (string) ($row['mime_type'] ?? 'application/octet-stream');
    $originalName = (string) ($row['original_name'] ?? 'documento');

    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . rawurlencode($originalName) . '"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    readfile($basePath);
    exit;
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile scaricare il file.',
    ], 400);
}
