<?php

declare(strict_types=1);

function public_api_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function public_api_env_map(): array
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
                $value = trim(substr($trimmed, $separator + 1));

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

function public_api_env(string $key, ?string $default = null): ?string
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

    $map = public_api_env_map();
    if (array_key_exists($key, $map) && $map[$key] !== '') {
        return $map[$key];
    }

    return $default;
}

function public_api_db(): ?mysqli
{
    static $connection = false;
    global $PUBLIC_API_DB_STATUS;
    $PUBLIC_API_DB_STATUS = $PUBLIC_API_DB_STATUS ?? 'uninitialized';
    if ($connection instanceof mysqli) {
        $PUBLIC_API_DB_STATUS = 'connected';
        return $connection;
    }
    if ($connection === null) {
        return null;
    }

    if (!class_exists('mysqli')) {
        $PUBLIC_API_DB_STATUS = 'mysqli_unavailable';
        $connection = null;
        return null;
    }

    $host = public_api_env('MYSQL_HOST', '');
    $user = public_api_env('MYSQL_USER', '');
    $password = public_api_env('MYSQL_PASSWORD', '');
    $database = public_api_env('MYSQL_DATABASE', '');
    $port = (int) (public_api_env('MYSQL_PORT', '3306') ?: '3306');

    if (!$host || !$user || !$database) {
        $PUBLIC_API_DB_STATUS = 'config_missing';
        $connection = null;
        return null;
    }

    $mysqli = @new mysqli($host, $user, $password, $database, $port);
    if ($mysqli->connect_errno) {
        $PUBLIC_API_DB_STATUS = 'connect_failed';
        $connection = null;
        return null;
    }

    $mysqli->set_charset('utf8mb4');
    $PUBLIC_API_DB_STATUS = 'connected';
    $connection = $mysqli;

    return $connection;
}

function public_api_db_error_message(): string
{
    global $PUBLIC_API_DB_STATUS;
    static $messages = [
        'config_missing' => 'Configurazione MySQL assente',
        'connect_failed' => 'Connessione MySQL non riuscita',
        'mysqli_unavailable' => 'Estensione mysqli non disponibile',
        'connected' => '',
        'uninitialized' => 'Connessione MySQL non riuscita',
    ];

    public_api_db();
    $status = (string) ($PUBLIC_API_DB_STATUS ?? 'uninitialized');

    return $messages[$status] ?? 'Connessione MySQL non riuscita';
}

function public_api_ensure_shipping_pricing_table(): void
{
    $db = public_api_db();
    if (!$db) {
        return;
    }

    $db->query("
        CREATE TABLE IF NOT EXISTS shipping_pricing_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          label VARCHAR(191) NOT NULL,
          service_scope VARCHAR(20) NOT NULL DEFAULT 'all',
          country_code VARCHAR(8) NOT NULL DEFAULT '',
          min_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
          max_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
          min_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
          max_volume_m3 DECIMAL(10,4) NOT NULL DEFAULT 0,
          price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
          sort_order INT NOT NULL DEFAULT 0,
          active TINYINT(1) NOT NULL DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Backward-compatible migration for existing installations.
    @$db->query("ALTER TABLE shipping_pricing_rules ADD COLUMN service_scope VARCHAR(20) NOT NULL DEFAULT 'all' AFTER label");
    @$db->query("ALTER TABLE shipping_pricing_rules ADD COLUMN country_code VARCHAR(8) NOT NULL DEFAULT '' AFTER service_scope");
}

function public_api_ensure_visure_pricing_table(): void
{
    $db = public_api_db();
    if (!$db) {
        return;
    }

    $db->query("
        CREATE TABLE IF NOT EXISTS visure_pricing_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          service_type VARCHAR(120) NOT NULL,
          label VARCHAR(191) NOT NULL,
          price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
          sort_order INT NOT NULL DEFAULT 0,
          active TINYINT(1) NOT NULL DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_visure_pricing_service (service_type),
          KEY idx_visure_pricing_active (active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function public_api_brt_pudo_config(): array
{
    return [
        'pudoBaseUrl' => public_api_brt_pudo_base_url((string) (public_api_env('BRT_PUDO_BASE_URL', '') ?: '')),
        'pudoAuthToken' => trim((string) (public_api_env('BRT_PUDO_AUTH_TOKEN', public_api_env('BRT_PUDO_API_AUTH', '')) ?: '')),
        'apiKey' => trim((string) (public_api_env('BRT_API_KEY', '') ?: '')),
    ];
}

function public_api_brt_pudo_base_url(string $value): string
{
    $baseUrl = rtrim(trim($value), '/');

    if ($baseUrl === '') {
        return '';
    }
    if (str_ends_with($baseUrl, '/get-pudo-by-address')) {
        return $baseUrl;
    }
    if (str_ends_with($baseUrl, '/pickup')) {
        return $baseUrl . '/get-pudo-by-address';
    }

    return $baseUrl;
}

function public_api_brt_pudo_country_code(string $value): string
{
    static $alpha3 = [
        'AT' => 'AUT',
        'BE' => 'BEL',
        'BG' => 'BGR',
        'CH' => 'CHE',
        'CY' => 'CYP',
        'CZ' => 'CZE',
        'DE' => 'DEU',
        'DK' => 'DNK',
        'EE' => 'EST',
        'ES' => 'ESP',
        'FI' => 'FIN',
        'FR' => 'FRA',
        'GB' => 'GBR',
        'GR' => 'GRC',
        'HR' => 'HRV',
        'HU' => 'HUN',
        'IE' => 'IRL',
        'IT' => 'ITA',
        'LT' => 'LTU',
        'LU' => 'LUX',
        'LV' => 'LVA',
        'MT' => 'MLT',
        'NL' => 'NLD',
        'NO' => 'NOR',
        'PL' => 'POL',
        'PT' => 'PRT',
        'RO' => 'ROU',
        'SE' => 'SWE',
        'SI' => 'SVN',
        'SK' => 'SVK',
        'US' => 'USA',
    ];

    $country = strtoupper(trim($value));
    if ($country === '') {
        return 'ITA';
    }
    if (strlen($country) === 3) {
        return $country;
    }

    return $alpha3[$country] ?? $country;
}

function public_api_brt_pudo_missing_config(): array
{
    $config = public_api_brt_pudo_config();
    $missing = [];

    if ($config['pudoBaseUrl'] === '') {
        $missing[] = 'BRT_PUDO_BASE_URL';
    }
    if ($config['pudoAuthToken'] === '') {
        $missing[] = 'BRT_PUDO_AUTH_TOKEN';
    }

    return $missing;
}

function public_api_http_request(string $method, string $url, array $headers = [], ?string $body = null): array
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
    $statusText = '';

    if ($responseBody === false) {
        throw new RuntimeException($error ?: 'Richiesta HTTP non riuscita');
    }

    $json = json_decode($responseBody, true);

    return [
        'status' => $status,
        'statusText' => $statusText,
        'body' => $responseBody,
        'json' => is_array($json) ? $json : null,
    ];
}

function public_api_brt_pudo_points(mixed $value): array
{
    $rawItems = [];

    if (is_array($value)) {
        if (array_is_list($value)) {
            $rawItems = $value;
        } elseif (isset($value['pudo']) && is_array($value['pudo'])) {
            $rawItems = $value['pudo'];
        } elseif (isset($value['items']) && is_array($value['items'])) {
            $rawItems = $value['items'];
        } elseif (isset($value['results']) && is_array($value['results'])) {
            $rawItems = $value['results'];
        } elseif (isset($value['pickupPoints']) && is_array($value['pickupPoints'])) {
            $rawItems = $value['pickupPoints'];
        } elseif (isset($value['data']) && is_array($value['data'])) {
            $rawItems = $value['data'];
        }
    }

    $points = [];
    foreach ($rawItems as $item) {
        if (!is_array($item)) {
            continue;
        }

        $id = trim((string) ($item['id'] ?? $item['pudoId'] ?? $item['pickupPointId'] ?? ''));
        if ($id === '') {
            continue;
        }

        $points[] = [
            'id' => $id,
            'name' => trim((string) ($item['name'] ?? $item['pointName'] ?? $item['description'] ?? $item['companyName'] ?? '')),
            'address' => trim((string) ($item['address'] ?? $item['fullAddress'] ?? $item['street'] ?? $item['locationAddress'] ?? '')),
            'zipCode' => trim((string) ($item['zipCode'] ?? $item['postalCode'] ?? '')),
            'city' => trim((string) ($item['city'] ?? $item['locality'] ?? $item['town'] ?? '')),
            'province' => trim((string) ($item['province'] ?? $item['state'] ?? $item['department'] ?? '')),
            'country' => strtoupper(trim((string) ($item['country'] ?? $item['countryCode'] ?? ''))),
        ];
    }

    return $points;
}
