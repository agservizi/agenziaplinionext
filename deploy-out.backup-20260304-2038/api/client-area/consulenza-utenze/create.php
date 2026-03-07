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

$serviceType = trim((string) ($body['serviceType'] ?? ''));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));
$phone = trim((string) ($body['phone'] ?? ''));
$customerType = trim((string) ($body['customerType'] ?? 'privato'));
$businessName = trim((string) ($body['businessName'] ?? ''));
$vatNumber = trim((string) ($body['vatNumber'] ?? ''));
$currentProvider = trim((string) ($body['currentProvider'] ?? ''));
$monthlySpendEUR = (float) ($body['monthlySpendEUR'] ?? 0);
$city = trim((string) ($body['city'] ?? ''));
$bestContactTime = trim((string) ($body['bestContactTime'] ?? ''));
$notes = trim((string) ($body['notes'] ?? ''));
$privacyConsent = (bool) ($body['privacyConsent'] ?? false);
$marketingConsent = (bool) ($body['marketingConsent'] ?? false);

$allowedServiceTypes = ['telefonia', 'luce', 'gas'];
if (!in_array($serviceType, $allowedServiceTypes, true)) {
    client_area_json(['message' => 'Servizio non valido.'], 400);
}

if ($customerName === '' || $phone === '' || !str_contains($email, '@')) {
    client_area_json(['message' => 'Compila nome, telefono ed email validi.'], 400);
}

if (!in_array($customerType, ['privato', 'azienda'], true)) {
    $customerType = 'privato';
}

if (!$privacyConsent) {
    client_area_json(['message' => 'È necessario accettare l’informativa privacy.'], 400);
}

if ($monthlySpendEUR < 0) {
    $monthlySpendEUR = 0;
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_consulting_leads_table();

    $db = client_area_require_db();
    $db->begin_transaction();

    $requestDetails = [
        'serviceType' => $serviceType,
        'customerType' => $customerType,
        'businessName' => $businessName,
        'vatNumber' => $vatNumber,
        'currentProvider' => $currentProvider,
        'monthlySpendEUR' => $monthlySpendEUR,
        'city' => $city,
        'bestContactTime' => $bestContactTime,
        'privacyConsent' => $privacyConsent,
        'marketingConsent' => $marketingConsent,
        'source' => 'client-area-consulenza-utenze',
    ];

    $detailsJson = json_encode($requestDetails, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($detailsJson === false) {
        throw new RuntimeException('Impossibile serializzare i dettagli richiesta.');
    }

    $requestStatus = 'lead-new';
    $insertRequest = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$insertRequest) {
        throw new RuntimeException('Impossibile registrare la richiesta lead.');
    }

    $area = 'consulenza-utenze';
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
        throw new RuntimeException('Impossibile ottenere l’identificativo lead.');
    }

    $leadStatus = 'nuova';
    $privacyConsentInt = $privacyConsent ? 1 : 0;
    $marketingConsentInt = $marketingConsent ? 1 : 0;

    $insertLead = $db->prepare(
        'INSERT INTO client_area_consulting_leads
          (request_id, service_type, customer_type, business_name, vat_number, current_provider,
           monthly_spend_eur, city, best_contact_time, privacy_consent, marketing_consent,
           lead_status, intake_payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)' 
    );

    if (!$insertLead) {
        throw new RuntimeException('Impossibile registrare i dettagli lead.');
    }

    $insertLead->bind_param(
        'isssssdssiiss',
        $requestId,
        $serviceType,
        $customerType,
        $businessName,
        $vatNumber,
        $currentProvider,
        $monthlySpendEUR,
        $city,
        $bestContactTime,
        $privacyConsentInt,
        $marketingConsentInt,
        $leadStatus,
        $detailsJson
    );
    $insertLead->execute();
    $insertLead->close();

    $db->commit();

    client_area_notify_event(
        'consulenza-utenze',
        'Nuova lead consulenza utenze',
        $customerName,
        $email,
        $phone,
        [
            'servizio' => $serviceType,
            'tipoCliente' => $customerType,
            'statoLead' => $leadStatus,
            'citta' => $city,
        ]
    );

    client_area_json([
        'requestId' => $requestId,
        'message' => 'Lead registrata con successo. Il team ti contatterà per la consulenza.',
    ], 200);
} catch (Throwable $error) {
    if (isset($db) && $db instanceof mysqli) {
        $db->rollback();
    }

    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile registrare la lead.',
    ], 500);
}
