<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$ip =
    (string) ($_SERVER['SERVER_ADDR'] ?? '') ?:
    (string) ($_SERVER['LOCAL_ADDR'] ?? '') ?:
    gethostbyname((string) ($_SERVER['SERVER_NAME'] ?? gethostname()));

public_api_json([
    'ok' => $ip !== '',
    'serverIp' => $ip,
    'serverName' => (string) ($_SERVER['SERVER_NAME'] ?? ''),
    'message' => $ip !== '' ? 'IP del server rilevato' : 'IP del server non disponibile',
]);
