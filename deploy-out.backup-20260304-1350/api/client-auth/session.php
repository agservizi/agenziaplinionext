<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_auth_json(['message' => 'Metodo non consentito'], 405);
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

client_auth_json([
    'ok' => true,
    'authenticated' => true,
    'user' => [
        'username' => (string) $session['username'],
        'role' => 'client',
    ],
]);
