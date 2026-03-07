<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function client_area_ensure_client_area_tickets_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_tickets (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) DEFAULT '',\n          ticket_area VARCHAR(80) NOT NULL DEFAULT 'generale',\n          subject VARCHAR(191) NOT NULL,\n          message TEXT NOT NULL,\n          priority VARCHAR(20) NOT NULL DEFAULT 'normale',\n          status VARCHAR(40) NOT NULL DEFAULT 'aperto',\n          attachments_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_client_area_tickets_email (email),\n          KEY idx_client_area_tickets_status (status),\n          KEY idx_client_area_tickets_area (ticket_area)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function client_area_ticket_upload_urls(string $ticketHint): array
{
    if (!isset($_FILES['files'])) {
        return [];
    }

    $bag = $_FILES['files'];
    $names = $bag['name'] ?? [];
    $tmpNames = $bag['tmp_name'] ?? [];
    $errors = $bag['error'] ?? [];

    if (!is_array($names)) {
        $names = [$names];
        $tmpNames = [is_array($tmpNames) ? '' : $tmpNames];
        $errors = [is_array($errors) ? UPLOAD_ERR_NO_FILE : $errors];
    }

    $documentRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot === false || $documentRoot === '') {
        $fallback = realpath(__DIR__ . '/../../../');
        $documentRoot = $fallback !== false ? $fallback : dirname(__DIR__, 3);
    }

    $uploadDir = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'ticket-pratiche';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        throw new RuntimeException('Impossibile creare la cartella upload ticket.');
    }

    $baseUrl = rtrim(client_area_site_origin(), '/');
    $urls = [];

    foreach ($names as $index => $originalName) {
        $errorCode = (int) ($errors[$index] ?? UPLOAD_ERR_NO_FILE);
        if ($errorCode === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($errorCode !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Caricamento allegato non riuscito.');
        }

        $tmpPath = (string) ($tmpNames[$index] ?? '');
        if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
            continue;
        }

        $originalName = (string) $originalName;
        $extension = preg_replace('/[^a-zA-Z0-9.]/', '', (string) pathinfo($originalName, PATHINFO_EXTENSION));
        $extension = $extension !== '' ? '.' . substr($extension, 0, 10) : '';
        $baseName = preg_replace('/[^a-zA-Z0-9_-]+/', '-', (string) pathinfo($originalName, PATHINFO_FILENAME));
        $baseName = trim((string) $baseName, '-');
        if ($baseName === '') {
            $baseName = 'allegato';
        }

        $storedName = $ticketHint . '-' . time() . '-' . ($index + 1) . '-' . substr($baseName, 0, 48) . $extension;
        $absolutePath = $uploadDir . DIRECTORY_SEPARATOR . $storedName;

        if (!move_uploaded_file($tmpPath, $absolutePath)) {
            throw new RuntimeException('Impossibile salvare allegato.');
        }

        $urls[] = $baseUrl . '/uploads/ticket-pratiche/' . rawurlencode($storedName);
    }

    return $urls;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

try {
    client_area_ensure_client_area_tickets_table();
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    $db = client_area_require_db();

    if (str_contains($contentType, 'application/json')) {
        $body = client_area_parse_json_body();
        $action = strtolower(trim((string) ($body['action'] ?? 'list')));
        if ($action !== 'list') {
            client_area_json(['message' => 'Azione non valida.'], 400);
        }

        $email = strtolower(trim((string) ($body['email'] ?? '')));
        if ($email === '' || !str_contains($email, '@')) {
            client_area_json(['message' => 'Inserisci una email valida.'], 400);
        }

        $stmt = $db->prepare(
            "SELECT id, request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json, created_at, updated_at
             FROM client_area_tickets
             WHERE email = ?
             ORDER BY created_at DESC
             LIMIT 30"
        );
        if (!$stmt) {
            throw new RuntimeException('Impossibile caricare lo storico ticket.');
        }

        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $tickets = [];
        while ($row = $result ? $result->fetch_assoc() : null) {
            if (!$row) {
                break;
            }
            $attachments = client_area_decode_json_value($row['attachments_json'] ?? null);
            $tickets[] = [
                'id' => (int) ($row['id'] ?? 0),
                'requestId' => (int) ($row['request_id'] ?? 0) ?: null,
                'customerName' => (string) ($row['customer_name'] ?? ''),
                'email' => (string) ($row['email'] ?? ''),
                'phone' => (string) ($row['phone'] ?? ''),
                'ticketArea' => (string) ($row['ticket_area'] ?? 'generale'),
                'subject' => (string) ($row['subject'] ?? ''),
                'message' => (string) ($row['message'] ?? ''),
                'priority' => (string) ($row['priority'] ?? 'normale'),
                'status' => (string) ($row['status'] ?? 'aperto'),
                'attachments' => array_values(array_filter(is_array($attachments) ? $attachments : [], static fn($value) => is_string($value) && $value !== '')),
                'createdAt' => $row['created_at'] ?? null,
                'updatedAt' => $row['updated_at'] ?? null,
            ];
        }
        $stmt->close();

        client_area_json(['tickets' => $tickets], 200);
    }

    $customerName = trim((string) ($_POST['customerName'] ?? ''));
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    $ticketArea = trim((string) ($_POST['ticketArea'] ?? 'generale'));
    $subject = trim((string) ($_POST['subject'] ?? ''));
    $message = trim((string) ($_POST['message'] ?? ''));
    $priority = trim((string) ($_POST['priority'] ?? 'normale'));
    $requestId = (int) ($_POST['requestId'] ?? 0);
    $requestIdValue = $requestId > 0 ? $requestId : null;

    if ($customerName === '' || $email === '' || !str_contains($email, '@') || $subject === '' || $message === '') {
        client_area_json(['message' => 'Compila nome, email, oggetto e messaggio del ticket.'], 400);
    }

    $attachmentUrls = client_area_ticket_upload_urls((string) time());
    $attachmentsJson = json_encode($attachmentUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $stmt = $db->prepare(
        "INSERT INTO client_area_tickets
           (request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aperto', ?)"
    );
    if (!$stmt) {
        throw new RuntimeException('Impossibile aprire il ticket.');
    }

    $priorityValue = $priority !== '' ? $priority : 'normale';
    $stmt->bind_param(
        'issssssss',
        $requestIdValue,
        $customerName,
        $email,
        $phone,
        $ticketArea,
        $subject,
        $message,
        $priorityValue,
        $attachmentsJson
    );
    $stmt->execute();
    $ticketId = (int) $stmt->insert_id;
    $stmt->close();

    client_area_notify_event(
        'ticket-pratiche',
        'Nuovo ticket pratiche/documenti',
        $customerName,
        $email,
        $phone,
        [
            'ticketId' => $ticketId > 0 ? '#' . $ticketId : 'n/d',
            'area' => $ticketArea,
            'priorita' => $priorityValue,
            'richiestaCollegata' => $requestIdValue ? '#' . $requestIdValue : 'nessuna',
        ]
    );

    client_area_json([
        'message' => 'Ticket aperto correttamente. Il backoffice ha ricevuto la richiesta e ti aggiornera nello storico.',
        'ticket' => [
            'id' => $ticketId,
            'requestId' => $requestIdValue,
            'customerName' => $customerName,
            'email' => $email,
            'phone' => $phone,
            'ticketArea' => $ticketArea,
            'subject' => $subject,
            'message' => $message,
            'priority' => $priorityValue,
            'status' => 'aperto',
            'attachments' => $attachmentUrls,
            'createdAt' => gmdate('c'),
        ],
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile gestire il modulo ticket.',
    ], 500);
}
