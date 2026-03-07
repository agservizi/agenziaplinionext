<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_auth_json(['message' => 'Metodo non consentito'], 405);
}

$body = client_auth_parse_json_body();
$username = trim((string) ($body['username'] ?? ''));
$password = trim((string) ($body['password'] ?? ''));

if ($username === '' || $password === '') {
    client_auth_json(['message' => 'Inserisci nome utente e password'], 400);
}

$db = client_auth_db();
if ($db) {
    client_auth_ensure_users_table();
    $identifier = strtolower($username);
    $stmt = $db->prepare('
        SELECT id, username, email, password_hash, status
        FROM client_portal_users
        WHERE LOWER(username) = ? OR LOWER(email) = ?
        LIMIT 1
    ');

    if ($stmt) {
        $stmt->bind_param('ss', $identifier, $identifier);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result ? $result->fetch_assoc() : null;
        $stmt->close();

        if ($user && (($user['status'] ?? 'active') === 'active')) {
            $storedHash = (string) ($user['password_hash'] ?? '');
            if (!client_auth_verify_password($password, $storedHash)) {
                client_auth_json(['message' => 'Credenziali non valide'], 401);
            }

            $resolvedUsername = (string) ($user['username'] ?: $user['email'] ?: $username);
            client_auth_json([
                'ok' => true,
                'token' => client_auth_create_token($resolvedUsername, (int) ($user['id'] ?? 0) ?: null, 'db'),
                'user' => [
                    'username' => $resolvedUsername,
                    'role' => 'client',
                    'source' => 'database',
                ],
            ]);
        }
    }
}

$envUsername = client_auth_env_username();
$envPassword = client_auth_env_password();

if ($envUsername === '' || $envPassword === '') {
    client_auth_json(['message' => 'Credenziali non valide'], 401);
}

if ($username !== $envUsername || $password !== $envPassword) {
    client_auth_json(['message' => 'Credenziali non valide'], 401);
}

client_auth_json([
    'ok' => true,
    'token' => client_auth_create_token($envUsername, null, 'env'),
    'user' => [
        'username' => $envUsername,
        'role' => 'client',
        'source' => 'env',
    ],
]);
