<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function caf_file_token_secret(): string
{
    return trim((string) (public_api_env('CAF_PATRONATO_FILE_LINK_SECRET', public_api_env('CAF_PATRONATO_MAGIC_LINK_SECRET', 'ag-caf-file-link')) ?: 'ag-caf-file-link'));
}

function caf_file_token_ttl_hours(): int
{
    $ttl = (int) (public_api_env('CAF_PATRONATO_FILE_LINK_TTL_HOURS', '48') ?: '48');
    return $ttl > 0 ? $ttl : 48;
}

function caf_build_file_token(int $fileId): string
{
    $exp = time() + (caf_file_token_ttl_hours() * 3600);
    $payload = $fileId . ':' . $exp;
    $sig = hash_hmac('sha256', $payload, caf_file_token_secret());
    return rtrim(strtr(base64_encode($payload . ':' . $sig), '+/', '-_'), '=');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['requests' => [], 'message' => 'Database non configurato'], 503);
}

try {
    $db = client_area_require_db();

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_requests (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          service_scope VARCHAR(40) NOT NULL,\n          service_label VARCHAR(191) NOT NULL,\n          category_label VARCHAR(191) NOT NULL,\n          preferred_contact_method VARCHAR(80) NOT NULL DEFAULT '',\n          preferred_contact_date DATE NULL,\n          urgency VARCHAR(191) NOT NULL DEFAULT '',\n          document_summary TEXT NULL,\n          intake_status VARCHAR(40) NOT NULL DEFAULT 'awaiting_review',\n          operator_email VARCHAR(191) NOT NULL DEFAULT '',\n          operator_email_status VARCHAR(40) NOT NULL DEFAULT 'pending',\n          operator_email_sent_at DATETIME NULL,\n          magic_link_expires_at DATETIME NULL,\n          operator_notes TEXT NULL,\n          resolved_at DATETIME NULL,\n          intake_payload_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_caf_request (request_id),\n          KEY idx_client_area_caf_status (intake_status)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_files (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          source_role VARCHAR(32) NOT NULL,\n          original_name VARCHAR(255) NOT NULL,\n          stored_name VARCHAR(255) NOT NULL,\n          public_url TEXT NOT NULL,\n          mime_type VARCHAR(191) NOT NULL DEFAULT '',\n          size_bytes BIGINT NOT NULL DEFAULT 0,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          KEY idx_client_area_caf_files_request (request_id),\n          KEY idx_client_area_caf_files_role (source_role)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $query = "SELECT
       r.id AS request_id,
       r.customer_name,
       r.email,
       r.phone,
       r.notes,
       r.service_type,
       r.status,
       r.created_at,
       r.updated_at,
       c.service_scope,
       c.service_label,
       c.category_label,
       c.preferred_contact_method,
       c.preferred_contact_date,
       c.urgency,
       c.document_summary,
       c.intake_status,
       c.operator_email,
       c.operator_email_status,
       c.operator_email_sent_at,
       c.magic_link_expires_at,
       c.operator_notes,
       c.resolved_at,
       (
         SELECT p.amount_cents
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_amount_cents,
       (
         SELECT p.currency
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_currency,
       (
         SELECT p.price_label
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS price_label,
       (
         SELECT p.payment_status
         FROM client_area_payments p
         WHERE p.request_id = r.id
         ORDER BY p.updated_at DESC, p.id DESC
         LIMIT 1
       ) AS payment_status
     FROM client_area_requests r
     INNER JOIN client_area_caf_requests c ON c.request_id = r.id
     WHERE r.area = 'caf-patronato'
     ORDER BY r.created_at DESC
     LIMIT 100";

    $result = $db->query($query);
    if (!$result) {
        throw new RuntimeException('Impossibile recuperare lo storico pratiche.');
    }

    $requests = [];
    $requestIds = [];
    while ($row = $result->fetch_assoc()) {
        $requestId = (int) ($row['request_id'] ?? 0);
        if ($requestId <= 0) continue;
        $requestIds[] = $requestId;
        $requests[$requestId] = [
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
            'status' => (string) ($row['status'] ?? ''),
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
            'customerFiles' => [],
            'resolvedFiles' => [],
        ];
    }
    $result->free();

    if ($requestIds !== []) {
        $idsSql = implode(',', array_map(static fn($id) => (string) ((int) $id), $requestIds));
        $filesResult = $db->query(
            "SELECT id, request_id, source_role, original_name, stored_name, public_url
             FROM client_area_caf_files
             WHERE request_id IN ($idsSql)
             ORDER BY created_at ASC"
        );

        if ($filesResult) {
            while ($fileRow = $filesResult->fetch_assoc()) {
                $requestId = (int) ($fileRow['request_id'] ?? 0);
                if (!isset($requests[$requestId])) continue;

                $downloadUrl = '/scarica-pratica/caf-patronato?token=' . rawurlencode(caf_build_file_token((int) ($fileRow['id'] ?? 0)));
                $item = [
                    'originalName' => (string) ($fileRow['original_name'] ?? 'documento'),
                    'downloadUrl' => $downloadUrl,
                ];

                $sourceRole = (string) ($fileRow['source_role'] ?? 'customer');
                if ($sourceRole === 'operator') {
                    $requests[$requestId]['resolvedFiles'][] = $item;
                } else {
                    $requests[$requestId]['customerFiles'][] = $item;
                }
            }
            $filesResult->free();
        }
    }

    client_area_json(['requests' => array_values($requests)], 200);
} catch (Throwable $error) {
    client_area_json([
        'requests' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile recuperare lo storico pratiche.',
    ], 500);
}
