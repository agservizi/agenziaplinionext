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

$db->query("\n    CREATE TABLE IF NOT EXISTS caf_patronato_pricing_rules (\n      id INT AUTO_INCREMENT PRIMARY KEY,\n      service_type VARCHAR(120) NOT NULL,\n      label VARCHAR(191) NOT NULL,\n      price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,\n      sort_order INT NOT NULL DEFAULT 0,\n      active TINYINT(1) NOT NULL DEFAULT 1,\n      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n      KEY idx_caf_patronato_pricing_service (service_type),\n      KEY idx_caf_patronato_pricing_active (active)\n    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n");

$result = $db->query(
    "SELECT id, service_type, label, price_eur, sort_order, active
     FROM caf_patronato_pricing_rules
     WHERE active = 1
     ORDER BY service_type ASC, sort_order ASC, id ASC"
);

if (!$result) {
    client_area_json(['rules' => []], 200);
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
