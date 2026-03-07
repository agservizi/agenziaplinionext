<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_visure_pricing_table();

$body = admin_api_parse_json_body();
$id = (int) ($body['id'] ?? 0);
$serviceType = trim((string) ($body['serviceType'] ?? ''));
$label = trim((string) ($body['label'] ?? ''));
$priceEUR = (float) ($body['priceEUR'] ?? 0);
$sortOrder = (int) ($body['sortOrder'] ?? 0);
$active = !empty($body['active']) ? 1 : 0;
$allowed = ['visura-camerale', 'visura-catastale', 'visura-pra', 'visura-crif', 'visura-cr'];

if (!in_array($serviceType, $allowed, true)) {
    admin_api_json(['message' => 'Tipologia visura non valida'], 400);
}

if ($label === '') {
    admin_api_json(['message' => 'Etichetta regola obbligatoria'], 400);
}

$db = admin_api_require_db();
if ($id > 0) {
    $stmt = $db->prepare(
        "UPDATE visure_pricing_rules
         SET service_type = ?, label = ?, price_eur = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola visura'], 500);
    }
    $stmt->bind_param('ssdiii', $serviceType, $label, $priceEUR, $sortOrder, $active, $id);
    $stmt->execute();
    $stmt->close();
} else {
    $stmt = $db->prepare(
        "INSERT INTO visure_pricing_rules
            (service_type, label, price_eur, sort_order, active)
         VALUES (?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        admin_api_json(['message' => 'Errore salvataggio regola visura'], 500);
    }
    $stmt->bind_param('ssdii', $serviceType, $label, $priceEUR, $sortOrder, $active);
    $stmt->execute();
    $stmt->close();
}

admin_api_json(['ok' => true, 'message' => 'Regola prezzo visura salvata']);
