<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$body = admin_auth_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));

if ($token === '') {
    admin_auth_json(['message' => 'Token admin mancante.'], 400);
}

$session = admin_auth_verify_token($token);
if (!$session) {
    admin_auth_json(['message' => 'Sessione admin non valida.'], 401);
}

admin_auth_json([
    'ok' => true,
    'session' => $session,
]);
