<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['leads' => [], 'message' => 'Database non configurato.'], 200);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_consulting_leads_table();

    $db = client_area_require_db();
    $result = $db->query(
        "SELECT
            r.id AS request_id,
            r.customer_name,
            r.email,
            r.phone,
            r.notes,
            r.service_type,
            r.status,
            r.created_at,
            l.customer_type,
            l.business_name,
            l.vat_number,
            l.current_provider,
            l.monthly_spend_eur,
            l.city,
            l.best_contact_time,
            l.privacy_consent,
            l.marketing_consent,
            l.lead_status
         FROM client_area_requests r
         INNER JOIN client_area_consulting_leads l ON l.request_id = r.id
         WHERE r.area = 'consulenza-utenze'
         ORDER BY r.created_at DESC
         LIMIT 100"
    );

    if (!$result) {
        throw new RuntimeException('Impossibile recuperare lo storico lead.');
    }

    $leads = [];
    while ($row = $result->fetch_assoc()) {
        $leads[] = [
            'requestId' => (int) ($row['request_id'] ?? 0),
            'serviceType' => (string) ($row['service_type'] ?? ''),
            'customerName' => (string) ($row['customer_name'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'phone' => (string) ($row['phone'] ?? ''),
            'notes' => (string) ($row['notes'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'customerType' => (string) ($row['customer_type'] ?? 'privato'),
            'businessName' => (string) ($row['business_name'] ?? ''),
            'vatNumber' => (string) ($row['vat_number'] ?? ''),
            'currentProvider' => (string) ($row['current_provider'] ?? ''),
            'monthlySpendEUR' => (float) ($row['monthly_spend_eur'] ?? 0),
            'city' => (string) ($row['city'] ?? ''),
            'bestContactTime' => (string) ($row['best_contact_time'] ?? ''),
            'privacyConsent' => ((int) ($row['privacy_consent'] ?? 0)) === 1,
            'marketingConsent' => ((int) ($row['marketing_consent'] ?? 0)) === 1,
            'leadStatus' => (string) ($row['lead_status'] ?? 'nuova'),
            'createdAt' => $row['created_at'] ?? null,
        ];
    }
    $result->free();

    client_area_json(['leads' => $leads], 200);
} catch (Throwable $error) {
    client_area_json([
        'leads' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile recuperare lo storico lead.',
    ], 500);
}
