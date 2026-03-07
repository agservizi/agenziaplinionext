<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function client_area_visure_magic_request_by_token(string $token): array
{
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_visure_requests_table();
    client_area_ensure_client_area_visure_magic_links_table();

    $db = client_area_require_db();
    $tokenHash = client_area_hash_visure_magic_token($token);
    $stmt = $db->prepare(
        "SELECT
            ml.id AS magic_link_id,
            ml.request_id,
            ml.expires_at,
            ml.consumed_at,
            r.customer_name,
            r.email,
            r.phone,
            r.service_type,
            r.notes,
            r.created_at,
            r.status,
            r.details_json,
            v.provider_service,
            v.provider_status,
            v.document_url,
            p.amount_cents,
            p.currency,
            p.price_label
         FROM client_area_visure_magic_links ml
         INNER JOIN client_area_requests r ON r.id = ml.request_id
         LEFT JOIN client_area_visure_requests v ON v.request_id = r.id
         LEFT JOIN client_area_payments p ON p.request_id = r.id
         WHERE ml.token_hash = ?
           AND r.area = 'visure'
         ORDER BY ml.id DESC
         LIMIT 1"
    );

    if (!$stmt) {
        throw new RuntimeException('Impossibile validare il magic link.');
    }

    $stmt->bind_param('s', $tokenHash);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$row) {
        throw new RuntimeException('Magic link non valido.');
    }

    if (!empty($row['consumed_at'])) {
        throw new RuntimeException('Questo magic link e gia stato usato.');
    }

    $expiresAt = strtotime((string) ($row['expires_at'] ?? ''));
    if (!$expiresAt || $expiresAt < time()) {
        throw new RuntimeException('Questo magic link e scaduto.');
    }

    return $row;
}

function client_area_visure_magic_status_map(string $status): array
{
    $normalized = strtolower(trim($status));
    if ($normalized === 'completed') {
        return [
            'requestStatus' => 'completed',
            'providerStatus' => 'completed',
            'label' => 'Evasa',
        ];
    }

    if ($normalized === 'waiting-documents') {
        return [
            'requestStatus' => 'processing',
            'providerStatus' => 'waiting-documents',
            'label' => 'In attesa documenti',
        ];
    }

    return [
        'requestStatus' => 'processing',
        'providerStatus' => 'processing',
        'label' => 'In lavorazione',
    ];
}

function client_area_visure_magic_upload_urls(int $requestId): array
{
    if (!isset($_FILES['files'])) {
        return [];
    }

    $fileBag = $_FILES['files'];
    $names = $fileBag['name'] ?? [];
    $tmpNames = $fileBag['tmp_name'] ?? [];
    $errors = $fileBag['error'] ?? [];

    if (!is_array($names)) {
        $names = [$names];
        $tmpNames = [is_array($tmpNames) ? '' : $tmpNames];
        $errors = [is_array($errors) ? UPLOAD_ERR_NO_FILE : $errors];
    }

    $documentRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot === false || $documentRoot === '') {
        $fallback = realpath(__DIR__ . '/../../../../');
        $documentRoot = $fallback !== false ? $fallback : dirname(__DIR__, 4);
    }

    $uploadDir = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'visure';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        throw new RuntimeException('Impossibile creare la cartella upload visure.');
    }

    $storedUrls = [];
    $baseUrl = rtrim(client_area_site_origin(), '/');

    foreach ($names as $index => $originalName) {
        $errorCode = (int) ($errors[$index] ?? UPLOAD_ERR_NO_FILE);
        if ($errorCode === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        if ($errorCode !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Caricamento file non riuscito.');
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
            $baseName = 'documento';
        }

        $storedName = $requestId . '-' . time() . '-' . ($index + 1) . '-' . substr($baseName, 0, 48) . $extension;
        $absolutePath = $uploadDir . DIRECTORY_SEPARATOR . $storedName;

        if (!move_uploaded_file($tmpPath, $absolutePath)) {
            throw new RuntimeException('Non riesco a salvare il file caricato.');
        }

        $storedUrls[] = $baseUrl . '/uploads/visure/' . rawurlencode($storedName);
    }

    return $storedUrls;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

try {
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));

    if (str_contains($contentType, 'application/json')) {
        $body = client_area_parse_json_body();
        $token = trim((string) ($body['token'] ?? ''));
        if ($token === '') {
            client_area_json(['message' => 'Token pratica mancante.'], 400);
        }

        $row = client_area_visure_magic_request_by_token($token);
        $amountCents = (int) ($row['amount_cents'] ?? 0);
        $currency = strtoupper((string) ($row['currency'] ?? 'eur'));
        $amountLabel = $amountCents > 0
            ? number_format($amountCents / 100, 2, ',', '') . ' ' . $currency
            : '';

        client_area_json([
            'request' => [
                'requestId' => (int) ($row['request_id'] ?? 0),
                'customerName' => (string) ($row['customer_name'] ?? ''),
                'email' => (string) ($row['email'] ?? ''),
                'phone' => (string) ($row['phone'] ?? ''),
                'serviceLabel' => (string) (($row['provider_service'] ?? '') !== '' ? $row['provider_service'] : ($row['service_type'] ?? '')),
                'status' => (string) (($row['provider_status'] ?? '') !== '' ? $row['provider_status'] : ($row['status'] ?? 'processing')),
                'notes' => (string) ($row['notes'] ?? ''),
                'createdAt' => $row['created_at'] ?? null,
                'amountLabel' => $amountLabel,
                'priceLabel' => (string) ($row['price_label'] ?? ''),
                'existingDocumentUrl' => (string) ($row['document_url'] ?? ''),
            ],
        ], 200);
    }

    $token = trim((string) ($_POST['token'] ?? ''));
    $status = trim((string) ($_POST['status'] ?? 'completed'));
    $operatorNotes = trim((string) ($_POST['operatorNotes'] ?? ''));

    if ($token === '') {
        client_area_json(['message' => 'Token pratica mancante.'], 400);
    }

    $row = client_area_visure_magic_request_by_token($token);
    $statusInfo = client_area_visure_magic_status_map($status);
    $requestId = (int) ($row['request_id'] ?? 0);
    $storedUrls = client_area_visure_magic_upload_urls($requestId);
    $existingDocumentUrl = (string) ($row['document_url'] ?? '');
    $primaryDocumentUrl = $storedUrls[0] ?? ($existingDocumentUrl !== '' ? $existingDocumentUrl : '');

    if ($statusInfo['providerStatus'] === 'completed' && $primaryDocumentUrl === '') {
        client_area_json(['message' => 'Per chiudere la pratica devi allegare almeno un documento.'], 400);
    }

    $details = client_area_decode_json_value($row['details_json'] ?? null);
    $summary = [
        'presaInCarico' => 'manuale backoffice',
        'statoLavorazione' => $statusInfo['label'],
        'disponibilitaDocumento' => $primaryDocumentUrl !== '' ? 'disponibile nello storico' : 'in caricamento',
        'ultimoAggiornamento' => gmdate('c'),
    ];

    $details['providerStatus'] = $statusInfo['providerStatus'];
    $details['providerSummary'] = $summary;
    $details['manualFulfillment'] = true;
    $details['operatorNotes'] = $operatorNotes;
    $details['operatorUpdatedAt'] = gmdate('c');

    $providerPayload = [
        'mode' => 'manual_fulfillment',
        'operatorNotes' => $operatorNotes,
        'storedDocuments' => $storedUrls,
        'primaryDocumentUrl' => $primaryDocumentUrl,
        'completedAt' => $statusInfo['providerStatus'] === 'completed' ? gmdate('c') : null,
    ];

    $db = client_area_require_db();

    $requestStmt = $db->prepare(
        "UPDATE client_area_requests
         SET status = ?, details_json = ?
         WHERE id = ? AND area = 'visure'"
    );
    if (!$requestStmt) {
        throw new RuntimeException('Impossibile aggiornare la pratica visura.');
    }

    $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $requestStatus = (string) $statusInfo['requestStatus'];
    $requestStmt->bind_param('ssi', $requestStatus, $detailsJson, $requestId);
    $requestStmt->execute();
    $requestStmt->close();

    $visuraStmt = $db->prepare(
        "UPDATE client_area_visure_requests
         SET provider = 'AG SERVIZI Backoffice',
             provider_status = ?,
             document_url = ?,
             provider_response_json = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE request_id = ?"
    );
    if (!$visuraStmt) {
        throw new RuntimeException('Impossibile aggiornare il documento visura.');
    }

    $providerStatus = (string) $statusInfo['providerStatus'];
    $documentUrlValue = $primaryDocumentUrl !== '' ? $primaryDocumentUrl : null;
    $providerResponseJson = json_encode($providerPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $visuraStmt->bind_param('sssi', $providerStatus, $documentUrlValue, $providerResponseJson, $requestId);
    $visuraStmt->execute();
    $visuraStmt->close();

    if ($statusInfo['providerStatus'] === 'completed') {
        $consumeStmt = $db->prepare(
            'UPDATE client_area_visure_magic_links SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        if ($consumeStmt) {
            $magicLinkId = (int) ($row['magic_link_id'] ?? 0);
            $consumeStmt->bind_param('i', $magicLinkId);
            $consumeStmt->execute();
            $consumeStmt->close();
        }
    }

    client_area_json([
        'message' => $statusInfo['providerStatus'] === 'completed'
            ? 'Pratica evasa correttamente: il documento e ora disponibile nello storico visure del cliente.'
            : 'Pratica aggiornata correttamente.',
        'documentUrl' => $primaryDocumentUrl,
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile gestire la pratica dal magic link.',
    ], 400);
}
