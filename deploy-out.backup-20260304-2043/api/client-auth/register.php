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
$fullName = trim((string) ($body['fullName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$password = trim((string) ($body['password'] ?? ''));
$phone = trim((string) ($body['phone'] ?? ''));
$companyName = trim((string) ($body['companyName'] ?? ''));

if ($fullName === '' || $email === '' || $password === '') {
    client_auth_json(['message' => 'Nome completo, email e password sono obbligatori'], 400);
}

if (strlen($password) < 8) {
    client_auth_json(['message' => 'La password deve avere almeno 8 caratteri'], 400);
}

client_auth_ensure_users_table();

$username = $email;
$stmt = $db->prepare('SELECT id FROM client_portal_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1');
if (!$stmt) {
    client_auth_json(['message' => 'Registrazione area clienti non riuscita'], 500);
}

$identifier = $email;
$stmt->bind_param('ss', $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();
$existing = $result ? $result->fetch_assoc() : null;
$stmt->close();

if ($existing) {
    client_auth_json(['message' => 'Esiste già un accesso registrato con questa email'], 409);
}

$passwordHash = client_auth_hash_password($password);
$insert = $db->prepare('
    INSERT INTO client_portal_users
      (full_name, username, email, phone, company_name, password_hash, status)
    VALUES (?, ?, ?, ?, ?, ?, "active")
');

if (!$insert) {
    client_auth_json(['message' => 'Registrazione area clienti non riuscita'], 500);
}

$insert->bind_param('ssssss', $fullName, $username, $email, $phone, $companyName, $passwordHash);
$ok = $insert->execute();
$insert->close();

if (!$ok) {
    client_auth_json(['message' => 'Registrazione area clienti non riuscita'], 500);
}

client_auth_json([
    'ok' => true,
    'message' => 'Registrazione completata. Ora puoi accedere con email e password.',
]);
