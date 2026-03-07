<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    public_api_json(['message' => 'Metodo non consentito.'], 405);
}

$db = public_api_db();
if (!$db) {
    public_api_json(['message' => public_api_db_error_message()], 503);
}

$bodyRaw = file_get_contents('php://input');
$body = is_string($bodyRaw) && trim($bodyRaw) !== '' ? json_decode($bodyRaw, true) : [];
$body = is_array($body) ? $body : [];

$serviceType = strtolower(trim((string) ($body['serviceType'] ?? '')));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$customerType = strtolower(trim((string) ($body['customerType'] ?? 'privato')));
$city = trim((string) ($body['city'] ?? ''));
$notes = trim((string) ($body['notes'] ?? ''));
$details = is_array($body['details'] ?? null) ? $body['details'] : [];

$serviceMap = [
    'pagamenti' => 'Pagamenti e bollettini',
    'telefonia' => 'Telefonia e internet',
    'energia' => 'Luce e gas',
    'digitali' => 'SPID, PEC e firma digitale',
    'web-agency' => 'Web agency',
    'spedizioni' => 'Spedizioni e logistica',
    'visure' => 'Visure e pratiche documentali',
    'caf-patronato' => 'CAF e Patronato',
];

if (!isset($serviceMap[$serviceType])) {
    public_api_json(['message' => 'Servizio non valido.'], 400);
}
if ($customerName === '' || !str_contains($email, '@') || $phone === '') {
    public_api_json(['message' => 'Compila almeno nome, email valida e telefono.'], 400);
}

$db->query("\n    CREATE TABLE IF NOT EXISTS client_area_requests (\n      id INT AUTO_INCREMENT PRIMARY KEY,\n      area VARCHAR(40) NOT NULL,\n      service_type VARCHAR(120) NOT NULL,\n      customer_name VARCHAR(191) NOT NULL,\n      email VARCHAR(191) NOT NULL,\n      phone VARCHAR(80) DEFAULT '',\n      notes TEXT DEFAULT '',\n      details_json JSON NULL,\n      status VARCHAR(40) NOT NULL DEFAULT 'new',\n      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n      KEY idx_client_area_requests_area (area),\n      KEY idx_client_area_requests_status (status)\n    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n");

$stmt = $db->prepare(
    "INSERT INTO client_area_requests
      (area, service_type, customer_name, email, phone, notes, details_json, status)
     VALUES ('consulenza-vetrina', ?, ?, ?, ?, ?, ?, 'new')"
);
if (!$stmt) {
    public_api_json(['message' => 'Impossibile registrare la richiesta.'], 500);
}

$detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$stmt->bind_param('ssssss', $serviceType, $customerName, $email, $phone, $notes, $detailsJson);
$stmt->execute();
$requestId = (int) $stmt->insert_id;
$stmt->close();

$dateCode = gmdate('Ymd');
$requestCode = 'CONS-' . $dateCode . '-' . str_pad((string) $requestId, 6, '0', STR_PAD_LEFT);
$serviceLabel = $serviceMap[$serviceType];

$resendKey = trim((string) (public_api_env('RESEND_API_KEY', '') ?: ''));
$resendFrom = trim((string) (public_api_env('RESEND_FROM', '') ?: ''));
$resendTo = trim((string) (public_api_env('RESEND_TO', $resendFrom) ?: $resendFrom));

if ($resendKey !== '' && $resendFrom !== '' && $resendTo !== '') {
    $backofficePayload = [
        'from' => $resendFrom,
        'to' => [$resendTo],
        'reply_to' => $email,
        'subject' => '[Consulenza Interattiva] Nuova richiesta ' . $requestCode,
        'text' => implode("\n", [
            'Nuova richiesta consulenza: ' . $requestCode,
            'Servizio: ' . $serviceLabel,
            'Cliente: ' . $customerName,
            'Email: ' . $email,
            'Telefono: ' . $phone,
            'Tipologia: ' . ($customerType === 'azienda' ? 'Azienda' : 'Privato'),
            'Citta: ' . ($city !== '' ? $city : 'Non indicata'),
        ]),
    ];
    try {
        public_api_http_request(
            'POST',
            'https://api.resend.com/emails',
            [
                'Authorization: Bearer ' . $resendKey,
                'Content-Type: application/json',
            ],
            json_encode($backofficePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    } catch (Throwable $error) {
        // Silent fail: request already saved.
    }

    if (str_contains($email, '@')) {
        $customerPayload = [
            'from' => $resendFrom,
            'to' => [$email],
            'subject' => 'Richiesta ricevuta: ' . $requestCode,
            'text' => implode("\n", [
                'Ciao ' . $customerName . ',',
                '',
                'abbiamo ricevuto la tua richiesta di consulenza.',
                'Servizio: ' . $serviceLabel,
                'Codice richiesta: ' . $requestCode,
                '',
                'Ti contatteremo a breve ai recapiti indicati.',
                '',
                'AG SERVIZI',
            ]),
        ];
        try {
            public_api_http_request(
                'POST',
                'https://api.resend.com/emails',
                [
                    'Authorization: Bearer ' . $resendKey,
                    'Content-Type: application/json',
                ],
                json_encode($customerPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        } catch (Throwable $error) {
            // Silent fail: request already saved.
        }
    }
}

public_api_json([
    'message' => 'Richiesta inviata con successo. Ti abbiamo mandato una conferma email con il codice pratica.',
    'requestId' => $requestId,
    'requestCode' => $requestCode,
], 200);
