<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['rules' => []], 200);
}

$db = client_area_db();
if (!$db) {
    client_area_json(['rules' => []], 200);
}

try {
    public_api_ensure_visure_pricing_table();
    $result = $db->query(
        "SELECT id, service_type, label, price_eur, sort_order, active
         FROM visure_pricing_rules
         WHERE active = 1
         ORDER BY sort_order ASC, id ASC"
    );

    if (!$result) {
        client_area_json([
            'rules' => [],
            'message' => 'Caricamento listino visure non riuscito.',
        ], 500);
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
    client_area_json(['rules' => $rules], 200);
} catch (Throwable $error) {
    client_area_json([
        'rules' => [],
        'message' => 'Caricamento listino visure non riuscito.',
    ], 500);
}
