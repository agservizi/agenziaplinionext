<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$host = public_api_env('MYSQL_HOST', '');
$user = public_api_env('MYSQL_USER', '');
$database = public_api_env('MYSQL_DATABASE', '');
$port = (int) (public_api_env('MYSQL_PORT', '3306') ?: '3306');

$db = public_api_db();
$dbMessage = public_api_db_error_message();

public_api_json([
    'ok' => $db instanceof mysqli,
    'phpVersion' => PHP_VERSION,
    'mysqliLoaded' => class_exists('mysqli'),
    'envDetected' => [
        'mysqlHost' => $host !== '',
        'mysqlUser' => $user !== '',
        'mysqlDatabase' => $database !== '',
        'mysqlPort' => $port,
    ],
    'dbStatus' => $db instanceof mysqli ? 'connected' : 'not_connected',
    'message' => $db instanceof mysqli ? 'Connessione MySQL attiva' : $dbMessage,
]);
