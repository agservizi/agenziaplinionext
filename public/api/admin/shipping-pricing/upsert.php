<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_shipping_pricing_table();

$body = admin_api_parse_json_body();
$id = (int) ($body['id'] ?? 0);
$label = trim((string) ($body['label'] ?? ''));
$carrierProvider = strtolower(trim((string) ($body['carrierProvider'] ?? 'brt')));
$packageSize = strtolower(trim((string) ($body['packageSize'] ?? '')));
$serviceScope = strtolower(trim((string) ($body['serviceScope'] ?? 'all')));
$countryCode = strtoupper(trim((string) ($body['countryCode'] ?? '')));
$minWeightKG = (float) ($body['minWeightKG'] ?? 0);
$maxWeightKG = (float) ($body['maxWeightKG'] ?? 0);
$minVolumeM3 = (float) ($body['minVolumeM3'] ?? 0);
$maxVolumeM3 = (float) ($body['maxVolumeM3'] ?? 0);
$priceEUR = (float) ($body['priceEUR'] ?? 0);
$sortOrder = (int) ($body['sortOrder'] ?? 0);
$active = !empty($body['active']) ? 1 : 0;

if ($label === '') {
    admin_api_json(['message' => 'Etichetta regola obbligatoria'], 400);
}

if (!in_array($carrierProvider, ['brt', 'inpost'], true)) {
    admin_api_json(['message' => 'Corriere regola non valido'], 400);
}

if ($carrierProvider === 'inpost') {
    if (!in_array($packageSize, ['small', 'medium', 'large'], true)) {
        admin_api_json(['message' => 'Per InPost seleziona una taglia valida: S, M o L'], 400);
    }
} else {
    $packageSize = '';
}

if (!in_array($serviceScope, ['all', 'national', 'international'], true)) {
    admin_api_json(['message' => "Ambito regola non valido"], 400);
}

if ($serviceScope === 'national') {
    $countryCode = 'IT';
}
if ($serviceScope === 'international' && $countryCode === '') {
    $countryCode = 'ALL';
}
if ($countryCode !== '' && $countryCode !== 'ALL' && !preg_match('/^[A-Z]{2}$/', $countryCode)) {
    admin_api_json(['message' => 'Codice nazione non valido (usa IT, FR, DE... o ALL)'], 400);
}

$db = admin_api_require_db();

if ($id > 0) {
    $stmt = $db->prepare(
        "UPDATE shipping_pricing_rules
         SET label = ?, carrier_provider = ?, package_size = ?, service_scope = ?, country_code = ?, min_weight_kg = ?, max_weight_kg = ?, min_volume_m3 = ?, max_volume_m3 = ?, price_eur = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola'], 500);
    }
    $stmt->bind_param('sssssdddddiii', $label, $carrierProvider, $packageSize, $serviceScope, $countryCode, $minWeightKG, $maxWeightKG, $minVolumeM3, $maxVolumeM3, $priceEUR, $sortOrder, $active, $id);
    $ok = $stmt->execute();
    if (!$ok) {
        $error = (string) $stmt->error;
        $stmt->close();
        admin_api_json(['message' => 'Errore aggiornamento regola: ' . ($error !== '' ? $error : 'query non eseguita')], 500);
    }
    $stmt->close();
} else {
    $stmt = $db->prepare(
        "INSERT INTO shipping_pricing_rules
            (label, carrier_provider, package_size, service_scope, country_code, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola'], 500);
    }
    $stmt->bind_param('sssssdddddii', $label, $carrierProvider, $packageSize, $serviceScope, $countryCode, $minWeightKG, $maxWeightKG, $minVolumeM3, $maxVolumeM3, $priceEUR, $sortOrder, $active);
    $ok = $stmt->execute();
    if (!$ok) {
        $error = (string) $stmt->error;
        $stmt->close();
        admin_api_json(['message' => 'Errore inserimento regola: ' . ($error !== '' ? $error : 'query non eseguita')], 500);
    }
    $id = (int) $stmt->insert_id;
    $stmt->close();
}

$savedScope = $serviceScope;
$savedCountry = $countryCode;
$savedCarrierProvider = $carrierProvider;
$savedPackageSize = $packageSize;
$verifyStmt = $db->prepare("SELECT carrier_provider, package_size, service_scope, country_code FROM shipping_pricing_rules WHERE id = ? LIMIT 1");
if ($verifyStmt) {
    $verifyStmt->bind_param('i', $id);
    if ($verifyStmt->execute()) {
        $result = $verifyStmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if (is_array($row)) {
            $savedCarrierProvider = strtolower(trim((string) ($row['carrier_provider'] ?? $carrierProvider)));
            $savedPackageSize = strtolower(trim((string) ($row['package_size'] ?? $packageSize)));
            $savedScope = strtolower(trim((string) ($row['service_scope'] ?? $serviceScope)));
            $savedCountry = strtoupper(trim((string) ($row['country_code'] ?? $countryCode)));
        }
    }
    $verifyStmt->close();
}

admin_api_json([
    'ok' => true,
    'message' => 'Regola prezzo salvata',
    'savedRule' => [
        'id' => $id,
        'carrierProvider' => $savedCarrierProvider,
        'packageSize' => $savedPackageSize,
        'serviceScope' => $savedScope,
        'countryCode' => $savedCountry,
    ],
]);
