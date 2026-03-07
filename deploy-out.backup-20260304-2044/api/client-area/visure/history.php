<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json([
        'visure' => [],
        'message' => 'Database non configurato.',
    ], 200);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_visure_requests_table();
    client_area_ensure_client_area_payments_table();

    $db = client_area_require_db();
    $result = $db->query(
        "SELECT
            r.id,
            r.customer_name,
            r.email,
            r.service_type,
            r.status,
            r.details_json,
            r.created_at,
            v.provider,
            v.provider_service,
            v.provider_request_id,
            v.provider_status,
            v.document_url,
            p.amount_cents,
            p.currency,
            p.price_label,
            p.payment_status
         FROM client_area_requests r
         LEFT JOIN client_area_visure_requests v ON v.request_id = r.id
         LEFT JOIN client_area_payments p ON p.request_id = r.id
         WHERE r.area = 'visure'
         ORDER BY r.created_at DESC
         LIMIT 20"
    );

    if (!$result) {
        client_area_json([
            'visure' => [],
            'message' => 'Caricamento storico visure non riuscito.',
        ], 500);
    }

    $visure = [];
    while ($row = $result->fetch_assoc()) {
        $details = client_area_decode_json_value($row['details_json'] ?? null);
        $providerSummary = is_array($details['providerSummary'] ?? null) ? $details['providerSummary'] : [];

        $visure[] = [
            'id' => (int) ($row['id'] ?? 0),
            'customerName' => (string) ($row['customer_name'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'serviceType' => (string) ($row['service_type'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'createdAt' => $row['created_at'] ?? null,
            'provider' => (string) ($row['provider'] ?? ''),
            'providerService' => (string) ($row['provider_service'] ?? ''),
            'providerRequestId' => (string) ($row['provider_request_id'] ?? ''),
            'providerStatus' => (string) ($row['provider_status'] ?? ''),
            'documentUrl' => (string) ($row['document_url'] ?? ''),
            'paymentAmountCents' => (int) ($row['amount_cents'] ?? 0),
            'paymentCurrency' => (string) ($row['currency'] ?? 'eur'),
            'priceLabel' => (string) ($row['price_label'] ?? ''),
            'paymentStatus' => (string) ($row['payment_status'] ?? ''),
            'summary' => $providerSummary,
        ];
    }

    $result->free();
    client_area_json(['visure' => $visure], 200);
} catch (Throwable $error) {
    client_area_json([
        'visure' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Caricamento storico visure non riuscito.',
    ], 500);
}
