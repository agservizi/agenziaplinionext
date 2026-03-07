<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_email_notifications_table();

$db = admin_api_require_db();

$areaFilter = trim((string) ($_GET['area'] ?? 'all'));
$statusFilter = trim((string) ($_GET['status'] ?? 'all'));

$query = "SELECT
    id,
    area,
    title,
    customer_name,
    customer_email,
    customer_phone,
    details_json,
    send_status,
    send_reason,
    response_status,
    error_message,
    provider_message_id,
    created_at
  FROM client_area_email_notifications";

$conditions = [];
$params = [];
$types = '';

if ($areaFilter !== '' && $areaFilter !== 'all') {
    $conditions[] = 'area = ?';
    $params[] = $areaFilter;
    $types .= 's';
}

if ($statusFilter !== '' && $statusFilter !== 'all') {
    $conditions[] = 'send_status = ?';
    $params[] = $statusFilter;
    $types .= 's';
}

if ($conditions !== []) {
    $query .= ' WHERE ' . implode(' AND ', $conditions);
}

$query .= ' ORDER BY created_at DESC LIMIT 250';

$stmt = $db->prepare($query);
if (!$stmt) {
    admin_api_json(['message' => 'Errore caricamento notifiche email'], 500);
}

if ($types !== '' && $params !== []) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result ? $result->fetch_assoc() : null) {
    if (!$row) {
        break;
    }

    $notifications[] = [
        'id' => (int) ($row['id'] ?? 0),
        'area' => (string) ($row['area'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'customerEmail' => (string) ($row['customer_email'] ?? ''),
        'customerPhone' => (string) ($row['customer_phone'] ?? ''),
        'details' => admin_api_decode_json_value($row['details_json'] ?? null),
        'sendStatus' => (string) ($row['send_status'] ?? ''),
        'sendReason' => (string) ($row['send_reason'] ?? ''),
        'responseStatus' => (int) ($row['response_status'] ?? 0),
        'errorMessage' => (string) ($row['error_message'] ?? ''),
        'providerMessageId' => (string) ($row['provider_message_id'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
    ];
}

$stmt->close();

admin_api_json([
    'ok' => true,
    'notifications' => $notifications,
]);
