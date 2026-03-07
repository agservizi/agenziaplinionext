<?php

declare(strict_types=1);

const BOOKING_OPEN_HOUR = 9;
const BOOKING_MIDDAY_CLOSE_HOUR = 13;
const BOOKING_AFTERNOON_OPEN_HOUR = 16;
const BOOKING_AFTERNOON_OPEN_MINUTE = 20;
const BOOKING_CLOSE_HOUR = 18;
const BOOKING_CLOSE_MINUTE = 30;
const BOOKING_SATURDAY_OPEN_HOUR = 9;
const BOOKING_SATURDAY_OPEN_MINUTE = 20;
const BOOKING_SATURDAY_CLOSE_HOUR = 12;
const BOOKING_SATURDAY_CLOSE_MINUTE = 30;

function booking_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function booking_base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function booking_env_map(): array
{
    static $env = null;
    if ($env !== null) {
        return $env;
    }

    $env = [];
    $current = __DIR__;

    for ($i = 0; $i < 6; $i++) {
        $candidate = $current . DIRECTORY_SEPARATOR . '.env';
        if (is_file($candidate) && is_readable($candidate)) {
            $lines = file($candidate, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                    continue;
                }

                $separator = strpos($trimmed, '=');
                if ($separator === false) {
                    continue;
                }

                $key = trim(substr($trimmed, 0, $separator));
                $value = substr($trimmed, $separator + 1);
                $value = trim($value);

                if ($key === '') {
                    continue;
                }

                if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                    $value = substr($value, 1, -1);
                }

                $env[$key] = $value;
            }
            break;
        }

        $parent = dirname($current);
        if ($parent === $current) {
            break;
        }
        $current = $parent;
    }

    return $env;
}

function booking_env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return (string) $value;
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string) $_SERVER[$key];
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string) $_ENV[$key];
    }

    $map = booking_env_map();
    if (array_key_exists($key, $map) && $map[$key] !== '') {
        return $map[$key];
    }

    return $default;
}

function booking_config(): array
{
    $timezone = booking_env('GOOGLE_CALENDAR_TIMEZONE', 'Europe/Rome') ?: 'Europe/Rome';
    $duration = (int) (booking_env('GOOGLE_CALENDAR_DEFAULT_DURATION', '60') ?: '60');

    return [
        'enabled' => booking_env('GOOGLE_CALENDAR_ENABLED', 'false') === 'true',
        'calendarId' => booking_env('GOOGLE_CALENDAR_CALENDAR_ID', '') ?: '',
        'timezone' => $timezone,
        'defaultDuration' => $duration > 0 ? $duration : 60,
        'inviteClient' => booking_env('GOOGLE_CALENDAR_INVITE_CLIENT', 'true') === 'true',
        'sendUpdates' => booking_env('GOOGLE_CALENDAR_SEND_UPDATES', 'none') ?: 'none',
    ];
}

function booking_decode_credentials(): ?array
{
    $encoded = booking_env('GOOGLE_CALENDAR_CREDENTIALS_JSON', '');
    if (!$encoded) {
        return null;
    }

    $decoded = base64_decode($encoded, true);
    if ($decoded === false) {
        return null;
    }

    $credentials = json_decode($decoded, true);
    return is_array($credentials) ? $credentials : null;
}

function booking_http_request(string $method, string $url, array $headers = [], ?string $body = null): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $responseBody = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);

    if ($responseBody === false) {
        throw new RuntimeException($error ?: 'Richiesta HTTP non riuscita');
    }

    return [
        'status' => $status,
        'body' => $responseBody,
        'json' => json_decode($responseBody, true),
    ];
}

function booking_google_access_token(): string
{
    $credentials = booking_decode_credentials();
    if (!$credentials || empty($credentials['client_email']) || empty($credentials['private_key']) || empty($credentials['token_uri'])) {
        throw new RuntimeException('Credenziali Google Calendar non valide');
    }

    $now = time();
    $header = booking_base64url_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = booking_base64url_encode(json_encode([
        'iss' => $credentials['client_email'],
        'scope' => 'https://www.googleapis.com/auth/calendar',
        'aud' => $credentials['token_uri'],
        'exp' => $now + 3600,
        'iat' => $now,
    ]));

    $signatureInput = $header . '.' . $claims;
    $privateKey = openssl_pkey_get_private($credentials['private_key']);
    if ($privateKey === false) {
        throw new RuntimeException('Chiave privata Google non valida');
    }

    $signature = '';
    $ok = openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);
    openssl_free_key($privateKey);

    if (!$ok) {
        throw new RuntimeException('Firma JWT Google non riuscita');
    }

    $assertion = $signatureInput . '.' . booking_base64url_encode($signature);
    $tokenResponse = booking_http_request(
        'POST',
        $credentials['token_uri'],
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ]),
    );

    if ($tokenResponse['status'] < 200 || $tokenResponse['status'] >= 300 || !is_array($tokenResponse['json']) || empty($tokenResponse['json']['access_token'])) {
        throw new RuntimeException('Token Google Calendar non disponibile');
    }

    return (string) $tokenResponse['json']['access_token'];
}

function booking_calendar_request(string $method, string $path, array $query = [], ?array $body = null): array
{
    $token = booking_google_access_token();
    $url = 'https://www.googleapis.com/calendar/v3/' . ltrim($path, '/');
    if ($query) {
        $url .= '?' . http_build_query($query);
    }

    $headers = [
        'Authorization: Bearer ' . $token,
        'Accept: application/json',
    ];

    $payload = null;
    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        $payload = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    return booking_http_request($method, $url, $headers, $payload);
}

function booking_build_slots(string $dateIso, string $timezone, int $durationMinutes): array
{
    $tz = new DateTimeZone($timezone);
    $date = DateTimeImmutable::createFromFormat('Y-m-d', $dateIso, $tz);
    if (!$date) {
        return [];
    }

    $weekday = (int) $date->format('N');
    if ($weekday === 7) {
        return [];
    }

    $interval = new DateInterval('PT' . $durationMinutes . 'M');
    $slots = [];

    $pushRange = static function (DateTimeImmutable $rangeStart, DateTimeImmutable $rangeEnd) use (&$slots, $interval): void {
        $cursor = $rangeStart;

        while ($cursor->add($interval) <= $rangeEnd) {
            $end = $cursor->add($interval);
            $slots[] = [
                'start' => $cursor->format(DATE_ATOM),
                'end' => $end->format(DATE_ATOM),
                'label' => $cursor->format('H:i'),
            ];
            $cursor = $end;
        }
    };

    if ($weekday === 6) {
        $pushRange(
            $date->setTime(BOOKING_SATURDAY_OPEN_HOUR, BOOKING_SATURDAY_OPEN_MINUTE),
            $date->setTime(BOOKING_SATURDAY_CLOSE_HOUR, BOOKING_SATURDAY_CLOSE_MINUTE)
        );
    } else {
        $pushRange(
            $date->setTime(BOOKING_OPEN_HOUR, 0),
            $date->setTime(BOOKING_MIDDAY_CLOSE_HOUR, 0)
        );
        $pushRange(
            $date->setTime(BOOKING_AFTERNOON_OPEN_HOUR, BOOKING_AFTERNOON_OPEN_MINUTE),
            $date->setTime(BOOKING_CLOSE_HOUR, BOOKING_CLOSE_MINUTE)
        );
    }

    return $slots;
}

function booking_busy_ranges(array $items, string $dayIso, string $timezone): array
{
    $tz = new DateTimeZone($timezone);
    $ranges = [];
    $day = DateTimeImmutable::createFromFormat('Y-m-d', $dayIso, $tz);
    if (!$day) {
        return $ranges;
    }

    $dayStart = $day->setTime(0, 0, 0);
    $dayEnd = $day->setTime(23, 59, 59);

    foreach ($items as $item) {
        $startValue = $item['start']['dateTime'] ?? null;
        $endValue = $item['end']['dateTime'] ?? null;

        if ($startValue && $endValue) {
            $start = new DateTimeImmutable((string) $startValue);
            $end = new DateTimeImmutable((string) $endValue);
            $ranges[] = [$start->getTimestamp(), $end->getTimestamp()];
            continue;
        }

        if (!empty($item['start']['date']) && !empty($item['end']['date'])) {
            $ranges[] = [$dayStart->getTimestamp(), $dayEnd->getTimestamp()];
        }
    }

    return $ranges;
}

function booking_exclude_busy(array $slots, array $busyRanges): array
{
    return array_values(array_filter($slots, static function (array $slot) use ($busyRanges): bool {
        $slotStart = strtotime($slot['start']);
        $slotEnd = strtotime($slot['end']);

        foreach ($busyRanges as [$busyStart, $busyEnd]) {
            if ($slotStart < $busyEnd && $slotEnd > $busyStart) {
                return false;
            }
        }

        return true;
    }));
}

function booking_parse_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function booking_db(): ?mysqli
{
    static $connection = false;
    if ($connection instanceof mysqli) {
        return $connection;
    }
    if ($connection === null) {
        return null;
    }

    $host = booking_env('MYSQL_HOST', '');
    $user = booking_env('MYSQL_USER', '');
    $password = booking_env('MYSQL_PASSWORD', '');
    $database = booking_env('MYSQL_DATABASE', '');
    $port = (int) (booking_env('MYSQL_PORT', '3306') ?: '3306');

    if (!$host || !$user || !$database) {
        $connection = null;
        return null;
    }

    $mysqli = @new mysqli($host, $user, $password, $database, $port);
    if ($mysqli->connect_errno) {
        $connection = null;
        return null;
    }

    $mysqli->set_charset('utf8mb4');
    $connection = $mysqli;

    return $connection;
}

function booking_ensure_requests_table(): void
{
    $db = booking_db();
    if (!$db) {
        return;
    }

    $db->query("
        CREATE TABLE IF NOT EXISTS booking_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          google_event_id VARCHAR(191) DEFAULT NULL,
          name VARCHAR(191) NOT NULL,
          email VARCHAR(191) NOT NULL,
          phone VARCHAR(80) NOT NULL,
          service VARCHAR(191) NOT NULL,
          start_at DATETIME NOT NULL,
          end_at DATETIME NOT NULL,
          notes TEXT DEFAULT '',
          status VARCHAR(40) NOT NULL DEFAULT 'confirmed',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_booking_requests_start (start_at),
          KEY idx_booking_requests_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function booking_store_request(?string $eventId, string $name, string $email, string $phone, string $service, DateTimeImmutable $start, DateTimeImmutable $end, string $notes): void
{
    $db = booking_db();
    if (!$db) {
        return;
    }

    booking_ensure_requests_table();
    $stmt = $db->prepare("
        INSERT INTO booking_requests (google_event_id, name, email, phone, service, start_at, end_at, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())
    ");

    if (!$stmt) {
        return;
    }

    $startAt = $start->format('Y-m-d H:i:s');
    $endAt = $end->format('Y-m-d H:i:s');
    $stmt->bind_param('ssssssss', $eventId, $name, $email, $phone, $service, $startAt, $endAt, $notes);
    $stmt->execute();
    $stmt->close();
}
