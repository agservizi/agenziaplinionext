<?php

declare(strict_types=1);

function client_auth_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function client_auth_base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function client_auth_base64url_decode(string $value): string|false
{
    $padding = 4 - (strlen($value) % 4);
    if ($padding < 4) {
        $value .= str_repeat('=', $padding);
    }

    return base64_decode(strtr($value, '-_', '+/'), true);
}

function client_auth_env_map(): array
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

function client_auth_env(string $key, ?string $default = null): ?string
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

    $map = client_auth_env_map();
    if (array_key_exists($key, $map) && $map[$key] !== '') {
        return $map[$key];
    }

    return $default;
}

function client_auth_db(): ?mysqli
{
    static $connection = false;
    if ($connection instanceof mysqli) {
        return $connection;
    }
    if ($connection === null) {
        return null;
    }

    $host = client_auth_env('MYSQL_HOST', '');
    $user = client_auth_env('MYSQL_USER', '');
    $password = client_auth_env('MYSQL_PASSWORD', '');
    $database = client_auth_env('MYSQL_DATABASE', '');
    $port = (int) (client_auth_env('MYSQL_PORT', '3306') ?: '3306');

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

function client_auth_ensure_users_table(): void
{
    $db = client_auth_db();
    if (!$db) {
        return;
    }

    $db->query("
        CREATE TABLE IF NOT EXISTS client_portal_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(191) NOT NULL,
          username VARCHAR(191) NOT NULL,
          email VARCHAR(191) NOT NULL,
          phone VARCHAR(80) DEFAULT '',
          company_name VARCHAR(191) DEFAULT '',
          password_hash VARCHAR(255) NOT NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'active',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_client_portal_users_username (username),
          UNIQUE KEY uq_client_portal_users_email (email),
          KEY idx_client_portal_users_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function client_auth_parse_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function client_auth_secret(): string
{
    return trim((string) client_auth_env('CLIENT_PORTAL_SESSION_SECRET', 'ag-client-portal-dev-secret'));
}

function client_auth_env_username(): string
{
    return trim((string) client_auth_env('CLIENT_PORTAL_USERNAME', ''));
}

function client_auth_env_password(): string
{
    return trim((string) client_auth_env('CLIENT_PORTAL_PASSWORD', ''));
}

function client_auth_create_token(string $username, ?int $userId = null, string $source = 'env'): string
{
    $payload = client_auth_base64url_encode((string) json_encode([
        'username' => $username,
        'userId' => $userId,
        'source' => $source,
        'exp' => (int) round(microtime(true) * 1000) + (1000 * 60 * 60 * 12),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    $signature = client_auth_base64url_encode(hash_hmac('sha256', $payload, client_auth_secret(), true));
    return $payload . '.' . $signature;
}

function client_auth_verify_token(string $token): ?array
{
    $parts = explode('.', $token, 2);
    if (count($parts) !== 2 || $parts[0] === '' || $parts[1] === '') {
        return null;
    }

    [$payload, $signature] = $parts;
    $expected = client_auth_base64url_encode(hash_hmac('sha256', $payload, client_auth_secret(), true));
    if (!hash_equals($expected, $signature)) {
        return null;
    }

    $decoded = client_auth_base64url_decode($payload);
    if ($decoded === false) {
        return null;
    }

    $parsed = json_decode($decoded, true);
    if (!is_array($parsed) || empty($parsed['username']) || empty($parsed['exp'])) {
        return null;
    }

    if ((int) $parsed['exp'] < (int) round(microtime(true) * 1000)) {
        return null;
    }

    if (($parsed['source'] ?? '') === 'env') {
        $envUsername = client_auth_env_username();
        if ($envUsername === '' || $parsed['username'] !== $envUsername) {
            return null;
        }
    }

    return $parsed;
}

function client_auth_hash_password(string $password): string
{
    return password_hash($password, PASSWORD_DEFAULT);
}

function client_auth_verify_password(string $password, string $storedHash): bool
{
    if ($storedHash === '') {
        return false;
    }

    if (str_contains($storedHash, ':')) {
        // Legacy Node scrypt hash; keep fallback env access but do not silently accept invalid legacy hashes.
        return false;
    }

    return password_verify($password, $storedHash);
}

function client_auth_get_user_by_session(array $session): ?array
{
    if (($session['source'] ?? '') !== 'db') {
        return null;
    }

    $db = client_auth_db();
    if (!$db) {
        return null;
    }

    client_auth_ensure_users_table();
    $numericUserId = (int) ($session['userId'] ?? 0);

    if ($numericUserId > 0) {
        $stmt = $db->prepare('
            SELECT id, full_name, username, email, phone, company_name, password_hash, status
            FROM client_portal_users
            WHERE id = ?
            LIMIT 1
        ');
        if ($stmt) {
            $stmt->bind_param('i', $numericUserId);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result ? $result->fetch_assoc() : null;
            $stmt->close();
            if ($user) {
                return $user;
            }
        }
    }

    $identifier = strtolower((string) ($session['username'] ?? ''));
    $stmt = $db->prepare('
        SELECT id, full_name, username, email, phone, company_name, password_hash, status
        FROM client_portal_users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
        LIMIT 1
    ');
    if (!$stmt) {
        return null;
    }

    $stmt->bind_param('ss', $identifier, $identifier);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    return $user ?: null;
}
