<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_shipping_pricing_table();

$body = admin_api_parse_json_body();
$id = (int) ($body['id'] ?? 0);

if ($id <= 0) {
    admin_api_json(['message' => 'ID regola non valido'], 400);
}

$db = admin_api_require_db();
$stmt = $db->prepare("DELETE FROM shipping_pricing_rules WHERE id = ?");
if (!$stmt) {
    admin_api_json(['message' => 'Errore rimozione regola'], 500);
}
$stmt->bind_param('i', $id);
$stmt->execute();
$stmt->close();

admin_api_json(['ok' => true, 'message' => 'Regola rimossa']);
