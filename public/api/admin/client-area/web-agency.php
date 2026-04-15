<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_client_area_web_agency_projects_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT
        r.id AS request_id,
        r.service_type,
        r.customer_name,
        r.email,
        r.phone,
        r.notes,
        r.status,
        r.created_at,
        r.updated_at,
        p.project_type,
        p.project_goal,
        p.budget_range,
        p.timeline,
        p.business_sector,
        p.existing_site_url,
        p.contact_preference,
        p.materials_ready,
        p.has_existing_site,
        p.needs_branding,
        p.needs_seo,
        p.needs_advertising,
        p.marketing_consent,
        p.project_status,
        p.intake_payload_json
     FROM client_area_requests r
     INNER JOIN client_area_web_agency_projects p ON p.request_id = r.id
     WHERE r.area = 'web-agency'
     ORDER BY r.created_at DESC
     LIMIT 200"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento progetti web agency'], 500);
}

$projects = [];
while ($row = $result->fetch_assoc()) {
    $payload = admin_api_decode_json_value($row['intake_payload_json'] ?? null);
    $quote = is_array($payload['quote'] ?? null) ? $payload['quote'] : [];

    $projects[] = [
        'requestId' => (int) ($row['request_id'] ?? 0),
        'projectType' => (string) ($row['project_type'] ?? $row['service_type'] ?? ''),
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'email' => (string) ($row['email'] ?? ''),
        'phone' => (string) ($row['phone'] ?? ''),
        'clientUsername' => (string) ($payload['clientUsername'] ?? ''),
        'clientCompanyName' => (string) ($payload['clientCompanyName'] ?? ''),
        'clientSource' => (string) ($payload['clientSource'] ?? ''),
        'notes' => (string) ($row['notes'] ?? ''),
        'requestStatus' => (string) ($row['status'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
        'updatedAt' => $row['updated_at'] ?? null,
        'projectGoal' => (string) ($row['project_goal'] ?? ''),
        'budgetRange' => (string) ($row['budget_range'] ?? ''),
        'timeline' => (string) ($row['timeline'] ?? ''),
        'businessSector' => (string) ($row['business_sector'] ?? ''),
        'existingSiteUrl' => (string) ($row['existing_site_url'] ?? ''),
        'contactPreference' => (string) ($row['contact_preference'] ?? ''),
        'materialsReady' => (string) ($row['materials_ready'] ?? ''),
        'hasExistingSite' => ((int) ($row['has_existing_site'] ?? 0)) === 1,
        'needsBranding' => ((int) ($row['needs_branding'] ?? 0)) === 1,
        'needsSeo' => ((int) ($row['needs_seo'] ?? 0)) === 1,
        'needsAdvertising' => ((int) ($row['needs_advertising'] ?? 0)) === 1,
        'marketingConsent' => ((int) ($row['marketing_consent'] ?? 0)) === 1,
        'projectStatus' => (string) ($row['project_status'] ?? 'nuova'),
        'operatorNotes' => (string) ($payload['operatorNotes'] ?? ''),
        'quote' => [
            'fileName' => (string) ($quote['fileName'] ?? ''),
            'url' => (string) ($quote['url'] ?? ''),
            'sentAt' => (string) ($quote['sentAt'] ?? ''),
            'note' => (string) ($quote['note'] ?? ''),
        ],
    ];
}

admin_api_json(['ok' => true, 'projects' => $projects]);
