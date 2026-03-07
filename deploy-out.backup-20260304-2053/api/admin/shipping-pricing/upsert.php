<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_shipping_pricing_table();

$body = admin_api_parse_json_body();
$id = (int) ($body['id'] ?? 0);
$label = trim((string) ($body['label'] ?? ''));
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

$db = admin_api_require_db();

if ($id > 0) {
    $stmt = $db->prepare(
        "UPDATE shipping_pricing_rules
         SET label = ?, min_weight_kg = ?, max_weight_kg = ?, min_volume_m3 = ?, max_volume_m3 = ?, price_eur = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola'], 500);
    }
    $stmt->bind_param('sddddddii', $label, $minWeightKG, $maxWeightKG, $minVolumeM3, $maxVolumeM3, $priceEUR, $sortOrder, $active, $id);
    $stmt->execute();
    $stmt->close();
} else {
    $stmt = $db->prepare(
        "INSERT INTO shipping_pricing_rules
            (label, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola'], 500);
    }
    $stmt->bind_param('sddddddi', $label, $minWeightKG, $maxWeightKG, $minVolumeM3, $maxVolumeM3, $priceEUR, $sortOrder, $active);
    $stmt->execute();
    $stmt->close();
}

admin_api_json(['ok' => true, 'message' => 'Regola prezzo salvata']);
