<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_client_area_visure_requests_table();

function admin_api_visure_status_map(string $status): array
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

function admin_api_visure_upload_urls(int $requestId): array
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
    admin_api_json(['message' => 'Metodo non consentito.'], 405);
}

try {
    $requestId = (int) ($_POST['requestId'] ?? 0);
    $status = trim((string) ($_POST['status'] ?? 'completed'));
    $operatorNotes = trim((string) ($_POST['operatorNotes'] ?? ''));

    if ($requestId <= 0) {
        admin_api_json(['message' => 'Richiesta visura non valida.'], 400);
    }

    $db = admin_api_require_db();
    $requestStmt = $db->prepare(
        "SELECT id, details_json, status
         FROM client_area_requests
         WHERE id = ? AND area = 'visure'
         LIMIT 1"
    );
    if (!$requestStmt) {
        throw new RuntimeException('Impossibile caricare la richiesta visura.');
    }
    $requestStmt->bind_param('i', $requestId);
    $requestStmt->execute();
    $requestResult = $requestStmt->get_result();
    $requestRow = $requestResult ? $requestResult->fetch_assoc() : null;
    $requestStmt->close();

    if (!$requestRow) {
        admin_api_json(['message' => 'Richiesta visura non trovata.'], 404);
    }

    $visuraStmt = $db->prepare(
        "SELECT provider, provider_service, provider_status, document_url
         FROM client_area_visure_requests
         WHERE request_id = ?
         ORDER BY id DESC
         LIMIT 1"
    );
    if (!$visuraStmt) {
        throw new RuntimeException('Impossibile leggere la lavorazione visura.');
    }
    $visuraStmt->bind_param('i', $requestId);
    $visuraStmt->execute();
    $visuraResult = $visuraStmt->get_result();
    $visuraRow = $visuraResult ? $visuraResult->fetch_assoc() : null;
    $visuraStmt->close();

    $statusInfo = admin_api_visure_status_map($status);
    $storedUrls = admin_api_visure_upload_urls($requestId);
    $existingDocumentUrl = (string) ($visuraRow['document_url'] ?? '');
    $primaryDocumentUrl = $storedUrls[0] ?? ($existingDocumentUrl !== '' ? $existingDocumentUrl : '');

    if ($statusInfo['providerStatus'] === 'completed' && $primaryDocumentUrl === '') {
        admin_api_json(['message' => 'Per chiudere la pratica devi allegare almeno un documento.'], 400);
    }

    $details = admin_api_decode_json_value($requestRow['details_json'] ?? null);
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

    $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $providerPayload = [
        'mode' => 'manual_fulfillment',
        'operatorNotes' => $operatorNotes,
        'storedDocuments' => $storedUrls,
        'primaryDocumentUrl' => $primaryDocumentUrl,
        'completedAt' => $statusInfo['providerStatus'] === 'completed' ? gmdate('c') : null,
    ];
    $providerResponseJson = json_encode($providerPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $updateRequestStmt = $db->prepare(
        "UPDATE client_area_requests
         SET status = ?, details_json = ?
         WHERE id = ? AND area = 'visure'"
    );
    if (!$updateRequestStmt) {
        throw new RuntimeException('Impossibile aggiornare la richiesta visura.');
    }
    $requestStatus = (string) $statusInfo['requestStatus'];
    $updateRequestStmt->bind_param('ssi', $requestStatus, $detailsJson, $requestId);
    $updateRequestStmt->execute();
    $updateRequestStmt->close();

    if ($visuraRow) {
        $updateVisuraStmt = $db->prepare(
            "UPDATE client_area_visure_requests
             SET provider = 'AG SERVIZI Backoffice',
                 provider_status = ?,
                 document_url = ?,
                 provider_response_json = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE request_id = ?"
        );
        if (!$updateVisuraStmt) {
            throw new RuntimeException('Impossibile aggiornare il documento visura.');
        }
        $providerStatus = (string) $statusInfo['providerStatus'];
        $documentUrlValue = $primaryDocumentUrl !== '' ? $primaryDocumentUrl : null;
        $updateVisuraStmt->bind_param('sssi', $providerStatus, $documentUrlValue, $providerResponseJson, $requestId);
        $updateVisuraStmt->execute();
        $updateVisuraStmt->close();
    } else {
        $insertVisuraStmt = $db->prepare(
            "INSERT INTO client_area_visure_requests
                (request_id, provider, provider_service, provider_request_id, provider_status, document_url, provider_response_json)
             VALUES (?, 'AG SERVIZI Backoffice', '', '', ?, ?, ?)"
        );
        if (!$insertVisuraStmt) {
            throw new RuntimeException('Impossibile creare la lavorazione visura.');
        }
        $providerStatus = (string) $statusInfo['providerStatus'];
        $documentUrlValue = $primaryDocumentUrl !== '' ? $primaryDocumentUrl : null;
        $insertVisuraStmt->bind_param('isss', $requestId, $providerStatus, $documentUrlValue, $providerResponseJson);
        $insertVisuraStmt->execute();
        $insertVisuraStmt->close();
    }

    admin_api_json([
        'message' => $statusInfo['providerStatus'] === 'completed'
            ? 'Visura caricata correttamente e resa disponibile al cliente.'
            : 'Pratica visura aggiornata correttamente.',
        'documentUrl' => $primaryDocumentUrl,
    ]);
} catch (Throwable $error) {
    admin_api_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile caricare la visura dal backoffice.',
    ], 400);
}
