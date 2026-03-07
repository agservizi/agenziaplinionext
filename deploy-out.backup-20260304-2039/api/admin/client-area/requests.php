<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_client_area_shipments_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT
        r.id,
        r.area,
        r.service_type,
        r.customer_name,
        r.email,
        r.phone,
        r.notes,
        r.details_json,
        r.status,
        r.created_at,
        r.updated_at,
        s.tracking_code,
        s.parcel_id,
        s.brt_response_json
     FROM client_area_requests r
     LEFT JOIN client_area_shipments s ON s.request_id = r.id
     ORDER BY r.created_at DESC
     LIMIT 100"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento richieste'], 500);
}

$requests = [];
while ($row = $result->fetch_assoc()) {
    $details = admin_api_decode_json_value($row['details_json'] ?? null);
    $brtResponse = admin_api_decode_json_value($row['brt_response_json'] ?? null);
    $manifest = is_array($brtResponse['manifest'] ?? null) ? $brtResponse['manifest'] : [];

    $requests[] = [
        'id' => (int) ($row['id'] ?? 0),
        'area' => (string) ($row['area'] ?? ''),
        'serviceType' => (string) ($row['service_type'] ?? ''),
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'email' => (string) ($row['email'] ?? ''),
        'phone' => (string) ($row['phone'] ?? ''),
        'notes' => (string) ($row['notes'] ?? ''),
        'details' => $details,
        'status' => (string) ($row['status'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
        'updatedAt' => $row['updated_at'] ?? null,
        'trackingCode' => (string) ($row['tracking_code'] ?? ''),
        'parcelId' => (string) ($row['parcel_id'] ?? ''),
        'manifestCreated' => !empty($manifest['created']),
        'manifestMessage' => (string) ($manifest['message'] ?? ''),
    ];
}

admin_api_json(['ok' => true, 'requests' => $requests]);
