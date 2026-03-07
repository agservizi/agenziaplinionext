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

if (($session['source'] ?? '') === 'env') {
    client_auth_json([
        'ok' => true,
        'editable' => false,
        'profile' => [
            'fullName' => 'Accesso di fallback',
            'username' => (string) $session['username'],
            'email' => '',
            'phone' => '',
            'companyName' => '',
            'source' => 'env',
        ],
    ]);
}

$user = client_auth_get_user_by_session($session);
if (!$user || (($user['status'] ?? 'active') !== 'active')) {
    client_auth_json(['message' => 'Profilo cliente non trovato'], 404);
}

client_auth_json([
    'ok' => true,
    'editable' => true,
    'profile' => [
        'fullName' => (string) ($user['full_name'] ?? ''),
        'username' => (string) ($user['username'] ?? ''),
        'email' => (string) ($user['email'] ?? ''),
        'phone' => (string) ($user['phone'] ?? ''),
        'companyName' => (string) ($user['company_name'] ?? ''),
        'source' => 'db',
    ],
]);
