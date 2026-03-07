<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

admin_api_require_session();
admin_api_ensure_shipping_pricing_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT id, label, min_weight_kg, max_weight_kg, min_volume_m3, max_volume_m3, price_eur, sort_order, active
     FROM shipping_pricing_rules
     ORDER BY sort_order ASC, id ASC"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento prezzi spedizioni'], 500);
}

$rules = [];
while ($row = $result->fetch_assoc()) {
    $rules[] = [
        'id' => (int) ($row['id'] ?? 0),
        'label' => (string) ($row['label'] ?? ''),
        'minWeightKG' => (float) ($row['min_weight_kg'] ?? 0),
        'maxWeightKG' => (float) ($row['max_weight_kg'] ?? 0),
        'minVolumeM3' => (float) ($row['min_volume_m3'] ?? 0),
        'maxVolumeM3' => (float) ($row['max_volume_m3'] ?? 0),
        'priceEUR' => (float) ($row['price_eur'] ?? 0),
        'sortOrder' => (int) ($row['sort_order'] ?? 0),
        'active' => !empty($row['active']),
    ];
}

admin_api_json(['ok' => true, 'rules' => $rules]);
