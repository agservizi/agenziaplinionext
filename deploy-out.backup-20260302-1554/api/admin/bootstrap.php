<?php

declare(strict_types=1);

require_once __DIR__ . '/../admin-auth/bootstrap.php';
require_once __DIR__ . '/../public/bootstrap.php';

function admin_api_json(array $payload, int $status = 200): void
{
    admin_auth_json($payload, $status);
}

function admin_api_parse_json_body(): array
{
    return admin_auth_parse_json_body();
}

function admin_api_request_token(): string
{
    $headerToken = trim((string) ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ''));
    if ($headerToken !== '') {
        return $headerToken;
    }

    $queryToken = trim((string) ($_GET['token'] ?? ''));
    if ($queryToken !== '') {
        return $queryToken;
    }

    $body = admin_api_parse_json_body();
    return trim((string) ($body['token'] ?? ''));
}

function admin_api_require_session(): array
{
    $session = admin_auth_verify_token(admin_api_request_token());
    if (!$session) {
        admin_api_json(['message' => 'Sessione admin non valida'], 401);
    }

    return $session;
}

function admin_api_db(): ?mysqli
{
    return public_api_db();
}

function admin_api_require_db(): mysqli
{
    $db = admin_api_db();
    if (!$db) {
        admin_api_json(['message' => public_api_db_error_message()], 503);
    }

    return $db;
}

function admin_api_decode_json_value(mixed $value): array
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

function admin_api_ensure_client_area_requests_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          area VARCHAR(40) NOT NULL,
          service_type VARCHAR(120) NOT NULL,
          customer_name VARCHAR(191) NOT NULL,
          email VARCHAR(191) NOT NULL,
          phone VARCHAR(80) DEFAULT '',
          notes TEXT DEFAULT '',
          details_json JSON NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'new',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_client_area_requests_area (area),
          KEY idx_client_area_requests_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_client_area_shipments_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_shipments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NULL,
          tracking_code VARCHAR(64) NOT NULL DEFAULT '',
          parcel_id VARCHAR(64) NOT NULL DEFAULT '',
          shipment_number_from VARCHAR(32) NOT NULL DEFAULT '',
          shipment_number_to VARCHAR(32) NOT NULL DEFAULT '',
          label_pdf_base64 LONGTEXT NULL,
          brt_response_json JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_client_area_shipments_tracking (tracking_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_client_area_payments_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NULL,
          shipment_id INT NULL,
          stripe_session_id VARCHAR(191) NOT NULL,
          amount_cents INT NOT NULL DEFAULT 0,
          currency VARCHAR(8) NOT NULL DEFAULT 'eur',
          payment_status VARCHAR(40) NOT NULL DEFAULT '',
          checkout_status VARCHAR(40) NOT NULL DEFAULT '',
          price_label VARCHAR(191) NOT NULL DEFAULT '',
          stripe_response_json JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_client_area_payments_session (stripe_session_id),
          KEY idx_client_area_payments_request (request_id),
          KEY idx_client_area_payments_shipment (shipment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_client_area_invoices_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NULL,
          payment_id INT NULL,
          shipment_id INT NULL,
          provider VARCHAR(80) NOT NULL DEFAULT 'pending',
          provider_document_id VARCHAR(191) NOT NULL DEFAULT '',
          status VARCHAR(60) NOT NULL DEFAULT 'pending_provider_config',
          invoice_pdf_url TEXT NULL,
          billing_json JSON NULL,
          provider_payload_json JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_client_area_invoices_request (request_id),
          KEY idx_client_area_invoices_payment (payment_id),
          KEY idx_client_area_invoices_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_client_area_visure_requests_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_visure_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NULL,
          provider VARCHAR(80) NOT NULL DEFAULT '',
          provider_service VARCHAR(191) NOT NULL DEFAULT '',
          provider_request_id VARCHAR(191) NOT NULL DEFAULT '',
          provider_status VARCHAR(80) NOT NULL DEFAULT '',
          document_url TEXT NULL,
          provider_response_json JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_client_area_visure_requests_request (request_id),
          KEY idx_client_area_visure_requests_provider_status (provider_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_shipping_pricing_table(): void
{
    public_api_ensure_shipping_pricing_table();
}

function admin_api_ensure_visure_pricing_table(): void
{
    public_api_ensure_visure_pricing_table();
}

function admin_api_ensure_caf_patronato_pricing_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS caf_patronato_pricing_rules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          service_type VARCHAR(120) NOT NULL,
          label VARCHAR(191) NOT NULL,
          price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
          sort_order INT NOT NULL DEFAULT 0,
          active TINYINT(1) NOT NULL DEFAULT 1,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_caf_patronato_pricing_service (service_type),
          KEY idx_caf_patronato_pricing_active (active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_caf_requests_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_caf_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          service_scope VARCHAR(40) NOT NULL,
          service_label VARCHAR(191) NOT NULL,
          category_label VARCHAR(191) NOT NULL,
          preferred_contact_method VARCHAR(80) NOT NULL DEFAULT '',
          preferred_contact_date DATE NULL,
          urgency VARCHAR(191) NOT NULL DEFAULT '',
          document_summary TEXT NULL,
          intake_status VARCHAR(40) NOT NULL DEFAULT 'awaiting_review',
          operator_email VARCHAR(191) NOT NULL DEFAULT '',
          operator_email_status VARCHAR(40) NOT NULL DEFAULT 'pending',
          operator_email_sent_at DATETIME NULL,
          magic_link_expires_at DATETIME NULL,
          operator_notes TEXT NULL,
          resolved_at DATETIME NULL,
          intake_payload_json JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_client_area_caf_request (request_id),
          KEY idx_client_area_caf_status (intake_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_ensure_caf_files_table(): void
{
    $db = admin_api_require_db();
    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_caf_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          source_role VARCHAR(32) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          stored_name VARCHAR(255) NOT NULL,
          public_url TEXT NOT NULL,
          mime_type VARCHAR(191) NOT NULL DEFAULT '',
          size_bytes BIGINT NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_client_area_caf_files_request (request_id),
          KEY idx_client_area_caf_files_role (source_role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function admin_api_site_base_url(): string
{
    $configured = rtrim((string) (admin_auth_env('DIGITAL_DELIVERY_BASE_URL', admin_auth_env('NEXT_PUBLIC_SITE_URL', '')) ?: ''), '/');
    if ($configured !== '') {
        return $configured;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    return $scheme . '://' . $host;
}

function admin_api_base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function admin_api_signed_download_url(int $fileId): string
{
    $secret = trim((string) admin_auth_env(
        'CAF_PATRONATO_FILE_LINK_SECRET',
        admin_auth_env(
            'CAF_PATRONATO_MAGIC_LINK_SECRET',
            admin_auth_env('ADMIN_PORTAL_SESSION_SECRET', 'ag-caf-patronato-file-link')
        )
    ));
    $ttlHours = (int) (admin_auth_env('CAF_PATRONATO_FILE_LINK_TTL_HOURS', '48') ?: '48');
    $payload = json_encode([
        'fileId' => $fileId,
        'exp' => ((int) round(microtime(true) * 1000)) + max(1, $ttlHours) * 60 * 60 * 1000,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $encoded = admin_api_base64url_encode((string) $payload);
    $signature = admin_api_base64url_encode(hash_hmac('sha256', $encoded, $secret, true));

    return admin_api_site_base_url() . '/scarica-pratica/caf-patronato?token=' . rawurlencode($encoded . '.' . $signature);
}

function admin_api_get_caf_files_map(array $requestIds): array
{
    if ($requestIds === []) {
        return [];
    }

    admin_api_ensure_caf_files_table();
    $db = admin_api_require_db();
    $ids = array_values(array_filter(array_map('intval', $requestIds), static fn(int $id): bool => $id > 0));
    if ($ids === []) {
        return [];
    }

    $placeholders = implode(', ', array_fill(0, count($ids), '?'));
    $types = str_repeat('i', count($ids));
    $stmt = $db->prepare(
        "SELECT
            id,
            request_id,
            source_role,
            original_name,
            stored_name,
            public_url,
            mime_type,
            size_bytes,
            created_at
         FROM client_area_caf_files
         WHERE request_id IN ($placeholders)
         ORDER BY created_at ASC"
    );

    if (!$stmt) {
        return [];
    }

    $stmt->bind_param($types, ...$ids);
    $stmt->execute();
    $result = $stmt->get_result();
    $map = [];

    if ($result instanceof mysqli_result) {
        while ($row = $result->fetch_assoc()) {
            $requestId = (int) ($row['request_id'] ?? 0);
            if ($requestId <= 0) {
                continue;
            }

            if (!isset($map[$requestId])) {
                $map[$requestId] = [];
            }

            $fileId = (int) ($row['id'] ?? 0);
            $map[$requestId][] = [
                'sourceRole' => (string) ($row['source_role'] ?? ''),
                'originalName' => (string) ($row['original_name'] ?? ''),
                'publicUrl' => (string) ($row['public_url'] ?? ''),
                'downloadUrl' => $fileId > 0 ? admin_api_signed_download_url($fileId) : (string) ($row['public_url'] ?? ''),
                'mimeType' => (string) ($row['mime_type'] ?? ''),
                'sizeBytes' => (int) ($row['size_bytes'] ?? 0),
                'createdAt' => $row['created_at'] ?? null,
            ];
        }
    }

    $stmt->close();
    return $map;
}

function admin_api_map_caf_request_row(array $row, array $filesMap): array
{
    $requestId = (int) ($row['request_id'] ?? $row['id'] ?? 0);
    $files = $filesMap[$requestId] ?? [];

    return [
        'requestId' => $requestId,
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'email' => (string) ($row['email'] ?? ''),
        'phone' => (string) ($row['phone'] ?? ''),
        'notes' => (string) ($row['notes'] ?? ''),
        'serviceType' => (string) ($row['service_type'] ?? ''),
        'serviceScope' => (string) ($row['service_scope'] ?? ''),
        'serviceLabel' => (string) ($row['service_label'] ?? ''),
        'categoryLabel' => (string) ($row['category_label'] ?? ''),
        'preferredContactMethod' => (string) ($row['preferred_contact_method'] ?? ''),
        'preferredContactDate' => $row['preferred_contact_date'] ?? null,
        'urgency' => (string) ($row['urgency'] ?? ''),
        'documentSummary' => (string) ($row['document_summary'] ?? ''),
        'status' => (string) ($row['status'] ?? $row['intake_status'] ?? ''),
        'intakeStatus' => (string) ($row['intake_status'] ?? ''),
        'operatorEmail' => (string) ($row['operator_email'] ?? ''),
        'operatorEmailStatus' => (string) ($row['operator_email_status'] ?? ''),
        'operatorEmailSentAt' => $row['operator_email_sent_at'] ?? null,
        'magicLinkExpiresAt' => $row['magic_link_expires_at'] ?? null,
        'operatorNotes' => (string) ($row['operator_notes'] ?? ''),
        'resolvedAt' => $row['resolved_at'] ?? null,
        'paymentAmountCents' => (int) ($row['payment_amount_cents'] ?? 0),
        'paymentCurrency' => (string) ($row['payment_currency'] ?? 'eur'),
        'priceLabel' => (string) ($row['price_label'] ?? ''),
        'paymentStatus' => (string) ($row['payment_status'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
        'updatedAt' => $row['updated_at'] ?? null,
        'customerFiles' => array_values(array_filter($files, static fn(array $file): bool => $file['sourceRole'] === 'customer')),
        'resolvedFiles' => array_values(array_filter($files, static fn(array $file): bool => $file['sourceRole'] === 'operator')),
    ];
}
