<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$body = admin_auth_parse_json_body();
$username = trim((string) ($body['username'] ?? ''));
$password = trim((string) ($body['password'] ?? ''));

if ($username === '' || $password === '') {
    admin_auth_json(['message' => 'Inserisci username e password.'], 400);
}

if (admin_auth_username() === '' || admin_auth_password() === '') {
    admin_auth_json(['message' => 'Credenziali admin non configurate.'], 503);
}

if (!hash_equals(admin_auth_username(), $username) || !hash_equals(admin_auth_password(), $password)) {
    admin_auth_json(['message' => 'Credenziali non valide.'], 401);
}

admin_auth_json([
    'ok' => true,
    'token' => admin_auth_create_token(),
]);
