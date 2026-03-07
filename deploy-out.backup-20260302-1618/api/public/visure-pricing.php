<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$db = public_api_db();
if (!$db) {
    public_api_json([
        'ok' => true,
        'rules' => [],
        'warning' => public_api_db_error_message(),
    ]);
}

try {
    public_api_ensure_visure_pricing_table();

    $result = $db->query("
        SELECT id, service_type, label, price_eur, sort_order, active
        FROM visure_pricing_rules
        WHERE active = 1
        ORDER BY sort_order ASC, id ASC
    ");

    if (!$result) {
        public_api_json(['message' => 'Errore caricamento prezzi visure'], 500);
    }

    $rules = [];
    while ($row = $result->fetch_assoc()) {
        $rules[] = [
            'id' => (int) ($row['id'] ?? 0),
            'serviceType' => (string) ($row['service_type'] ?? ''),
            'label' => (string) ($row['label'] ?? ''),
            'priceEUR' => (float) ($row['price_eur'] ?? 0),
            'sortOrder' => (int) ($row['sort_order'] ?? 0),
            'active' => (bool) ($row['active'] ?? false),
        ];
    }
    $result->free();

    public_api_json([
        'ok' => true,
        'rules' => $rules,
    ]);
} catch (Throwable $error) {
    public_api_json([
        'message' => 'Errore caricamento prezzi visure',
    ], 500);
}
