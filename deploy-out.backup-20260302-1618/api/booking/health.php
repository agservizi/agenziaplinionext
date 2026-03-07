<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$config = booking_config();
$credentials = booking_decode_credentials();

booking_json([
    'ok' => $config['enabled'] && $config['calendarId'] !== '' && is_array($credentials),
    'checks' => [
        'enabled' => $config['enabled'],
        'calendarId' => $config['calendarId'] !== '',
        'credentials' => is_array($credentials),
        'timezone' => $config['timezone'] !== '',
        'duration' => (int) $config['defaultDuration'] > 0,
        'invite' => true,
        'updates' => $config['sendUpdates'] !== '',
    ],
]);
