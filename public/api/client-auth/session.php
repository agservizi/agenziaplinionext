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

// Callers: Next /api/auth/session via proxy. Schema: username/userId top-level + user.*.
// User: procedi con tutto al 100%
client_auth_json([
    'ok' => true,
    'authenticated' => true,
    'username' => (string) $session['username'],
    'userId' => isset($session['userId']) ? (int) $session['userId'] : null,
    'user' => [
        'username' => (string) $session['username'],
        'userId' => isset($session['userId']) ? (int) $session['userId'] : null,
        'role' => 'client',
    ],
]);
