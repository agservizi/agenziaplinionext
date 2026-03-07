<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

admin_api_require_session();
admin_api_ensure_visure_pricing_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT id, service_type, label, price_eur, sort_order, active
     FROM visure_pricing_rules
     ORDER BY sort_order ASC, id ASC"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento prezzi visure'], 500);
}

$rules = [];
while ($row = $result->fetch_assoc()) {
    $rules[] = [
        'id' => (int) ($row['id'] ?? 0),
        'serviceType' => (string) ($row['service_type'] ?? ''),
        'label' => (string) ($row['label'] ?? ''),
        'priceEUR' => (float) ($row['price_eur'] ?? 0),
        'sortOrder' => (int) ($row['sort_order'] ?? 0),
        'active' => !empty($row['active']),
    ];
}

admin_api_json(['ok' => true, 'rules' => $rules]);
