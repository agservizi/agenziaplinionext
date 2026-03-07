<?php

declare(strict_types=1);

require_once __DIR__ . '/../public/bootstrap.php';

function client_area_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function client_area_parse_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $parsed = json_decode($raw, true);
    return is_array($parsed) ? $parsed : [];
}

function client_area_db(): ?mysqli
{
    return public_api_db();
}

function client_area_require_db(): mysqli
{
    $db = client_area_db();
    if (!$db) {
        client_area_json(['message' => public_api_db_error_message()], 503);
    }

    return $db;
}

function client_area_has_database_config(): bool
{
    return public_api_env('MYSQL_HOST', '') !== ''
        && public_api_env('MYSQL_USER', '') !== ''
        && public_api_env('MYSQL_PASSWORD', '') !== ''
        && public_api_env('MYSQL_DATABASE', '') !== '';
}

function client_area_decode_json_value(mixed $value): array
{
    if (is_array($value)) {
        return $value;
    }

    if (!is_string($value) || trim($value) === '') {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function client_area_supported_visura_services(): array
{
    return [
        'visura-camerale',
        'visura-catastale',
        'visura-pra',
        'visura-crif',
        'visura-cr',
    ];
}

function client_area_ensure_client_area_requests_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_requests (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          area VARCHAR(40) NOT NULL,\n          service_type VARCHAR(120) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) DEFAULT '',\n          notes TEXT DEFAULT '',\n          details_json JSON NULL,\n          status VARCHAR(40) NOT NULL DEFAULT 'new',\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_client_area_requests_area (area),\n          KEY idx_client_area_requests_status (status)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_ensure_client_area_visure_requests_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_visure_requests (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          provider VARCHAR(80) NOT NULL DEFAULT '',\n          provider_service VARCHAR(191) NOT NULL DEFAULT '',\n          provider_request_id VARCHAR(191) NOT NULL DEFAULT '',\n          provider_status VARCHAR(80) NOT NULL DEFAULT '',\n          document_url TEXT NULL,\n          provider_response_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_client_area_visure_requests_request (request_id),\n          KEY idx_client_area_visure_requests_provider_status (provider_status)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_ensure_client_area_payments_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_payments (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          shipment_id INT NULL,\n          stripe_session_id VARCHAR(191) NOT NULL,\n          amount_cents INT NOT NULL DEFAULT 0,\n          currency VARCHAR(8) NOT NULL DEFAULT 'eur',\n          payment_status VARCHAR(40) NOT NULL DEFAULT '',\n          checkout_status VARCHAR(40) NOT NULL DEFAULT '',\n          price_label VARCHAR(191) NOT NULL DEFAULT '',\n          stripe_response_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_payments_session (stripe_session_id),\n          KEY idx_client_area_payments_request (request_id),\n          KEY idx_client_area_payments_shipment (shipment_id)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_ensure_client_area_invoices_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_invoices (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          payment_id INT NULL,\n          shipment_id INT NULL,\n          provider VARCHAR(80) NOT NULL DEFAULT 'pending',\n          provider_document_id VARCHAR(191) NOT NULL DEFAULT '',\n          status VARCHAR(60) NOT NULL DEFAULT 'pending_provider_config',\n          invoice_pdf_url TEXT NULL,\n          billing_json JSON NULL,\n          provider_payload_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_client_area_invoices_request (request_id),\n          KEY idx_client_area_invoices_payment (payment_id),\n          KEY idx_client_area_invoices_status (status)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_ensure_client_area_consulting_leads_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_consulting_leads (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          service_type VARCHAR(40) NOT NULL,\n          customer_type VARCHAR(40) NOT NULL DEFAULT 'privato',\n          business_name VARCHAR(191) NOT NULL DEFAULT '',\n          vat_number VARCHAR(40) NOT NULL DEFAULT '',\n          current_provider VARCHAR(191) NOT NULL DEFAULT '',\n          monthly_spend_eur DECIMAL(10,2) NOT NULL DEFAULT 0,\n          city VARCHAR(120) NOT NULL DEFAULT '',\n          best_contact_time VARCHAR(120) NOT NULL DEFAULT '',\n          privacy_consent TINYINT(1) NOT NULL DEFAULT 0,\n          marketing_consent TINYINT(1) NOT NULL DEFAULT 0,\n          lead_status VARCHAR(40) NOT NULL DEFAULT 'nuova',\n          intake_payload_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_consulting_request (request_id),\n          KEY idx_client_area_consulting_status (lead_status),\n          KEY idx_client_area_consulting_service (service_type)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_resolve_visura_price(string $serviceType): array
{
    $fallback = [
        'visura-camerale' => ['amountCents' => 890, 'label' => 'Visura camerale base'],
        'visura-catastale' => ['amountCents' => 1090, 'label' => 'Visura catastale base'],
        'visura-pra' => ['amountCents' => 1290, 'label' => 'Visura PRA base'],
        'visura-crif' => ['amountCents' => 1990, 'label' => 'Visura CRIF base'],
        'visura-cr' => ['amountCents' => 2190, 'label' => 'Visura Centrale Rischi base'],
    ][$serviceType] ?? ['amountCents' => 0, 'label' => 'Visura'];

    if (!client_area_has_database_config()) {
        return $fallback;
    }

    $db = client_area_db();
    if (!$db) {
        return $fallback;
    }

    public_api_ensure_visure_pricing_table();
    $stmt = $db->prepare(
        'SELECT label, price_eur
         FROM visure_pricing_rules
         WHERE service_type = ? AND active = 1
         ORDER BY sort_order ASC, id ASC
         LIMIT 1'
    );

    if (!$stmt) {
        return $fallback;
    }

    $stmt->bind_param('s', $serviceType);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$row) {
        return $fallback;
    }

    $priceEUR = (float) ($row['price_eur'] ?? 0);
    if ($priceEUR <= 0) {
        return $fallback;
    }

    return [
        'amountCents' => (int) round($priceEUR * 100),
        'label' => trim((string) ($row['label'] ?? '')) !== '' ? (string) $row['label'] : $fallback['label'],
    ];
}

function client_area_stripe_secret_key(): string
{
    return trim((string) (public_api_env('STRIPE_SECRET_KEY', public_api_env('STRIPE_SECRET', '')) ?: ''));
}

function client_area_http_retry_attempts(): int
{
    $value = (int) (public_api_env('CLIENT_AREA_HTTP_RETRY_ATTEMPTS', '2') ?: '2');
    if ($value < 1) {
        return 1;
    }

    return min($value, 3);
}

function client_area_http_connect_timeout_seconds(): int
{
    $value = (int) (public_api_env('CLIENT_AREA_HTTP_CONNECT_TIMEOUT_SECONDS', '10') ?: '10');
    return $value > 0 ? $value : 10;
}

function client_area_http_timeout_seconds(): int
{
    $value = (int) (public_api_env('CLIENT_AREA_HTTP_TIMEOUT_SECONDS', '45') ?: '45');
    return $value > 0 ? $value : 45;
}

function client_area_log_enabled(): bool
{
    $value = strtolower(trim((string) (public_api_env('CLIENT_AREA_LOG_ERRORS', 'true') ?: 'true')));
    return !in_array($value, ['0', 'false', 'no', 'off'], true);
}

function client_area_log_error(string $scope, string $message, array $context = []): void
{
    if (!client_area_log_enabled()) {
        return;
    }

    $entry = ['scope' => $scope, 'message' => $message];
    if ($context !== []) {
        $entry['context'] = $context;
    }

    error_log('[client-area] ' . json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function client_area_notify_event(
    string $area,
    string $title,
    string $customerName,
    string $customerEmail,
    string $customerPhone = '',
    array $details = []
): array {
    $persistNotificationLog = static function (
        string $areaValue,
        string $titleValue,
        string $customerNameValue,
        string $customerEmailValue,
        string $customerPhoneValue,
        array $detailsValue,
        string $sendStatus,
        string $sendReason,
        int $responseStatus,
        string $errorMessage,
        string $providerMessageId
    ): void {
        if (!client_area_has_database_config()) {
            return;
        }

        $db = client_area_db();
        if (!$db) {
            return;
        }

        $db->query("\n            CREATE TABLE IF NOT EXISTS client_area_email_notifications (\n              id INT AUTO_INCREMENT PRIMARY KEY,\n              area VARCHAR(60) NOT NULL,\n              title VARCHAR(191) NOT NULL,\n              customer_name VARCHAR(191) NOT NULL DEFAULT '',\n              customer_email VARCHAR(191) NOT NULL DEFAULT '',\n              customer_phone VARCHAR(80) NOT NULL DEFAULT '',\n              details_json JSON NULL,\n              send_status VARCHAR(40) NOT NULL DEFAULT 'failed',\n              send_reason VARCHAR(80) NOT NULL DEFAULT '',\n              response_status INT NOT NULL DEFAULT 0,\n              error_message TEXT NULL,\n              provider_message_id VARCHAR(191) NOT NULL DEFAULT '',\n              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n              KEY idx_client_area_email_notifications_area (area),\n              KEY idx_client_area_email_notifications_status (send_status),\n              KEY idx_client_area_email_notifications_created (created_at)\n            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n        ");

        $stmt = $db->prepare(
            'INSERT INTO client_area_email_notifications
              (area, title, customer_name, customer_email, customer_phone, details_json, send_status, send_reason, response_status, error_message, provider_message_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        if (!$stmt) {
            return;
        }

        $detailsJson = json_encode($detailsValue, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($detailsJson === false) {
            $detailsJson = '{}';
        }

        $stmt->bind_param(
            'ssssssssiss',
            $areaValue,
            $titleValue,
            $customerNameValue,
            $customerEmailValue,
            $customerPhoneValue,
            $detailsJson,
            $sendStatus,
            $sendReason,
            $responseStatus,
            $errorMessage,
            $providerMessageId
        );
        $stmt->execute();
        $stmt->close();
    };

    $apiKey = trim((string) (public_api_env('RESEND_API_KEY', '') ?: ''));
    $from = trim((string) (public_api_env('RESEND_FROM', '') ?: ''));
    $to = trim((string) (public_api_env('RESEND_TO', $from) ?: $from));

    $normalizedArea = trim($area) !== '' ? trim($area) : 'area-clienti';
    $normalizedTitle = trim($title) !== '' ? trim($title) : 'Nuovo evento';
    $normalizedName = trim($customerName);
    $normalizedEmail = trim($customerEmail);
    $normalizedPhone = trim($customerPhone);

    $safeDetails = [];
    foreach ($details as $key => $value) {
        $label = trim((string) $key);
        $text = trim((string) $value);
        if ($label === '' || $text === '') {
            continue;
        }
        $safeDetails[$label] = $text;
    }

    if ($apiKey === '' || $from === '' || $to === '') {
        $persistNotificationLog(
            $normalizedArea,
            $normalizedTitle,
            $normalizedName,
            $normalizedEmail,
            $normalizedPhone,
            $safeDetails,
            'failed',
            'not_configured',
            0,
            'Resend non configurato',
            ''
        );

        return ['sent' => false, 'reason' => 'not_configured'];
    }

    $textDetails = [];
    foreach ($safeDetails as $label => $text) {
        $textDetails[] = '- ' . $label . ': ' . $text;
    }

    $htmlRows = '';
    foreach ($safeDetails as $label => $text) {
        $htmlRows .= '<tr><td style="padding:6px 0;color:#64748b;width:220px;vertical-align:top;">'
            . htmlspecialchars($label, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">'
            . htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td></tr>';
    }

    if ($htmlRows === '') {
        $htmlRows = '<tr><td style="padding:6px 0;color:#64748b;" colspan="2">Nessun dettaglio aggiuntivo</td></tr>';
    }

    $subject = '[Area Clienti] ' . $normalizedTitle;
    $body = [
        'from' => $from,
        'to' => [$to],
        'reply_to' => $normalizedEmail,
        'subject' => $subject,
        'text' => implode("\n", [
            'Evento: ' . $normalizedTitle,
            'Area: ' . $normalizedArea,
            'Cliente: ' . ($normalizedName !== '' ? $normalizedName : 'n/d'),
            'Email: ' . ($normalizedEmail !== '' ? $normalizedEmail : 'n/d'),
            'Telefono: ' . ($normalizedPhone !== '' ? $normalizedPhone : 'Non indicato'),
            '',
            'Dettagli:',
            $textDetails !== [] ? implode("\n", $textDetails) : '- Nessun dettaglio aggiuntivo',
        ]),
        'html' => '<div style="background:#0b1120;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">'
            . '<div style="max-width:740px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">'
            . '<div style="background:linear-gradient(135deg,#0f172a,#081a34);padding:20px 24px;">'
            . '<p style="margin:0;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">'
            . htmlspecialchars($normalizedArea, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</p>'
            . '<h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">'
            . htmlspecialchars($normalizedTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</h1>'
            . '</div>'
            . '<div style="padding:22px 24px;">'
            . '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
            . '<tr><td style="padding:6px 0;color:#64748b;width:220px;">Cliente</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">'
            . htmlspecialchars($normalizedName !== '' ? $normalizedName : 'n/d', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td></tr>'
            . '<tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">'
            . htmlspecialchars($normalizedEmail !== '' ? $normalizedEmail : 'n/d', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td></tr>'
            . '<tr><td style="padding:6px 0;color:#64748b;">Telefono</td><td style="padding:6px 0;color:#0f172a;font-weight:600;">'
            . htmlspecialchars($normalizedPhone !== '' ? $normalizedPhone : 'Non indicato', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            . '</td></tr>'
            . '</table>'
            . '<div style="margin-top:14px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">'
            . '<p style="margin:0 0 8px;color:#334155;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Dettagli evento</p>'
            . '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
            . $htmlRows
            . '</table>'
            . '</div></div></div></div>',
    ];

    try {
        $response = public_api_http_request(
            'POST',
            'https://api.resend.com/emails',
            [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ],
            json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        $status = (int) ($response['status'] ?? 0);
        $providerMessageId = is_array($response['json'] ?? null)
            ? (string) (($response['json']['id'] ?? ''))
            : '';

        if ($status < 200 || $status >= 300) {
            client_area_log_error('resend_http', 'Invio notifica non riuscito', [
                'status' => $status,
                'area' => $normalizedArea,
                'title' => $normalizedTitle,
                'response' => $response['body'] ?? '',
            ]);

            $persistNotificationLog(
                $normalizedArea,
                $normalizedTitle,
                $normalizedName,
                $normalizedEmail,
                $normalizedPhone,
                $safeDetails,
                'failed',
                'http_error',
                $status,
                'Resend HTTP error',
                $providerMessageId
            );

            return ['sent' => false, 'reason' => 'http_error', 'status' => $status];
        }

        $persistNotificationLog(
            $normalizedArea,
            $normalizedTitle,
            $normalizedName,
            $normalizedEmail,
            $normalizedPhone,
            $safeDetails,
            'sent',
            'sent',
            $status,
            '',
            $providerMessageId
        );

        return ['sent' => true, 'reason' => 'sent'];
    } catch (Throwable $error) {
        client_area_log_error('resend_exception', trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore invio Resend', [
            'area' => $normalizedArea,
            'title' => $normalizedTitle,
        ]);

        $persistNotificationLog(
            $normalizedArea,
            $normalizedTitle,
            $normalizedName,
            $normalizedEmail,
            $normalizedPhone,
            $safeDetails,
            'failed',
            'exception',
            0,
            trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore invio Resend',
            ''
        );

        return ['sent' => false, 'reason' => 'exception'];
    }
}

function client_area_is_stripe_configured(): bool
{
    return client_area_stripe_secret_key() !== '';
}

function client_area_stripe_api_request(string $path, string $method = 'GET', ?array $formFields = null): array
{
    $secret = client_area_stripe_secret_key();
    if ($secret === '') {
        throw new RuntimeException('Stripe non configurato.');
    }

    $url = 'https://api.stripe.com' . $path;
    $maxAttempts = client_area_http_retry_attempts();
    $connectTimeout = client_area_http_connect_timeout_seconds();
    $timeout = client_area_http_timeout_seconds();

    for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException('Impossibile inizializzare richiesta Stripe.');
        }

        $headers = ['Authorization: Bearer ' . $secret];
        if ($formFields !== null) {
            $headers[] = 'Content-Type: application/x-www-form-urlencoded';
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => $connectTimeout,
            CURLOPT_TIMEOUT => $timeout,
        ]);

        if ($formFields !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($formFields));
        }

        $raw = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if (!is_string($raw)) {
            client_area_log_error('stripe_transport', $error !== '' ? $error : 'Nessuna risposta da Stripe.', [
                'path' => $path,
                'attempt' => $attempt,
                'maxAttempts' => $maxAttempts,
            ]);

            if ($attempt < $maxAttempts) {
                usleep(200000 * $attempt);
                continue;
            }

            throw new RuntimeException($error !== '' ? $error : 'Nessuna risposta da Stripe.');
        }

        $parsed = json_decode($raw, true);
        if (!is_array($parsed)) {
            $parsed = [];
        }

        if ($statusCode >= 200 && $statusCode < 300) {
            return $parsed;
        }

        $message = (string) ($parsed['error']['message'] ?? $parsed['message'] ?? 'Errore Stripe');
        client_area_log_error('stripe_http', $message, [
            'path' => $path,
            'statusCode' => $statusCode,
            'attempt' => $attempt,
            'maxAttempts' => $maxAttempts,
        ]);

        $retryable = $statusCode === 429 || $statusCode >= 500;
        if ($retryable && $attempt < $maxAttempts) {
            usleep(200000 * $attempt);
            continue;
        }

        throw new RuntimeException($message);
    }

    throw new RuntimeException('Richiesta Stripe non riuscita.');
}

function client_area_site_origin(): string
{
    $configured = rtrim((string) (public_api_env('NEXT_PUBLIC_SITE_URL', '') ?: ''), '/');
    if ($configured !== '') {
        return $configured;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    return $scheme . '://' . $host;
}

function client_area_create_stripe_checkout_session(array $data): array
{
    $payload = [
        'mode' => 'payment',
        'success_url' => (string) ($data['successUrl'] ?? ''),
        'cancel_url' => (string) ($data['cancelUrl'] ?? ''),
        'customer_email' => (string) ($data['customerEmail'] ?? ''),
        'line_items[0][price_data][currency]' => 'eur',
        'line_items[0][price_data][product_data][name]' => (string) ($data['productName'] ?? 'Servizio AG SERVIZI'),
        'line_items[0][price_data][product_data][description]' => (string) ($data['description'] ?? ''),
        'line_items[0][price_data][unit_amount]' => (string) ((int) ($data['amountCents'] ?? 0)),
        'line_items[0][quantity]' => '1',
        'payment_method_types[0]' => 'card',
        'invoice_creation[enabled]' => 'true',
    ];

    $invoiceDescription = trim((string) ($data['invoiceDescription'] ?? ''));
    if ($invoiceDescription !== '') {
        $payload['invoice_creation[invoice_data][description]'] = $invoiceDescription;
    }

    $metadata = is_array($data['metadata'] ?? null) ? $data['metadata'] : [];
    foreach ($metadata as $key => $value) {
        $payload['metadata[' . (string) $key . ']'] = (string) $value;
    }

    return client_area_stripe_api_request('/v1/checkout/sessions', 'POST', $payload);
}

function client_area_get_stripe_checkout_session(string $sessionId): array
{
    $encoded = rawurlencode($sessionId);
    $payload = client_area_stripe_api_request('/v1/checkout/sessions/' . $encoded . '?expand[]=invoice');
    $invoice = is_array($payload['invoice'] ?? null) ? $payload['invoice'] : [];

    return [
        'id' => (string) ($payload['id'] ?? ''),
        'status' => (string) ($payload['status'] ?? ''),
        'paymentStatus' => (string) ($payload['payment_status'] ?? ''),
        'amountTotal' => (int) ($payload['amount_total'] ?? 0),
        'currency' => (string) ($payload['currency'] ?? 'eur'),
        'invoiceId' => (string) ($invoice['id'] ?? ''),
        'invoicePdf' => (string) ($invoice['invoice_pdf'] ?? ''),
        'hostedInvoiceUrl' => (string) ($invoice['hosted_invoice_url'] ?? ''),
    ];
}

function client_area_normalize_base_url(string $value): string
{
    return rtrim(trim($value), '/');
}

function client_area_openapi_config(): array
{
    $sandbox = strtolower(trim((string) (public_api_env('OPENAPI_SANDBOX', 'false') ?: 'false'))) === 'true';

    return [
        'sandbox' => $sandbox,
        'visureCameraliBaseUrl' => client_area_normalize_base_url((string) ($sandbox
            ? public_api_env('OPENAPI_VISURE_CAMERALI_BASE_URL_SANDBOX', '')
            : public_api_env('OPENAPI_VISURE_CAMERALI_BASE_URL_PRODUCTION', ''))),
        'visureCameraliBearer' => trim((string) (public_api_env('OPENAPI_BEARER_VISURE_CAMERALI', '') ?: '')),
        'visureBaseUrl' => client_area_normalize_base_url((string) ($sandbox
            ? public_api_env('OPENAPI_VISURE_BASE_URL_SANDBOX', '')
            : public_api_env('OPENAPI_VISURE_BASE_URL_PRODUCTION', ''))),
        'visureBearer' => trim((string) (public_api_env('OPENAPI_BEARER_VISURE', '') ?: '')),
        'catastoBaseUrl' => client_area_normalize_base_url((string) ($sandbox
            ? public_api_env('OPENAPI_CATASTO_BASE_URL_SANDBOX', '')
            : public_api_env('OPENAPI_CATASTO_BASE_URL_PRODUCTION', ''))),
        'catastoBearer' => trim((string) (public_api_env('OPENAPI_BEARER_CATASTO', '') ?: '')),
    ];
}

function client_area_openapi_fetch_json(string $baseUrl, string $path, string $bearer, string $method = 'GET', ?array $body = null): array
{
    $url = $baseUrl . (str_starts_with($path, '/') ? '' : '/') . $path;
    $maxAttempts = client_area_http_retry_attempts();
    $connectTimeout = client_area_http_connect_timeout_seconds();
    $timeout = client_area_http_timeout_seconds();

    for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException('Impossibile inizializzare richiesta OpenAPI.');
        }

        $headers = ['Accept: application/json'];
        if ($bearer !== '') {
            $headers[] = 'Authorization: Bearer ' . $bearer;
        }

        $payload = null;
        if ($body !== null) {
            $headers[] = 'Content-Type: application/json';
            $payload = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => $connectTimeout,
            CURLOPT_TIMEOUT => $timeout,
        ]);

        if ($payload !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }

        $raw = curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        if (!is_string($raw)) {
            client_area_log_error('openapi_transport', $error !== '' ? $error : 'Nessuna risposta da OpenAPI.', [
                'url' => $url,
                'attempt' => $attempt,
                'maxAttempts' => $maxAttempts,
            ]);

            if ($attempt < $maxAttempts) {
                usleep(200000 * $attempt);
                continue;
            }

            throw new RuntimeException($error !== '' ? $error : 'Nessuna risposta da OpenAPI.');
        }

        $parsed = json_decode($raw, true);
        if (!is_array($parsed)) {
            $parsed = [];
        }

        if ($statusCode >= 200 && $statusCode < 300) {
            return ['data' => $parsed, 'raw' => $raw];
        }

        $message = (string) ($parsed['message'] ?? $parsed['error'] ?? $parsed['detail'] ?? 'Errore OpenAPI');
        client_area_log_error('openapi_http', $message, [
            'url' => $url,
            'statusCode' => $statusCode,
            'attempt' => $attempt,
            'maxAttempts' => $maxAttempts,
        ]);

        $retryable = $statusCode === 429 || $statusCode >= 500;
        if ($retryable && $attempt < $maxAttempts) {
            usleep(200000 * $attempt);
            continue;
        }

        throw new RuntimeException('OpenAPI HTTP ' . $statusCode . ': ' . $message);
    }

    throw new RuntimeException('Richiesta OpenAPI non riuscita.');
}

function client_area_get_openapi_catalog(): array
{
    $config = client_area_openapi_config();
    $visengineAvailable = $config['visureBaseUrl'] !== '' && $config['visureBearer'] !== '';

    return [
        'sandbox' => (bool) $config['sandbox'],
        'services' => [
            [
                'serviceType' => 'visura-camerale',
                'provider' => 'visure-camerali',
                'available' => $config['visureCameraliBaseUrl'] !== '' && $config['visureCameraliBearer'] !== '',
                'title' => 'Visura camerale',
                'description' => 'Recupero dati impresa con verifica anagrafica dedicata.',
            ],
            [
                'serviceType' => 'visura-catastale',
                'provider' => 'catasto',
                'available' => $config['catastoBaseUrl'] !== '' && $config['catastoBearer'] !== '',
                'title' => 'Visura catastale',
                'description' => 'Richiesta visura catastale per soggetto con flusso dedicato.',
            ],
            [
                'serviceType' => 'visura-pra',
                'provider' => 'visengine2',
                'available' => $visengineAvailable,
                'title' => 'Visura PRA',
                'description' => 'Richiesta PRA con collegamento al servizio dedicato.',
            ],
            [
                'serviceType' => 'visura-crif',
                'provider' => 'visengine2',
                'available' => $visengineAvailable,
                'title' => 'Visura CRIF',
                'description' => 'Richiesta CRIF con collegamento al servizio dedicato.',
            ],
            [
                'serviceType' => 'visura-cr',
                'provider' => 'visengine2',
                'available' => $visengineAvailable,
                'title' => 'Visura Centrale Rischi',
                'description' => 'Richiesta Centrale Rischi con collegamento al servizio dedicato.',
            ],
        ],
    ];
}

function client_area_extract_visura_document(array $data): array
{
    return [
        'providerRequestId' => trim((string) ($data['id'] ?? $data['_id'] ?? $data['hash'] ?? $data['identificativo'] ?? '')),
        'status' => trim((string) ($data['status'] ?? $data['stato'] ?? $data['esito'] ?? 'processing')),
        'documentUrl' => trim((string) ($data['document_url'] ?? $data['pdf_url'] ?? $data['url_pdf'] ?? $data['link'] ?? $data['url'] ?? '')),
        'documentBase64' => trim((string) ($data['document_base64'] ?? $data['pdf_base64'] ?? $data['base64'] ?? '')),
    ];
}

function client_area_create_openapi_visura_request(array $input): array
{
    $serviceType = (string) ($input['serviceType'] ?? '');
    $config = client_area_openapi_config();

    if ($serviceType === 'visura-camerale') {
        if ($config['visureCameraliBaseUrl'] === '' || $config['visureCameraliBearer'] === '') {
            throw new RuntimeException('Configurazione OpenAPI incompleta: OPENAPI_VISURE_CAMERALI_BASE_URL_*/OPENAPI_BEARER_VISURE_CAMERALI.');
        }

        $companyTaxId = strtoupper(trim((string) (($input['formData']['companyTaxId'] ?? ''))));
        if ($companyTaxId === '') {
            throw new RuntimeException('Inserisci il codice fiscale o la partita IVA dell\'impresa.');
        }

        $response = client_area_openapi_fetch_json(
            (string) $config['visureCameraliBaseUrl'],
            '/impresa/' . rawurlencode($companyTaxId),
            (string) $config['visureCameraliBearer']
        );

        $data = is_array($response['data']) ? $response['data'] : [];
        $summary = [
            'denominazione' => (string) ($data['denominazione'] ?? $data['ragione_sociale'] ?? $data['nome'] ?? ''),
            'rea' => (string) ($data['rea'] ?? ''),
            'provincia' => (string) ($data['provincia'] ?? ''),
            'statoAttivita' => (string) ($data['stato_attivita'] ?? $data['stato'] ?? 'dato recuperato'),
            'partitaIva' => (string) ($data['partita_iva'] ?? $companyTaxId),
        ];

        return [
            'provider' => 'OpenAPI Visure Camerali',
            'providerService' => 'anagrafica impresa',
            'status' => 'completed',
            'providerRequestId' => $companyTaxId,
            'message' => trim((string) ($summary['denominazione'])) !== ''
                ? 'Dati camerali recuperati per ' . (string) $summary['denominazione'] . '.'
                : 'Dati camerali recuperati correttamente.',
            'documentUrl' => '',
            'documentBase64' => '',
            'summary' => $summary,
            'raw' => $data,
        ];
    }

    if ($serviceType === 'visura-catastale') {
        if ($config['catastoBaseUrl'] === '' || $config['catastoBearer'] === '') {
            throw new RuntimeException('Configurazione OpenAPI incompleta: OPENAPI_CATASTO_BASE_URL_*/OPENAPI_BEARER_CATASTO.');
        }

        $formData = is_array($input['formData'] ?? null) ? $input['formData'] : [];
        $subjectTaxCode = strtoupper(trim((string) ($formData['subjectTaxCode'] ?? '')));
        $province = strtoupper(trim((string) ($formData['province'] ?? '')));
        $landRegistryType = strtoupper(trim((string) ($formData['landRegistryType'] ?? 'F')));
        $reportType = strtolower(trim((string) ($formData['reportType'] ?? 'attuale')));

        if ($subjectTaxCode === '' || $province === '') {
            throw new RuntimeException('Per la visura catastale servono codice fiscale e provincia.');
        }

        $response = client_area_openapi_fetch_json(
            (string) $config['catastoBaseUrl'],
            '/visura_catastale',
            (string) $config['catastoBearer'],
            'POST',
            [
                'entita' => 'soggetto',
                'cf_piva' => $subjectTaxCode,
                'provincia' => $province,
                'tipo_catasto' => $landRegistryType,
                'tipo_visura' => $reportType,
                'richiedente' => (string) ($input['customerName'] ?? ''),
            ]
        );

        $data = is_array($response['data']) ? $response['data'] : [];
        $doc = client_area_extract_visura_document($data);

        return [
            'provider' => 'OpenAPI Catasto',
            'providerService' => 'visura catastale soggetto',
            'status' => $doc['status'] !== '' ? $doc['status'] : 'processing',
            'providerRequestId' => $doc['providerRequestId'],
            'message' => ($doc['documentUrl'] !== '' || $doc['documentBase64'] !== '')
                ? 'Visura catastale recuperata correttamente.'
                : 'Richiesta catastale inviata a OpenAPI e presa in carico.',
            'documentUrl' => $doc['documentUrl'],
            'documentBase64' => $doc['documentBase64'],
            'summary' => [
                'codiceFiscale' => $subjectTaxCode,
                'provincia' => $province,
                'tipoCatasto' => $landRegistryType,
                'tipoVisura' => $reportType,
            ],
            'raw' => $data,
        ];
    }

    if ($config['visureBaseUrl'] === '' || $config['visureBearer'] === '') {
        throw new RuntimeException('Configurazione OpenAPI incompleta: OPENAPI_VISURE_BASE_URL_*/OPENAPI_BEARER_VISURE.');
    }

    $serviceHash = trim((string) ($input['resolvedServiceHash'] ?? ''));
    $serviceLabel = trim((string) ($input['resolvedServiceLabel'] ?? $serviceType));
    if ($serviceHash === '') {
        throw new RuntimeException('Servizio OpenAPI non risolto: manca hash servizio.');
    }

    $formData = is_array($input['formData'] ?? null) ? $input['formData'] : [];
    if ($serviceType === 'visura-pra') {
        $plate = strtoupper(trim((string) ($formData['plate'] ?? '')));
        if ($plate === '') {
            throw new RuntimeException('Inserisci la targa per la visura PRA.');
        }

        $jsonVisura = [
            'targa' => $plate,
            'targa_veicolo' => $plate,
            'richiedente' => (string) ($input['customerName'] ?? ''),
            'email' => (string) ($input['email'] ?? ''),
        ];

        $response = client_area_openapi_fetch_json(
            (string) $config['visureBaseUrl'],
            '/richiesta',
            (string) $config['visureBearer'],
            'POST',
            ['hash_visura' => $serviceHash, 'json_visura' => $jsonVisura]
        );
        $data = is_array($response['data']) ? $response['data'] : [];
        $doc = client_area_extract_visura_document($data);

        return [
            'provider' => 'OpenAPI Visengine',
            'providerService' => $serviceLabel,
            'status' => $doc['status'] !== '' ? $doc['status'] : 'processing',
            'providerRequestId' => $doc['providerRequestId'],
            'message' => ($doc['documentUrl'] !== '' || $doc['documentBase64'] !== '')
                ? $serviceLabel . ' recuperata correttamente.'
                : $serviceLabel . ' inviata al provider e ora è in lavorazione.',
            'documentUrl' => $doc['documentUrl'],
            'documentBase64' => $doc['documentBase64'],
            'summary' => $jsonVisura,
            'raw' => $data,
        ];
    }

    $subjectTaxCode = strtoupper(trim((string) ($formData['subjectTaxCode'] ?? '')));
    $subjectName = trim((string) ($formData['subjectName'] ?? ''));
    $subjectSurname = trim((string) ($formData['subjectSurname'] ?? ''));
    if ($subjectTaxCode === '' || $subjectName === '' || $subjectSurname === '') {
        throw new RuntimeException('Per questa visura servono codice fiscale, nome e cognome del soggetto.');
    }

    $jsonVisura = [
        'codice_fiscale' => $subjectTaxCode,
        'cf' => $subjectTaxCode,
        'nome' => $subjectName,
        'cognome' => $subjectSurname,
        'nominativo' => trim($subjectName . ' ' . $subjectSurname),
        'richiedente' => (string) ($input['customerName'] ?? ''),
        'email' => (string) ($input['email'] ?? ''),
    ];

    $response = client_area_openapi_fetch_json(
        (string) $config['visureBaseUrl'],
        '/richiesta',
        (string) $config['visureBearer'],
        'POST',
        ['hash_visura' => $serviceHash, 'json_visura' => $jsonVisura]
    );

    $data = is_array($response['data']) ? $response['data'] : [];
    $doc = client_area_extract_visura_document($data);

    return [
        'provider' => 'OpenAPI Visengine',
        'providerService' => $serviceLabel,
        'status' => $doc['status'] !== '' ? $doc['status'] : 'processing',
        'providerRequestId' => $doc['providerRequestId'],
        'message' => ($doc['documentUrl'] !== '' || $doc['documentBase64'] !== '')
            ? $serviceLabel . ' recuperata correttamente.'
            : $serviceLabel . ' inviata al provider e ora è in lavorazione.',
        'documentUrl' => $doc['documentUrl'],
        'documentBase64' => $doc['documentBase64'],
        'summary' => $jsonVisura,
        'raw' => $data,
    ];
}

function client_area_require_string(mixed $value): string
{
    return trim((string) ($value ?? ''));
}

function client_area_require_positive_number(mixed $value): float
{
    $parsed = is_numeric($value) ? (float) $value : 0.0;
    return $parsed > 0 ? $parsed : 0.0;
}

function client_area_ensure_client_area_shipments_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_shipments (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          tracking_code VARCHAR(64) NOT NULL DEFAULT '',\n          parcel_id VARCHAR(64) NOT NULL DEFAULT '',\n          shipment_number_from VARCHAR(32) NOT NULL DEFAULT '',\n          shipment_number_to VARCHAR(32) NOT NULL DEFAULT '',\n          label_pdf_base64 LONGTEXT NULL,\n          brt_response_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          KEY idx_client_area_shipments_tracking (tracking_code)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_brt_config(): array
{
    $apiBase = rtrim((string) (public_api_env('BRT_SHIPMENT_API_BASE', public_api_env('BRT_REST_BASE_URL', public_api_env('BRT_BASE_URL', ''))) ?: ''), '/');
    $ormBaseUrl = rtrim((string) (public_api_env('BRT_ORM_BASE_URL', '') ?: ''), '/');
    return [
        'apiBase' => $apiBase,
        'ormBaseUrl' => $ormBaseUrl,
        'manifestEndpoint' => trim((string) (public_api_env('BRT_MANIFEST_ENDPOINT', '') ?: '')),
        'apiKey' => trim((string) (public_api_env('BRT_API_KEY', '') ?: '')),
        'ormApiKey' => trim((string) (public_api_env('BRT_ORM_API_KEY', '') ?: '')),
        'ormRqCustomerCode' => trim((string) (public_api_env('BRT_ORM_RQ_CUSTOMER_CODE', public_api_env('BRT_RQ_CUSTOMER_CODE', '')) ?: '')),
        'ormCollectionTime' => trim((string) (public_api_env('BRT_ORM_COLLECTION_TIME', '10:00') ?: '10:00')),
        'ormGoodDescription' => trim((string) (public_api_env('BRT_ORM_GOOD_DESCRIPTION', 'Merce generica') ?: 'Merce generica')),
        'userId' => trim((string) (public_api_env('BRT_SHIPMENT_USER_ID', public_api_env('BRT_ACCOUNT_USER_ID', public_api_env('BRT_USER', ''))) ?: '')),
        'password' => trim((string) (public_api_env('BRT_SHIPMENT_PASSWORD', public_api_env('BRT_ACCOUNT_PASSWORD', public_api_env('BRT_PASSWORD', ''))) ?: '')),
        'departureDepot' => trim((string) (public_api_env('BRT_DEPARTURE_DEPOT', '') ?: '')),
        'senderCustomerCode' => trim((string) (public_api_env('BRT_SENDER_CUSTOMER_CODE', public_api_env('BRT_PORTAL_CUSTOMER_CODE', public_api_env('BRT_ACCOUNT_USER_ID', ''))) ?: '')),
        'pricingConditionCode' => trim((string) (public_api_env('BRT_PRICING_CONDITION_CODE', public_api_env('BRT_PRICING', '000')) ?: '000')),
        'pricingConditionCodeItalia' => trim((string) (public_api_env('BRT_PRICING_CONDITION_CODE_ITALIA', public_api_env('BRT_PRICING_CONDITION_CODE', public_api_env('BRT_PRICING', '000'))) ?: '000')),
        'pricingConditionCodePudo' => trim((string) (public_api_env('BRT_PRICING_CONDITION_CODE_PUDO', public_api_env('BRT_PRICING_CONDITION_CODE', public_api_env('BRT_PRICING', '000'))) ?: '000')),
        'pricingConditionCodeEurope' => trim((string) (public_api_env('BRT_PRICING_CONDITION_CODE_EUROPE', public_api_env('BRT_PRICING_CONDITION_CODE', public_api_env('BRT_PRICING', '000'))) ?: '000')),
        'pricingConditionCodeSwiss' => trim((string) (public_api_env('BRT_PRICING_CONDITION_CODE_SWISS', public_api_env('BRT_PRICING_CONDITION_CODE', public_api_env('BRT_PRICING', '000'))) ?: '000')),
        'allowedDestinationCountries' => array_values(array_filter(array_map('trim', explode(',', (string) (public_api_env('BRT_ALLOWED_DESTINATION_COUNTRIES', 'IT') ?: 'IT'))))),
        'deliveryFreightTypeCode' => trim((string) (public_api_env('BRT_DELIVERY_FREIGHT_TYPE_CODE', 'DAP') ?: 'DAP')),
        'defaultCountry' => strtoupper(trim((string) (public_api_env('BRT_DEFAULT_COUNTRY', 'IT') ?: 'IT'))),
        'defaultServiceType' => trim((string) (public_api_env('BRT_DEFAULT_SERVICE_TYPE', '') ?: '')),
        'labelRequired' => !in_array(strtolower(trim((string) (public_api_env('BRT_LABEL_REQUIRED', 'true') ?: 'true'))), ['false', '0', 'no'], true),
        'labelOutputType' => trim((string) (public_api_env('BRT_LABEL_OUTPUT_TYPE', 'PDF') ?: 'PDF')),
        'labelOffsetX' => trim((string) (public_api_env('BRT_LABEL_OFFSET_X', '') ?: '')),
        'labelOffsetY' => trim((string) (public_api_env('BRT_LABEL_OFFSET_Y', '') ?: '')),
        'labelBorderRequired' => strtolower(trim((string) (public_api_env('BRT_LABEL_BORDER', '') ?: ''))) === 'true' ? '1' : '',
        'labelLogoRequired' => strtolower(trim((string) (public_api_env('BRT_LABEL_LOGO', '') ?: ''))) === 'true' ? '1' : '',
        'labelBarcodeControlRowRequired' => strtolower(trim((string) (public_api_env('BRT_LABEL_BARCODE_ROW', '') ?: ''))) === 'true' ? '1' : '',
    ];
}

function client_area_get_missing_brt_config(): array
{
    $config = client_area_brt_config();
    $required = ['apiBase', 'userId', 'password', 'departureDepot', 'senderCustomerCode', 'pricingConditionCode', 'deliveryFreightTypeCode', 'labelOutputType'];
    return array_values(array_filter($required, static fn($key) => trim((string) ($config[$key] ?? '')) === ''));
}

function client_area_get_missing_brt_manifest_config(): array
{
    $config = client_area_brt_config();
    $required = ['apiBase', 'manifestEndpoint', 'userId', 'password'];
    return array_values(array_filter($required, static fn($key) => trim((string) ($config[$key] ?? '')) === ''));
}

function client_area_get_missing_brt_orm_config(): array
{
    $config = client_area_brt_config();
    $required = ['ormBaseUrl', 'ormApiKey', 'ormRqCustomerCode', 'senderCustomerCode'];
    return array_values(array_filter($required, static fn($key) => trim((string) ($config[$key] ?? '')) === ''));
}

function client_area_select_pricing_condition_code(array $config, string $country, string $pudoId = ''): string
{
    $country = strtoupper(trim($country));
    if ($pudoId !== '') return (string) ($config['pricingConditionCodePudo'] ?: $config['pricingConditionCode']);
    if ($country === 'IT') return (string) ($config['pricingConditionCodeItalia'] ?: $config['pricingConditionCode']);
    if ($country === 'CH') return (string) ($config['pricingConditionCodeSwiss'] ?: $config['pricingConditionCode']);
    if (in_array($country, $config['allowedDestinationCountries'] ?? [], true)) {
        return (string) ($config['pricingConditionCodeEurope'] ?: $config['pricingConditionCode']);
    }
    return (string) ($config['pricingConditionCode'] ?? '000');
}

function client_area_build_brt_account(array $config): array
{
    return ['userID' => (string) $config['userId'], 'password' => (string) $config['password']];
}

function client_area_brt_normalize_service_type(string $serviceCode): string
{
    return $serviceCode === 'ritiro-nazionale' ? 'C' : '';
}

function client_area_brt_build_reference(string $value): string
{
    $cleaned = preg_replace('/[^A-Z0-9]/', '', strtoupper($value)) ?: '';
    $cleaned = substr($cleaned, 0, 15);
    return $cleaned !== '' ? $cleaned : 'AGCLIENTI';
}

function client_area_brt_next_orm_collection_date(): string
{
    $date = new DateTimeImmutable('tomorrow');
    if ((int) $date->format('w') === 0) {
        $date = $date->modify('+1 day');
    }

    return $date->format('Y-m-d');
}

function client_area_resolve_shipping_price(float $taxableWeightKG, float $volumeM3, string $destinationCountry): array
{
    $label = 'Tariffa base';
    $amountEUR = 0.0;

    if (client_area_has_database_config()) {
        public_api_ensure_shipping_pricing_table();
        $db = client_area_db();
        if ($db) {
            $result = $db->query("SELECT label, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order
                                  FROM shipping_pricing_rules
                                  WHERE active = 1
                                  ORDER BY sort_order ASC, min_weight_kg ASC");
            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    $minWeight = (float) ($row['min_weight_kg'] ?? 0);
                    $maxWeight = (float) ($row['max_weight_kg'] ?? 0);
                    $minVolume = (float) ($row['min_volume_m3'] ?? 0);
                    $maxVolume = (float) ($row['max_volume_m3'] ?? 0);
                    $weightMatches = $taxableWeightKG >= $minWeight && ($maxWeight <= 0 || $taxableWeightKG <= $maxWeight);
                    $volumeMatches = $volumeM3 >= $minVolume && ($maxVolume <= 0 || $volumeM3 <= $maxVolume);
                    if ($weightMatches && $volumeMatches) {
                        $label = (string) ($row['label'] ?? 'Listino admin');
                        $amountEUR = (float) ($row['price_eur'] ?? 0);
                        break;
                    }
                }
                $result->free();
            }
        }
    }

    if ($amountEUR <= 0) {
        $label = 'Tariffa stimata';
        if (strtoupper(trim($destinationCountry)) === 'IT') {
            $amountEUR = $taxableWeightKG <= 3 ? 8.9 : ($taxableWeightKG <= 10 ? 12.9 : 16.9);
        } else {
            $amountEUR = 24.9;
        }
    }

    return [
        'label' => $label,
        'amountCents' => max(100, (int) round($amountEUR * 100)),
    ];
}

function client_area_brt_json_request(string $method, string $url, array $body, array $headers = []): array
{
    $requestHeaders = array_merge([
        'Content-Type: application/json',
        'Accept: application/json',
    ], $headers);

    $response = public_api_http_request($method, $url, $requestHeaders, json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $json = is_array($response['json'] ?? null) ? $response['json'] : null;
    $status = (int) ($response['status'] ?? 0);

    return ['status' => $status, 'json' => $json, 'raw' => (string) ($response['body'] ?? '')];
}

function client_area_brt_route_shipment(array $input): array
{
    $config = client_area_brt_config();
    $pricingConditionCode = client_area_select_pricing_condition_code($config, (string) ($input['destinationCountry'] ?? 'IT'), (string) ($input['pudoId'] ?? ''));
    $payload = [
        'account' => client_area_build_brt_account($config),
        'routingData' => [
            'network' => '',
            'departureDepot' => (string) $config['departureDepot'],
            'senderCustomerCode' => (string) $config['senderCustomerCode'],
            'deliveryFreightTypeCode' => (string) $config['deliveryFreightTypeCode'],
            'consigneeCompanyName' => (string) ($input['destinationCompanyName'] ?? ''),
            'consigneeAddress' => (string) ($input['destinationAddress'] ?? ''),
            'consigneeZIPCode' => (string) ($input['destinationZIPCode'] ?? ''),
            'consigneeCity' => (string) ($input['destinationCity'] ?? ''),
            'consigneeProvinceAbbreviation' => (string) ($input['destinationProvince'] ?? ''),
            'consigneeCountryAbbreviationISOAlpha2' => (string) ($input['destinationCountry'] ?? 'IT'),
            'pricingConditionCode' => $pricingConditionCode,
            'serviceType' => client_area_brt_normalize_service_type((string) ($input['serviceCode'] ?? '')) ?: (string) ($config['defaultServiceType'] ?? ''),
            'numberOfParcels' => (int) ($input['parcelCount'] ?? 1),
            'weightKG' => (float) ($input['weightKG'] ?? 0),
            'volumeM3' => (float) ($input['volumeM3'] ?? 0),
            'pudoId' => (string) ($input['pudoId'] ?? ''),
            'holdForPickup' => ((string) ($input['pudoId'] ?? '') !== '') ? '1' : '',
        ],
    ];

    $response = client_area_brt_json_request('PUT', (string) $config['apiBase'] . '/routing', $payload);
    $routing = is_array($response['json']['routingResponse'] ?? null) ? $response['json']['routingResponse'] : [];
    $execution = is_array($routing['executionMessage'] ?? null) ? $routing['executionMessage'] : [];
    $code = (int) ($execution['code'] ?? 0);

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300 || $code !== 0) {
        $message = (string) ($execution['message'] ?? $execution['codeDesc'] ?? ($response['json']['message'] ?? 'BRT non ha restituito un instradamento valido.'));
        throw new RuntimeException($message);
    }

    return [
        'executionMessage' => $execution,
        'arrivalTerminal' => (string) ($routing['arrivalTerminal'] ?? ''),
        'arrivalDepot' => (string) ($routing['arrivalDepot'] ?? ''),
        'deliveryZone' => (string) ($routing['deliveryZone'] ?? ''),
    ];
}

function client_area_brt_create_shipment(array $input): array
{
    $config = client_area_brt_config();
    $pricingConditionCode = client_area_select_pricing_condition_code($config, (string) ($input['destinationCountry'] ?? 'IT'), (string) ($input['pudoId'] ?? ''));
    $reference = client_area_brt_build_reference((string) ($input['customerName'] ?? ''));
    $numericSenderReference = (int) round(microtime(true) * 1000);

    $payload = [
        'account' => client_area_build_brt_account($config),
        'createData' => [
            'network' => '',
            'departureDepot' => (string) $config['departureDepot'],
            'senderCustomerCode' => (string) $config['senderCustomerCode'],
            'deliveryFreightTypeCode' => (string) $config['deliveryFreightTypeCode'],
            'consigneeCompanyName' => (string) ($input['destinationCompanyName'] ?? ''),
            'consigneeAddress' => (string) ($input['destinationAddress'] ?? ''),
            'consigneeZIPCode' => (string) ($input['destinationZIPCode'] ?? ''),
            'consigneeCity' => (string) ($input['destinationCity'] ?? ''),
            'consigneeProvinceAbbreviation' => (string) ($input['destinationProvince'] ?? ''),
            'consigneeCountryAbbreviationISOAlpha2' => (string) ($input['destinationCountry'] ?? 'IT'),
            'consigneeContactName' => (string) ($input['customerName'] ?? ''),
            'consigneeTelephone' => (string) ($input['phone'] ?? ''),
            'consigneeEMail' => (string) ($input['email'] ?? ''),
            'consigneeMobilePhoneNumber' => (string) ($input['phone'] ?? ''),
            'isAlertRequired' => 1,
            'pricingConditionCode' => $pricingConditionCode,
            'serviceType' => client_area_brt_normalize_service_type((string) ($input['serviceCode'] ?? '')) ?: (string) ($config['defaultServiceType'] ?? ''),
            'pudoId' => (string) ($input['pudoId'] ?? ''),
            'holdForPickup' => ((string) ($input['pudoId'] ?? '') !== '') ? '1' : '',
            'numberOfParcels' => (string) ((int) ($input['parcelCount'] ?? 1)),
            'weightKG' => (float) ($input['weightKG'] ?? 0),
            'volumeM3' => (float) ($input['volumeM3'] ?? 0),
            'insuranceAmount' => '0',
            'insuranceAmountCurrency' => 'EUR',
            'cashOnDelivery' => '0',
            'isCODMandatory' => '0',
            'codCurrency' => 'EUR',
            'numericSenderReference' => $numericSenderReference,
            'alphanumericSenderReference' => $reference,
            'notes' => (string) ($input['notes'] ?? ''),
        ],
        'isLabelRequired' => !empty($config['labelRequired']) ? 1 : 0,
        'labelParameters' => [
            'outputType' => (string) ($config['labelOutputType'] ?? 'PDF'),
            'offsetX' => (string) ($config['labelOffsetX'] ?? ''),
            'offsetY' => (string) ($config['labelOffsetY'] ?? ''),
            'isBorderRequired' => (string) ($config['labelBorderRequired'] ?? ''),
            'isLogoRequired' => (string) ($config['labelLogoRequired'] ?? ''),
            'isBarcodeControlRowRequired' => (string) ($config['labelBarcodeControlRowRequired'] ?? ''),
        ],
        'actualSender' => [
            'actualSenderName' => (string) ($input['customerName'] ?? ''),
            'actualSenderAddress' => (string) ($input['pickupAddress'] ?? ''),
            'actualSenderZIPCode' => (string) ($input['pickupZIPCode'] ?? ''),
            'actualSenderCity' => (string) ($input['pickupCity'] ?? ''),
            'actualSenderProvince' => (string) ($input['pickupProvince'] ?? ''),
            'actualSenderCountry' => (string) ($config['defaultCountry'] ?? 'IT'),
            'actualSenderEmail' => (string) ($input['email'] ?? ''),
            'actualSenderMobilePhoneNumber' => (string) ($input['phone'] ?? ''),
        ],
    ];

    $response = client_area_brt_json_request('POST', (string) $config['apiBase'] . '/shipment', $payload);
    $createResponse = is_array($response['json']['createResponse'] ?? null) ? $response['json']['createResponse'] : [];
    $execution = is_array($createResponse['executionMessage'] ?? null) ? $createResponse['executionMessage'] : [];
    $code = (int) ($execution['code'] ?? 0);

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300 || $code !== 0) {
        $message = (string) ($execution['message'] ?? $execution['codeDesc'] ?? ($response['json']['message'] ?? 'BRT non ha accettato la richiesta di spedizione.'));
        throw new RuntimeException($message);
    }

    $label = is_array($createResponse['labels']['label'][0] ?? null) ? $createResponse['labels']['label'][0] : [];
    return [
        'executionMessage' => $execution,
        'trackingCode' => (string) ($label['trackingByParcelID'] ?? ''),
        'parcelId' => (string) ($label['parcelID'] ?? ''),
        'labelPdfBase64' => (string) ($label['stream'] ?? ''),
        'shipmentNumberFrom' => (string) ($createResponse['parcelNumberFrom'] ?? ''),
        'shipmentNumberTo' => (string) ($createResponse['parcelNumberTo'] ?? ''),
        'numericSenderReference' => $numericSenderReference,
        'alphanumericSenderReference' => $reference,
    ];
}

function client_area_brt_create_orm_pickup(array $input): array
{
    $config = client_area_brt_config();
    $missing = client_area_get_missing_brt_orm_config();
    if ($missing !== []) {
        throw new RuntimeException('Configurazione BRT ORM incompleta: ' . implode(', ', $missing));
    }

    $reference = client_area_brt_build_reference((string) ($input['customerName'] ?? ''));
    $collectionDate = client_area_brt_next_orm_collection_date();
    $collectionTime = (string) ($config['ormCollectionTime'] ?? '10:00');

    $payload = [[
        'requestInfos' => [
            'parcelCount' => (int) ($input['parcelCount'] ?? 1),
            'collectionDate' => $collectionDate,
        ],
        'customerInfos' => [
            'custAccNumber' => (string) $config['senderCustomerCode'],
        ],
        'stakeholders' => [
            [
                'type' => 'RQ',
                'customerInfos' => [
                    'custAccNumber' => (string) $config['ormRqCustomerCode'],
                ],
            ],
            [
                'type' => 'SE',
                'address' => [
                    'compName' => (string) ($input['customerName'] ?? ''),
                    'street' => (string) ($input['pickupAddress'] ?? ''),
                    'state' => (string) ($input['pickupProvince'] ?? ''),
                    'countryCode' => 'IT',
                    'zipCode' => (string) ($input['pickupZIPCode'] ?? ''),
                    'city' => (string) ($input['pickupCity'] ?? ''),
                ],
                'contact' => [
                    'contactDetails' => [
                        'phone' => (string) ($input['phone'] ?? ''),
                        'contactPerson' => (string) ($input['customerName'] ?? ''),
                    ],
                ],
            ],
            [
                'type' => 'RE',
                'address' => [
                    'compName' => (string) ($input['destinationCompanyName'] ?? ''),
                    'street' => (string) ($input['destinationAddress'] ?? ''),
                    'state' => (string) ($input['destinationProvince'] ?? ''),
                    'countryCode' => (string) ($input['destinationCountry'] ?? 'IT'),
                    'zipCode' => (string) ($input['destinationZIPCode'] ?? ''),
                    'city' => (string) ($input['destinationCity'] ?? ''),
                ],
            ],
        ],
        'brtSpec' => [
            'goodDescription' => (string) ($config['ormGoodDescription'] ?? 'Merce generica'),
            'payerType' => 'Ordering',
            'collectionTime' => $collectionTime,
            'weightKG' => (float) ($input['weightKG'] ?? 0),
            'notes' => (string) ($input['notes'] ?? ''),
            'requestRef' => $reference,
        ],
    ]];

    $response = client_area_brt_json_request(
        'POST',
        (string) $config['ormBaseUrl'] . '/colreqs',
        $payload,
        ['X-Api-Key: ' . (string) $config['ormApiKey']]
    );

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300) {
        $message = (string) ($response['json']['message'] ?? $response['json']['error'] ?? $response['json']['detail'] ?? $response['raw'] ?? 'BRT ORM non ha accettato la richiesta di ritiro.');
        throw new RuntimeException(trim($message) !== '' ? $message : 'BRT ORM non ha accettato la richiesta di ritiro.');
    }

    $items = is_array($response['json']) ? $response['json'] : [$response['json']];
    $firstItem = is_array($items[0] ?? null) ? $items[0] : [];
    $errors = is_array($firstItem['errors'] ?? null) ? $firstItem['errors'] : [];
    if ($errors !== []) {
        $firstError = is_array($errors[0] ?? null) ? $errors[0] : [];
        $message = (string) ($firstError['message'] ?? $firstError['description'] ?? $firstError['codeDesc'] ?? 'BRT ORM ha restituito un errore sul ritiro.');
        throw new RuntimeException(trim($message) !== '' ? $message : 'BRT ORM ha restituito un errore sul ritiro.');
    }

    $reservationNumber = trim((string) ($firstItem['ormReservationNumber'] ?? $firstItem['reservationNumber'] ?? ''));
    $ormNumber = trim((string) ($firstItem['ormNumber'] ?? $firstItem['reservationNumber'] ?? ''));

    return [
        'created' => $reservationNumber !== '' || $ormNumber !== '',
        'message' => ($reservationNumber !== '' || $ormNumber !== '')
            ? 'Ritiro automatico BRT prenotato.'
            : 'Richiesta ORM inviata ma nessun numero di prenotazione restituito.',
        'reservationNumber' => $reservationNumber,
        'ormNumber' => $ormNumber,
        'collectionDate' => $collectionDate,
        'collectionTime' => $collectionTime,
        'payload' => $response['json'],
    ];
}

function client_area_brt_confirm_shipment(int $numericSenderReference, string $alphanumericSenderReference, string $cmrCode = ''): array
{
    $config = client_area_brt_config();
    $payload = [
        'account' => client_area_build_brt_account($config),
        'confirmData' => [
            'senderCustomerCode' => (string) $config['senderCustomerCode'],
            'numericSenderReference' => $numericSenderReference,
            'alphanumericSenderReference' => $alphanumericSenderReference,
            'cmrCode' => $cmrCode,
        ],
    ];
    $response = client_area_brt_json_request('PUT', (string) $config['apiBase'] . '/shipment', $payload);
    $confirmResponse = is_array($response['json']['confirmResponse'] ?? null) ? $response['json']['confirmResponse'] : [];
    $execution = is_array($confirmResponse['executionMessage'] ?? null) ? $confirmResponse['executionMessage'] : [];
    $code = (int) ($execution['code'] ?? 0);

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300 || $code !== 0) {
        $message = (string) ($execution['message'] ?? $execution['codeDesc'] ?? ($response['json']['message'] ?? 'BRT non ha confermato la spedizione.'));
        throw new RuntimeException($message);
    }

    return ['confirmed' => true, 'message' => trim((string) ($execution['message'] ?? '')) ?: 'Spedizione confermata correttamente.'];
}

function client_area_brt_delete_shipment(int $numericSenderReference, string $alphanumericSenderReference): array
{
    $config = client_area_brt_config();
    $payload = [
        'account' => client_area_build_brt_account($config),
        'deleteData' => [
            'senderCustomerCode' => (string) $config['senderCustomerCode'],
            'numericSenderReference' => $numericSenderReference,
            'alphanumericSenderReference' => $alphanumericSenderReference,
        ],
    ];

    $response = client_area_brt_json_request('PUT', (string) $config['apiBase'] . '/delete', $payload);
    $deleteResponse = is_array($response['json']['deleteResponse'] ?? null) ? $response['json']['deleteResponse'] : [];
    $execution = is_array($deleteResponse['executionMessage'] ?? null) ? $deleteResponse['executionMessage'] : [];
    $code = (int) ($execution['code'] ?? 0);

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300 || $code !== 0) {
        $message = (string) ($execution['message'] ?? $execution['codeDesc'] ?? ($response['json']['message'] ?? 'BRT non ha annullato la spedizione.'));
        throw new RuntimeException($message);
    }

    return ['deleted' => true, 'message' => trim((string) ($execution['message'] ?? '')) ?: 'Spedizione annullata correttamente.'];
}

function client_area_brt_track_parcel(string $parcelId): array
{
    $config = client_area_brt_config();
    $url = (string) $config['apiBase'] . '/parcelID/' . rawurlencode(trim($parcelId));
    $response = public_api_http_request('GET', $url, [
        'Accept: application/json',
        'userID: ' . (string) $config['userId'],
        'password: ' . (string) $config['password'],
    ]);

    $json = is_array($response['json'] ?? null) ? $response['json'] : [];
    $tracking = is_array($json['ttParcelIdResponse'] ?? null) ? $json['ttParcelIdResponse'] : [];
    $execution = is_array($tracking['executionMessage'] ?? null) ? $tracking['executionMessage'] : [];
    $code = (int) ($execution['code'] ?? 0);

    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300 || $code !== 0) {
        $message = (string) ($execution['message'] ?? $execution['codeDesc'] ?? ($json['message'] ?? 'BRT non ha restituito i dati di tracking.'));
        throw new RuntimeException($message);
    }

    $shipment = is_array($tracking['bolla']['dati_spedizione'] ?? null) ? $tracking['bolla']['dati_spedizione'] : [];
    $eventsRaw = is_array($tracking['lista_eventi'] ?? null) ? $tracking['lista_eventi'] : [];
    $events = [];
    foreach ($eventsRaw as $item) {
        $evento = is_array($item['evento'] ?? null) ? $item['evento'] : [];
        $events[] = [
            'date' => (string) ($evento['data'] ?? ''),
            'time' => (string) ($evento['ora'] ?? ''),
            'description' => (string) ($evento['descrizione'] ?? $evento['descrizione_evento'] ?? $evento['filiale_descrizione'] ?? ''),
            'branch' => (string) ($evento['filiale'] ?? ''),
        ];
    }

    return [
        'parcelId' => $parcelId,
        'shipmentId' => (string) ($shipment['spedizione_id'] ?? ''),
        'status' => (string) ($shipment['stato_spedizione'] ?? ''),
        'statusDescription' => trim((string) ($shipment['descrizione_stato_sped_parte1'] ?? '') . ' ' . (string) ($shipment['descrizione_stato_sped_parte2'] ?? '')),
        'events' => $events,
    ];
}

function client_area_brt_create_manifest(int $numericSenderReference, string $alphanumericSenderReference): array
{
    $config = client_area_brt_config();
    $endpoint = (string) $config['apiBase'] . (((string) $config['manifestEndpoint'] !== '' && str_starts_with((string) $config['manifestEndpoint'], '/')) ? '' : '/') . (string) $config['manifestEndpoint'];
    $payload = [
        'account' => client_area_build_brt_account($config),
        'senderCustomerCode' => (string) $config['senderCustomerCode'],
        'shipments' => [[
            'numericSenderReference' => $numericSenderReference,
            'alphanumericSenderReference' => $alphanumericSenderReference,
        ]],
    ];

    $headers = [];
    $apiKey = trim((string) ($config['apiKey'] ?? ''));
    if ($apiKey !== '') {
        $headers[] = 'x-api-key: ' . $apiKey;
    }

    $response = client_area_brt_json_request('POST', $endpoint, $payload, $headers);
    if ((int) ($response['status'] ?? 0) < 200 || (int) ($response['status'] ?? 0) >= 300) {
        $message = (string) ($response['json']['message'] ?? 'BRT non ha generato il manifest.');
        throw new RuntimeException($message);
    }

    return [
        'created' => true,
        'message' => (string) ($response['json']['message'] ?? 'Richiesta manifest inviata a BRT.'),
        'payload' => $response['json'],
    ];
}
