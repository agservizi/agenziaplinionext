<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

$body = client_area_parse_json_body();
$token = trim((string) ($body['token'] ?? ''));
$clientProfile = client_area_require_authenticated_client($token);

$projectType = trim((string) ($body['projectType'] ?? ''));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$projectGoal = trim((string) ($body['projectGoal'] ?? ''));
$budgetRange = trim((string) ($body['budgetRange'] ?? ''));
$timeline = trim((string) ($body['timeline'] ?? ''));
$businessSector = trim((string) ($body['businessSector'] ?? ''));
$existingSiteUrl = trim((string) ($body['existingSiteUrl'] ?? ''));
$contactPreference = trim((string) ($body['contactPreference'] ?? ''));
$materialsReady = trim((string) ($body['materialsReady'] ?? ''));
$needsBranding = (bool) ($body['needsBranding'] ?? false);
$needsSeo = (bool) ($body['needsSeo'] ?? false);
$needsAdvertising = (bool) ($body['needsAdvertising'] ?? false);
$hasExistingSite = (bool) ($body['hasExistingSite'] ?? false);
$privacyConsent = (bool) ($body['privacyConsent'] ?? false);
$marketingConsent = (bool) ($body['marketingConsent'] ?? false);
$notes = trim((string) ($body['notes'] ?? ''));

if ($customerName === '' && $clientProfile['fullName'] !== '') {
    $customerName = (string) $clientProfile['fullName'];
}
if ($email === '' && $clientProfile['email'] !== '') {
    $email = (string) $clientProfile['email'];
}
if ($phone === '' && $clientProfile['phone'] !== '') {
    $phone = (string) $clientProfile['phone'];
}

$allowedProjectTypes = ['sito-vetrina', 'ecommerce', 'seo-local', 'gestionale', 'landing-page', 'advertising'];
$allowedBudgets = ['<1500', '1500-3000', '3000-7000', '7000+'];
$allowedTimelines = ['urgente', '30-giorni', '60-giorni', 'valutazione'];
$allowedContactPreferences = ['telefono', 'email', 'whatsapp', 'indifferente'];
$allowedMaterialsReady = ['nessuno', 'parziali', 'quasi-pronti', 'completi'];

if (!in_array($projectType, $allowedProjectTypes, true)) {
    client_area_json(['message' => 'Tipo progetto non valido.'], 400);
}

if ($customerName === '' || $phone === '' || !str_contains($email, '@')) {
    client_area_json(['message' => 'Compila nome, telefono ed email validi.'], 400);
}

if (!in_array($budgetRange, $allowedBudgets, true)) {
    client_area_json(['message' => 'Budget non valido.'], 400);
}

if (!in_array($timeline, $allowedTimelines, true)) {
    client_area_json(['message' => 'Tempistiche non valide.'], 400);
}

if (!in_array($contactPreference, $allowedContactPreferences, true)) {
    $contactPreference = 'indifferente';
}

if (!in_array($materialsReady, $allowedMaterialsReady, true)) {
    $materialsReady = 'nessuno';
}

if (!$privacyConsent) {
    client_area_json(['message' => 'È necessario accettare l’informativa privacy.'], 400);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_web_agency_projects_table();

    $db = client_area_require_db();
    $db->begin_transaction();

    $requestDetails = [
        'projectType' => $projectType,
        'projectGoal' => $projectGoal,
        'budgetRange' => $budgetRange,
        'timeline' => $timeline,
        'businessSector' => $businessSector,
        'existingSiteUrl' => $existingSiteUrl,
        'contactPreference' => $contactPreference,
        'materialsReady' => $materialsReady,
        'hasExistingSite' => $hasExistingSite,
        'needsBranding' => $needsBranding,
        'needsSeo' => $needsSeo,
        'needsAdvertising' => $needsAdvertising,
        'privacyConsent' => $privacyConsent,
        'marketingConsent' => $marketingConsent,
        'clientUsername' => (string) ($clientProfile['username'] ?? ''),
        'clientUserId' => (int) ($clientProfile['userId'] ?? 0),
        'clientSource' => (string) ($clientProfile['source'] ?? 'unknown'),
        'clientEmail' => (string) ($clientProfile['email'] ?? $email),
        'clientPhone' => (string) ($clientProfile['phone'] ?? $phone),
        'clientCompanyName' => (string) ($clientProfile['companyName'] ?? ''),
        'source' => 'client-area-web-agency',
    ];

    $detailsJson = json_encode($requestDetails, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($detailsJson === false) {
        throw new RuntimeException('Impossibile serializzare il brief progetto.');
    }

    $area = 'web-agency';
    $serviceType = $projectType;
    $requestStatus = 'brief-new';
    $insertRequest = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$insertRequest) {
        throw new RuntimeException('Impossibile registrare la richiesta progetto.');
    }

    $insertRequest->bind_param(
        'ssssssss',
        $area,
        $serviceType,
        $customerName,
        $email,
        $phone,
        $notes,
        $detailsJson,
        $requestStatus
    );
    $insertRequest->execute();
    $requestId = (int) $db->insert_id;
    $insertRequest->close();

    if ($requestId <= 0) {
        throw new RuntimeException('Impossibile ottenere l’identificativo progetto.');
    }

    $projectStatus = 'nuova';
    $privacyConsentInt = $privacyConsent ? 1 : 0;
    $marketingConsentInt = $marketingConsent ? 1 : 0;
    $hasExistingSiteInt = $hasExistingSite ? 1 : 0;
    $needsBrandingInt = $needsBranding ? 1 : 0;
    $needsSeoInt = $needsSeo ? 1 : 0;
    $needsAdvertisingInt = $needsAdvertising ? 1 : 0;

    $insertProject = $db->prepare(
        'INSERT INTO client_area_web_agency_projects
          (request_id, project_type, project_goal, budget_range, timeline, business_sector,
           existing_site_url, contact_preference, materials_ready, has_existing_site,
           needs_branding, needs_seo, needs_advertising, privacy_consent, marketing_consent,
           project_status, intake_payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$insertProject) {
        throw new RuntimeException('Impossibile registrare i dettagli progetto.');
    }

    $insertProject->bind_param(
        'issssssssiiiiiiss',
        $requestId,
        $projectType,
        $projectGoal,
        $budgetRange,
        $timeline,
        $businessSector,
        $existingSiteUrl,
        $contactPreference,
        $materialsReady,
        $hasExistingSiteInt,
        $needsBrandingInt,
        $needsSeoInt,
        $needsAdvertisingInt,
        $privacyConsentInt,
        $marketingConsentInt,
        $projectStatus,
        $detailsJson
    );
    $insertProject->execute();
    $insertProject->close();

    $db->commit();

    client_area_notify_event(
        'web-agency',
        'Nuovo brief Web Agency',
        $customerName,
        $email,
        $phone,
        [
            'tipoProgetto' => $projectType,
            'budget' => $budgetRange,
            'timeline' => $timeline,
            'settore' => $businessSector,
        ]
    );

    client_area_json([
        'requestId' => $requestId,
        'message' => 'Brief progetto registrato. Ti ricontatteremo con la proposta più adatta.',
    ], 200);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof mysqli) {
        $db->rollback();
    }

    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile registrare il progetto.',
    ], 500);
}
