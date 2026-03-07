<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_caf_requests_table();
admin_api_ensure_caf_files_table();
admin_api_ensure_client_area_payments_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT
        r.id AS request_id,
        r.customer_name,
        r.email,
        r.phone,
        r.notes,
        r.service_type,
        r.status,
        r.created_at,
        r.updated_at,
        c.service_scope,
        c.service_label,
        c.category_label,
        c.preferred_contact_method,
        c.preferred_contact_date,
        c.urgency,
        c.document_summary,
        c.intake_status,
        c.operator_email,
        c.operator_email_status,
        c.operator_email_sent_at,
        c.magic_link_expires_at,
        c.operator_notes,
        c.resolved_at,
        (
          SELECT p.amount_cents
          FROM client_area_payments p
          WHERE p.request_id = r.id
          ORDER BY p.updated_at DESC, p.id DESC
          LIMIT 1
        ) AS payment_amount_cents,
        (
          SELECT p.currency
          FROM client_area_payments p
          WHERE p.request_id = r.id
          ORDER BY p.updated_at DESC, p.id DESC
          LIMIT 1
        ) AS payment_currency,
        (
          SELECT p.price_label
          FROM client_area_payments p
          WHERE p.request_id = r.id
          ORDER BY p.updated_at DESC, p.id DESC
          LIMIT 1
        ) AS price_label,
        (
          SELECT p.payment_status
          FROM client_area_payments p
          WHERE p.request_id = r.id
          ORDER BY p.updated_at DESC, p.id DESC
          LIMIT 1
        ) AS payment_status
     FROM client_area_requests r
     INNER JOIN client_area_caf_requests c ON c.request_id = r.id
     WHERE r.area = 'caf-patronato'
     ORDER BY r.created_at DESC
     LIMIT 100"
);

if (!$result) {
    admin_api_json(['message' => 'Impossibile caricare le pratiche CAF e Patronato.'], 500);
}

$rows = [];
$requestIds = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
    $requestIds[] = (int) ($row['request_id'] ?? 0);
}

$filesMap = admin_api_get_caf_files_map($requestIds);
$requests = [];
foreach ($rows as $row) {
    $requests[] = admin_api_map_caf_request_row($row, $filesMap);
}

admin_api_json(['requests' => $requests]);
