<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_client_area_consulting_leads_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT
        r.id AS request_id,
        r.area,
        r.service_type,
        r.customer_name,
        r.email,
        r.phone,
        r.notes,
        r.status,
        r.created_at,
        r.updated_at,
        l.customer_type,
        l.business_name,
        l.vat_number,
        l.current_provider,
        l.monthly_spend_eur,
        l.city,
        l.best_contact_time,
        l.marketing_consent,
        l.lead_status,
        l.intake_payload_json
     FROM client_area_requests r
     INNER JOIN client_area_consulting_leads l ON l.request_id = r.id
     WHERE r.area = 'consulenza-utenze'
     ORDER BY r.created_at DESC
     LIMIT 200"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento lead consulenze'], 500);
}

$leads = [];
while ($row = $result->fetch_assoc()) {
    $payload = admin_api_decode_json_value($row['intake_payload_json'] ?? null);
    $quote = is_array($payload['quote'] ?? null) ? $payload['quote'] : [];

    $leads[] = [
        'requestId' => (int) ($row['request_id'] ?? 0),
        'serviceType' => (string) ($row['service_type'] ?? ''),
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'email' => (string) ($row['email'] ?? ''),
        'phone' => (string) ($row['phone'] ?? ''),
        'notes' => (string) ($row['notes'] ?? ''),
        'requestStatus' => (string) ($row['status'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
        'updatedAt' => $row['updated_at'] ?? null,
        'customerType' => (string) ($row['customer_type'] ?? 'privato'),
        'businessName' => (string) ($row['business_name'] ?? ''),
        'vatNumber' => (string) ($row['vat_number'] ?? ''),
        'currentProvider' => (string) ($row['current_provider'] ?? ''),
        'monthlySpendEUR' => (float) ($row['monthly_spend_eur'] ?? 0),
        'city' => (string) ($row['city'] ?? ''),
        'bestContactTime' => (string) ($row['best_contact_time'] ?? ''),
        'marketingConsent' => ((int) ($row['marketing_consent'] ?? 0)) === 1,
        'leadStatus' => (string) ($row['lead_status'] ?? 'nuova'),
        'operatorNotes' => (string) ($payload['operatorNotes'] ?? ''),
        'quote' => [
            'fileName' => (string) ($quote['fileName'] ?? ''),
            'url' => (string) ($quote['url'] ?? ''),
            'sentAt' => (string) ($quote['sentAt'] ?? ''),
            'note' => (string) ($quote['note'] ?? ''),
        ],
    ];
}

admin_api_json(['ok' => true, 'leads' => $leads]);
