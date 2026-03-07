<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

function admin_api_ensure_client_area_tickets_table(): void
{
    $db = admin_api_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_tickets (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) DEFAULT '',\n          ticket_area VARCHAR(80) NOT NULL DEFAULT 'generale',\n          subject VARCHAR(191) NOT NULL,\n          message TEXT NOT NULL,\n          priority VARCHAR(20) NOT NULL DEFAULT 'normale',\n          status VARCHAR(40) NOT NULL DEFAULT 'aperto',\n          attachments_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_client_area_tickets_email (email),\n          KEY idx_client_area_tickets_status (status),\n          KEY idx_client_area_tickets_area (ticket_area)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function admin_api_ensure_client_area_ticket_messages_table(): void
{
    $db = admin_api_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_ticket_messages (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          ticket_id INT NOT NULL,\n          author_role VARCHAR(20) NOT NULL DEFAULT 'customer',\n          author_name VARCHAR(191) NOT NULL DEFAULT '',\n          message TEXT NOT NULL,\n          attachments_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          KEY idx_client_area_ticket_messages_ticket (ticket_id),\n          KEY idx_client_area_ticket_messages_role (author_role)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

function admin_api_ticket_messages_map(mysqli $db, array $ticketIds): array
{
    $ids = array_values(array_filter(array_map('intval', $ticketIds), static fn (int $id): bool => $id > 0));
    if ($ids === []) {
        return [];
    }

    $inClause = implode(',', $ids);
    $result = $db->query(
        "SELECT id, ticket_id, author_role, author_name, message, attachments_json, created_at
         FROM client_area_ticket_messages
         WHERE ticket_id IN ({$inClause})
         ORDER BY created_at ASC, id ASC"
    );
    if (!$result) {
        return [];
    }

    $map = [];
    while ($row = $result->fetch_assoc()) {
        $ticketId = (int) ($row['ticket_id'] ?? 0);
        if ($ticketId <= 0) {
            continue;
        }
        if (!isset($map[$ticketId])) {
            $map[$ticketId] = [];
        }
        $attachments = admin_api_decode_json_value($row['attachments_json'] ?? null);
        $map[$ticketId][] = [
            'id' => (int) ($row['id'] ?? 0),
            'ticketId' => $ticketId,
            'authorRole' => (string) ($row['author_role'] ?? 'customer'),
            'authorName' => (string) ($row['author_name'] ?? ''),
            'message' => (string) ($row['message'] ?? ''),
            'attachments' => array_values(array_filter(is_array($attachments) ? $attachments : [], static fn ($value) => is_string($value) && $value !== '')),
            'createdAt' => $row['created_at'] ?? null,
        ];
    }

    return $map;
}

function admin_api_ticket_upload_urls(string $ticketHint): array
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

    $baseUrl = rtrim(admin_api_site_base_url(), '/');
    $urls = [];
    foreach ($names as $index => $originalName) {
        $errorCode = (int) ($errors[$index] ?? UPLOAD_ERR_NO_FILE);
        if ($errorCode === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($errorCode !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Upload allegato risposta non riuscito.');
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

        $storedName = $ticketHint . '-admin-' . time() . '-' . ($index + 1) . '-' . substr($baseName, 0, 48) . $extension;
        $absolutePath = $uploadDir . DIRECTORY_SEPARATOR . $storedName;
        if (!move_uploaded_file($tmpPath, $absolutePath)) {
            throw new RuntimeException('Impossibile salvare allegato risposta.');
        }

        $urls[] = $baseUrl . '/uploads/ticket-pratiche/' . rawurlencode($storedName);
    }

    return $urls;
}

admin_api_require_session();
admin_api_ensure_client_area_tickets_table();
admin_api_ensure_client_area_ticket_messages_table();
$db = admin_api_require_db();

try {
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));

    if (str_contains($contentType, 'application/json')) {
        $body = admin_api_parse_json_body();
        $action = strtolower(trim((string) ($body['action'] ?? 'list')));

        if ($action === 'status') {
            $ticketId = (int) ($body['ticketId'] ?? 0);
            $status = strtolower(trim((string) ($body['status'] ?? '')));
            if ($ticketId <= 0 || !in_array($status, ['aperto', 'in_lavorazione', 'in_attesa_cliente', 'chiuso'], true)) {
                admin_api_json(['message' => 'Dati stato ticket non validi.'], 400);
            }

            $stmt = $db->prepare('UPDATE client_area_tickets SET status = ? WHERE id = ?');
            if (!$stmt) {
                admin_api_json(['message' => 'Impossibile aggiornare stato ticket.'], 500);
            }
            $stmt->bind_param('si', $status, $ticketId);
            $stmt->execute();
            $stmt->close();

            admin_api_json(['message' => 'Stato ticket aggiornato.'], 200);
        }

        if ($action === 'create') {
            $customerName = trim((string) ($body['customerName'] ?? ''));
            $email = strtolower(trim((string) ($body['email'] ?? '')));
            $phone = trim((string) ($body['phone'] ?? ''));
            $ticketArea = trim((string) ($body['ticketArea'] ?? 'generale'));
            $subject = trim((string) ($body['subject'] ?? ''));
            $message = trim((string) ($body['message'] ?? ''));
            $priority = trim((string) ($body['priority'] ?? 'normale'));
            $requestId = (int) ($body['requestId'] ?? 0);
            $requestIdValue = $requestId > 0 ? $requestId : null;

            if ($customerName === '' || $email === '' || !str_contains($email, '@') || $subject === '' || $message === '') {
                admin_api_json(['message' => 'Compila nome, email, oggetto e messaggio del ticket.'], 400);
            }

            $attachmentsJson = json_encode([], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $insert = $db->prepare(
                "INSERT INTO client_area_tickets
                   (request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aperto', ?)"
            );
            if (!$insert) {
                admin_api_json(['message' => 'Impossibile aprire il ticket.'], 500);
            }
            $priorityValue = $priority !== '' ? $priority : 'normale';
            $insert->bind_param(
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
            $insert->execute();
            $ticketId = (int) $insert->insert_id;
            $insert->close();

            if ($ticketId > 0) {
                $messageStmt = $db->prepare(
                    "INSERT INTO client_area_ticket_messages
                       (ticket_id, author_role, author_name, message, attachments_json)
                     VALUES (?, 'admin', 'Backoffice', ?, ?)"
                );
                if ($messageStmt) {
                    $messageStmt->bind_param('iss', $ticketId, $message, $attachmentsJson);
                    $messageStmt->execute();
                    $messageStmt->close();
                }
            }

            admin_api_json([
                'message' => 'Ticket aperto dal backoffice per conto cliente.',
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
                    'attachments' => [],
                    'messages' => [
                        [
                            'id' => 0,
                            'ticketId' => $ticketId,
                            'authorRole' => 'admin',
                            'authorName' => 'Backoffice',
                            'message' => $message,
                            'attachments' => [],
                            'createdAt' => gmdate('c'),
                        ],
                    ],
                    'createdAt' => gmdate('c'),
                    'updatedAt' => gmdate('c'),
                ],
            ], 200);
        }

        if ($action !== 'list') {
            admin_api_json(['message' => 'Azione non valida.'], 400);
        }

        $area = trim((string) ($body['area'] ?? ''));
        $status = trim((string) ($body['status'] ?? ''));
        $search = strtolower(trim((string) ($body['search'] ?? '')));

        $clauses = [];
        $params = [];
        $types = '';
        if ($area !== '' && $area !== 'all') {
            $clauses[] = 'ticket_area = ?';
            $params[] = $area;
            $types .= 's';
        }
        if ($status !== '' && $status !== 'all') {
            $clauses[] = 'status = ?';
            $params[] = $status;
            $types .= 's';
        }
        if ($search !== '') {
            $clauses[] = '(customer_name LIKE ? OR email LIKE ? OR subject LIKE ?)';
            $searchValue = '%' . $search . '%';
            $params[] = $searchValue;
            $params[] = $searchValue;
            $params[] = $searchValue;
            $types .= 'sss';
        }

        $where = $clauses !== [] ? ('WHERE ' . implode(' AND ', $clauses)) : '';
        $sql = "SELECT id, request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json, created_at, updated_at
                FROM client_area_tickets
                {$where}
                ORDER BY created_at DESC
                LIMIT 120";
        $stmt = $db->prepare($sql);
        if (!$stmt) {
            admin_api_json(['message' => 'Impossibile caricare ticket.'], 500);
        }
        if ($types !== '') {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $rows = [];
        while ($row = $result ? $result->fetch_assoc() : null) {
            if (!$row) {
                break;
            }
            $rows[] = $row;
        }
        $stmt->close();

        $ticketIds = array_map(static fn (array $row): int => (int) ($row['id'] ?? 0), $rows);
        $messagesMap = admin_api_ticket_messages_map($db, $ticketIds);
        $tickets = [];

        foreach ($rows as $row) {
            $ticketId = (int) ($row['id'] ?? 0);
            $attachments = admin_api_decode_json_value($row['attachments_json'] ?? null);
            $attachments = array_values(array_filter(is_array($attachments) ? $attachments : [], static fn ($value) => is_string($value) && $value !== ''));
            $messages = $messagesMap[$ticketId] ?? [];
            $hasCustomerMessage = false;
            foreach ($messages as $entry) {
                if (($entry['authorRole'] ?? '') === 'customer') {
                    $hasCustomerMessage = true;
                    break;
                }
            }
            if (!$hasCustomerMessage) {
                array_unshift($messages, [
                    'id' => 0,
                    'ticketId' => $ticketId,
                    'authorRole' => 'customer',
                    'authorName' => (string) ($row['customer_name'] ?? ''),
                    'message' => (string) ($row['message'] ?? ''),
                    'attachments' => $attachments,
                    'createdAt' => $row['created_at'] ?? null,
                ]);
            }

            $tickets[] = [
                'id' => $ticketId,
                'requestId' => (int) ($row['request_id'] ?? 0) ?: null,
                'customerName' => (string) ($row['customer_name'] ?? ''),
                'email' => (string) ($row['email'] ?? ''),
                'phone' => (string) ($row['phone'] ?? ''),
                'ticketArea' => (string) ($row['ticket_area'] ?? 'generale'),
                'subject' => (string) ($row['subject'] ?? ''),
                'message' => (string) ($row['message'] ?? ''),
                'priority' => (string) ($row['priority'] ?? 'normale'),
                'status' => (string) ($row['status'] ?? 'aperto'),
                'attachments' => $attachments,
                'messages' => $messages,
                'createdAt' => $row['created_at'] ?? null,
                'updatedAt' => $row['updated_at'] ?? null,
            ];
        }

        admin_api_json(['tickets' => $tickets], 200);
    }

    $formAction = strtolower(trim((string) ($_POST['action'] ?? 'reply')));

    if ($formAction === 'create') {
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
            admin_api_json(['message' => 'Compila nome, email, oggetto e messaggio del ticket.'], 400);
        }

        $attachmentUrls = admin_api_ticket_upload_urls((string) time());
        $attachmentsJson = json_encode($attachmentUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $insert = $db->prepare(
            "INSERT INTO client_area_tickets
               (request_id, customer_name, email, phone, ticket_area, subject, message, priority, status, attachments_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aperto', ?)"
        );
        if (!$insert) {
            admin_api_json(['message' => 'Impossibile aprire il ticket.'], 500);
        }
        $priorityValue = $priority !== '' ? $priority : 'normale';
        $insert->bind_param(
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
        $insert->execute();
        $ticketId = (int) $insert->insert_id;
        $insert->close();

        if ($ticketId > 0) {
            $messageStmt = $db->prepare(
                "INSERT INTO client_area_ticket_messages
                   (ticket_id, author_role, author_name, message, attachments_json)
                 VALUES (?, 'admin', 'Backoffice', ?, ?)"
            );
            if ($messageStmt) {
                $messageStmt->bind_param('iss', $ticketId, $message, $attachmentsJson);
                $messageStmt->execute();
                $messageStmt->close();
            }
        }

        admin_api_json([
            'message' => 'Ticket aperto dal backoffice per conto cliente.',
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
                'messages' => [
                    [
                        'id' => 0,
                        'ticketId' => $ticketId,
                        'authorRole' => 'admin',
                        'authorName' => 'Backoffice',
                        'message' => $message,
                        'attachments' => $attachmentUrls,
                        'createdAt' => gmdate('c'),
                    ],
                ],
                'createdAt' => gmdate('c'),
                'updatedAt' => gmdate('c'),
            ],
        ], 200);
    }

    $ticketId = (int) ($_POST['ticketId'] ?? 0);
    $message = trim((string) ($_POST['message'] ?? ''));
    $adminName = trim((string) ($_POST['adminName'] ?? 'Backoffice'));
    $status = strtolower(trim((string) ($_POST['status'] ?? 'in_lavorazione')));
    if (!in_array($status, ['aperto', 'in_lavorazione', 'in_attesa_cliente', 'chiuso'], true)) {
        $status = 'in_lavorazione';
    }

    if ($ticketId <= 0 || $message === '') {
        admin_api_json(['message' => 'Inserisci ticket e risposta operatore.'], 400);
    }

    $check = $db->prepare('SELECT id FROM client_area_tickets WHERE id = ? LIMIT 1');
    if (!$check) {
        admin_api_json(['message' => 'Impossibile verificare il ticket.'], 500);
    }
    $check->bind_param('i', $ticketId);
    $check->execute();
    $existing = $check->get_result();
    $found = $existing ? $existing->fetch_assoc() : null;
    $check->close();
    if (!$found) {
        admin_api_json(['message' => 'Ticket non trovato.'], 404);
    }

    $attachmentUrls = admin_api_ticket_upload_urls((string) $ticketId);
    $attachmentsJson = json_encode($attachmentUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $replyStmt = $db->prepare(
        "INSERT INTO client_area_ticket_messages
           (ticket_id, author_role, author_name, message, attachments_json)
         VALUES (?, 'admin', ?, ?, ?)"
    );
    if (!$replyStmt) {
        admin_api_json(['message' => 'Impossibile salvare la risposta.'], 500);
    }
    $replyStmt->bind_param('isss', $ticketId, $adminName, $message, $attachmentsJson);
    $replyStmt->execute();
    $replyId = (int) $replyStmt->insert_id;
    $replyStmt->close();

    $statusStmt = $db->prepare('UPDATE client_area_tickets SET status = ? WHERE id = ?');
    if ($statusStmt) {
        $statusStmt->bind_param('si', $status, $ticketId);
        $statusStmt->execute();
        $statusStmt->close();
    }

    admin_api_json([
        'message' => 'Risposta operatore inviata.',
        'reply' => [
            'id' => $replyId,
            'ticketId' => $ticketId,
            'authorRole' => 'admin',
            'authorName' => $adminName !== '' ? $adminName : 'Backoffice',
            'message' => $message,
            'attachments' => $attachmentUrls,
            'createdAt' => gmdate('c'),
            'status' => $status,
        ],
    ], 200);
} catch (Throwable $error) {
    admin_api_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Errore gestione ticket admin.',
    ], 500);
}
