<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function client_area_fotocopie_ensure_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_photocopy_orders (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          order_token CHAR(64) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) NOT NULL DEFAULT '',\n          resident_city VARCHAR(120) NOT NULL DEFAULT '',\n          pickup_mode VARCHAR(80) NOT NULL DEFAULT 'ritiro_in_agenzia',\n          pdf_file_name VARCHAR(255) NOT NULL,\n          pdf_url TEXT NOT NULL,\n          page_count INT NOT NULL,\n          unit_price_cents INT NOT NULL,\n          amount_cents INT NOT NULL,\n          currency VARCHAR(8) NOT NULL DEFAULT 'eur',\n          stripe_session_id VARCHAR(191) NOT NULL DEFAULT '',\n          payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',\n          checkout_status VARCHAR(40) NOT NULL DEFAULT '',\n          admin_notified_at DATETIME NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_photocopy_order_token (order_token),\n          KEY idx_client_area_photocopy_request (request_id),\n          KEY idx_client_area_photocopy_status (payment_status),\n          KEY idx_client_area_photocopy_session (stripe_session_id)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['orders' => [], 'message' => 'Metodo non consentito.'], 405);
}

$body = client_area_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));
$clientProfile = client_area_require_authenticated_client($token);

if (!client_area_has_database_config()) {
    client_area_json(['orders' => [], 'message' => 'Database non configurato.'], 200);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_payments_table();
    client_area_fotocopie_ensure_table();

    $db = client_area_require_db();
    $result = $db->query(
        "SELECT
            o.id,
            o.request_id,
            o.customer_name,
            o.email,
            o.phone,
            o.resident_city,
            o.pickup_mode,
            o.pdf_file_name,
            o.pdf_url,
            o.page_count,
            o.unit_price_cents,
            o.amount_cents,
            o.currency,
            o.payment_status,
            o.checkout_status,
            o.admin_notified_at,
            o.created_at,
            r.details_json,
            r.status,
            p.price_label
         FROM client_area_photocopy_orders o
         INNER JOIN client_area_requests r ON r.id = o.request_id
         LEFT JOIN client_area_payments p ON p.request_id = o.request_id
         WHERE r.area = 'fotocopie-online'
         ORDER BY o.created_at DESC
         LIMIT 100"
    );

    if (!$result) {
        throw new RuntimeException('Impossibile recuperare lo storico fotocopie.');
    }

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $details = client_area_decode_json_value($row['details_json'] ?? null);
        $payloadUserId = (int) ($details['clientUserId'] ?? 0);
        $payloadUsername = strtolower(trim((string) ($details['clientUsername'] ?? '')));
        $payloadEmail = strtolower(trim((string) ($details['clientEmail'] ?? ($row['email'] ?? ''))));
        $currentUsername = strtolower(trim((string) ($clientProfile['username'] ?? '')));
        $currentEmail = strtolower(trim((string) ($clientProfile['email'] ?? '')));
        $currentUserId = (int) ($clientProfile['userId'] ?? 0);

        $ownedByClient = false;
        if ($currentUserId > 0 && $payloadUserId > 0 && $currentUserId === $payloadUserId) {
            $ownedByClient = true;
        } elseif ($currentEmail !== '' && $payloadEmail !== '' && $currentEmail === $payloadEmail) {
            $ownedByClient = true;
        } elseif ($currentUsername !== '' && $payloadUsername !== '' && $currentUsername === $payloadUsername) {
            $ownedByClient = true;
        }

        if (!$ownedByClient) {
            continue;
        }

        $orders[] = [
            'id' => (int) ($row['id'] ?? 0),
            'requestId' => (int) ($row['request_id'] ?? 0),
            'customerName' => (string) ($row['customer_name'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'residentCity' => (string) ($row['resident_city'] ?? ''),
            'pdfFileName' => (string) ($row['pdf_file_name'] ?? ''),
            'pdfUrl' => (string) ($row['pdf_url'] ?? ''),
            'pageCount' => (int) ($row['page_count'] ?? 0),
            'unitPriceCents' => (int) ($row['unit_price_cents'] ?? 0),
            'amountCents' => (int) ($row['amount_cents'] ?? 0),
            'currency' => (string) ($row['currency'] ?? 'eur'),
            'paymentStatus' => (string) ($row['payment_status'] ?? ''),
            'checkoutStatus' => (string) ($row['checkout_status'] ?? ''),
            'requestStatus' => (string) ($row['status'] ?? ''),
            'priceLabel' => (string) ($row['price_label'] ?? ''),
            'adminNotifiedAt' => $row['admin_notified_at'] ?? null,
            'createdAt' => $row['created_at'] ?? null,
        ];
    }
    $result->free();

    client_area_json(['orders' => $orders], 200);
} catch (Throwable $error) {
    client_area_json([
        'orders' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile recuperare lo storico fotocopie.',
    ], 500);
}
