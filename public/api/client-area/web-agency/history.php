<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

$body = client_area_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));
$clientProfile = client_area_require_authenticated_client($token);

if (!client_area_has_database_config()) {
    client_area_json(['projects' => [], 'message' => 'Database non configurato.'], 200);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_web_agency_projects_table();

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
         LIMIT 100"
    );

    if (!$result) {
        throw new RuntimeException('Impossibile recuperare lo storico progetti.');
    }

    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $payload = client_area_decode_json_value($row['intake_payload_json'] ?? null);
        $quote = is_array($payload['quote'] ?? null) ? $payload['quote'] : [];
        $payloadUserId = (int) ($payload['clientUserId'] ?? 0);
        $payloadUsername = strtolower(trim((string) ($payload['clientUsername'] ?? '')));
        $payloadEmail = strtolower(trim((string) ($payload['clientEmail'] ?? ($row['email'] ?? ''))));
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

        $projects[] = [
            'requestId' => (int) ($row['request_id'] ?? 0),
            'projectType' => (string) ($row['project_type'] ?? $row['service_type'] ?? ''),
            'customerName' => (string) ($row['customer_name'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'phone' => (string) ($row['phone'] ?? ''),
            'notes' => (string) ($row['notes'] ?? ''),
            'requestStatus' => (string) ($row['status'] ?? ''),
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
            'createdAt' => $row['created_at'] ?? null,
            'quoteAvailable' => (($quote['url'] ?? '') !== ''),
            'quote' => [
                'fileName' => (string) ($quote['fileName'] ?? ''),
                'url' => (string) ($quote['url'] ?? ''),
                'sentAt' => (string) ($quote['sentAt'] ?? ''),
                'note' => (string) ($quote['note'] ?? ''),
            ],
        ];
    }
    $result->free();

    client_area_json(['projects' => $projects], 200);
} catch (Throwable $error) {
    client_area_json([
        'projects' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile recuperare lo storico progetti.',
    ], 500);
}
