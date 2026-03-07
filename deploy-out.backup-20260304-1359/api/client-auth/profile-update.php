<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_auth_json(['message' => 'Metodo non consentito'], 405);
}

$db = client_auth_db();
if (!$db) {
    client_auth_json(['message' => 'Database non configurato'], 503);
}

$body = client_auth_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));

if ($token === '') {
    client_auth_json(['message' => 'Token mancante'], 400);
}

$session = client_auth_verify_token($token);
if (!$session) {
    client_auth_json(['message' => 'Sessione non valida'], 401);
}

if (($session['source'] ?? '') === 'env') {
    client_auth_json(['message' => 'Il profilo di fallback non puo essere modificato'], 403);
}

$fullName = trim((string) ($body['fullName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$companyName = trim((string) ($body['companyName'] ?? ''));
$currentPassword = trim((string) ($body['currentPassword'] ?? ''));
$newPassword = trim((string) ($body['newPassword'] ?? ''));

if ($fullName === '' || $email === '') {
    client_auth_json(['message' => 'Nome completo ed email sono obbligatori'], 400);
}

$user = client_auth_get_user_by_session($session);
if (!$user || (($user['status'] ?? 'active') !== 'active')) {
    client_auth_json(['message' => 'Profilo cliente non trovato'], 404);
}

$currentUserId = (int) ($user['id'] ?? 0);
client_auth_ensure_users_table();

$stmt = $db->prepare('SELECT id FROM client_portal_users WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND id <> ? LIMIT 1');
if (!$stmt) {
    client_auth_json(['message' => 'Errore aggiornamento profilo'], 500);
}
$identifier = $email;
$stmt->bind_param('ssi', $identifier, $identifier, $currentUserId);
$stmt->execute();
$result = $stmt->get_result();
$existing = $result ? $result->fetch_assoc() : null;
$stmt->close();

if ($existing) {
    client_auth_json(['message' => 'Esiste gia un altro profilo con questa email'], 409);
}

$passwordSql = '';
$passwordArgs = [];
$types = 'sssss';
$values = [$fullName, $email, $email, $phone, $companyName];

if ($newPassword !== '') {
    $storedHash = (string) ($user['password_hash'] ?? '');
    if (!client_auth_verify_password($currentPassword, $storedHash)) {
        client_auth_json(['message' => 'La password attuale non e corretta'], 401);
    }

    if (strlen($newPassword) < 8) {
        client_auth_json(['message' => 'La nuova password deve avere almeno 8 caratteri'], 400);
    }

    $passwordSql = ', password_hash = ?';
    $passwordArgs[] = client_auth_hash_password($newPassword);
    $types .= 's';
}

$types .= 'i';
$values = array_merge($values, $passwordArgs, [$currentUserId]);

$sql = "
    UPDATE client_portal_users
    SET full_name = ?, username = ?, email = ?, phone = ?, company_name = ?{$passwordSql}
    WHERE id = ?
";

$update = $db->prepare($sql);
if (!$update) {
    client_auth_json(['message' => 'Errore aggiornamento profilo'], 500);
}

$update->bind_param($types, ...$values);
$ok = $update->execute();
$update->close();

if (!$ok) {
    client_auth_json(['message' => 'Errore aggiornamento profilo'], 500);
}

$nextToken = client_auth_create_token($email, $currentUserId, 'db');

client_auth_json([
    'ok' => true,
    'token' => $nextToken,
    'message' => 'Profilo aggiornato correttamente',
    'profile' => [
        'fullName' => $fullName,
        'username' => $email,
        'email' => $email,
        'phone' => $phone,
        'companyName' => $companyName,
        'source' => 'db',
    ],
]);
