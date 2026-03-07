<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function caf_file_token_secret(): string
{
    return trim((string) (public_api_env('CAF_PATRONATO_FILE_LINK_SECRET', public_api_env('CAF_PATRONATO_MAGIC_LINK_SECRET', 'ag-caf-file-link')) ?: 'ag-caf-file-link'));
}

function caf_file_token_ttl_hours(): int
{
    $ttl = (int) (public_api_env('CAF_PATRONATO_FILE_LINK_TTL_HOURS', '48') ?: '48');
    return $ttl > 0 ? $ttl : 48;
}

function caf_build_file_token(int $fileId): string
{
    $exp = time() + (caf_file_token_ttl_hours() * 3600);
    $payload = $fileId . ':' . $exp;
    $sig = hash_hmac('sha256', $payload, caf_file_token_secret());
    return rtrim(strtr(base64_encode($payload . ':' . $sig), '+/', '-_'), '=');
}

function caf_service_label(string $serviceType): string
{
    $label = str_replace(['caf-', 'patronato-'], '', $serviceType);
    $label = str_replace('-', ' ', $label);
    $label = trim($label);
    if ($label === '') return 'Pratica';
    return mb_convert_case($label, MB_CASE_TITLE, 'UTF-8');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato'], 503);
}

$body = client_area_parse_json_body();
$draftToken = trim((string) ($body['draftToken'] ?? ''));
$stripeSessionId = trim((string) ($body['stripeSessionId'] ?? ''));

if ($draftToken === '' || $stripeSessionId === '') {
    client_area_json(['message' => 'Pagamento o pratica non trovati. Riparti dal modulo.'], 400);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

try {
    $db = client_area_require_db();

    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_payments_table();
    client_area_ensure_client_area_invoices_table();

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_checkout_drafts (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          draft_token VARCHAR(64) NOT NULL,\n          service_type VARCHAR(120) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          amount_cents INT NOT NULL DEFAULT 0,\n          price_label VARCHAR(191) NOT NULL DEFAULT '',\n          draft_json JSON NOT NULL,\n          expires_at DATETIME NOT NULL,\n          consumed_at DATETIME NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_caf_checkout_draft_token (draft_token),\n          KEY idx_client_area_caf_checkout_expires (expires_at)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_requests (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          service_scope VARCHAR(40) NOT NULL,\n          service_label VARCHAR(191) NOT NULL,\n          category_label VARCHAR(191) NOT NULL,\n          preferred_contact_method VARCHAR(80) NOT NULL DEFAULT '',\n          preferred_contact_date DATE NULL,\n          urgency VARCHAR(191) NOT NULL DEFAULT '',\n          document_summary TEXT NULL,\n          intake_status VARCHAR(40) NOT NULL DEFAULT 'awaiting_review',\n          operator_email VARCHAR(191) NOT NULL DEFAULT '',\n          operator_email_status VARCHAR(40) NOT NULL DEFAULT 'pending',\n          operator_email_sent_at DATETIME NULL,\n          magic_link_expires_at DATETIME NULL,\n          operator_notes TEXT NULL,\n          resolved_at DATETIME NULL,\n          intake_payload_json JSON NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_caf_request (request_id),\n          KEY idx_client_area_caf_status (intake_status)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_files (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          source_role VARCHAR(32) NOT NULL,\n          original_name VARCHAR(255) NOT NULL,\n          stored_name VARCHAR(255) NOT NULL,\n          public_url TEXT NOT NULL,\n          mime_type VARCHAR(191) NOT NULL DEFAULT '',\n          size_bytes BIGINT NOT NULL DEFAULT 0,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          KEY idx_client_area_caf_files_request (request_id),\n          KEY idx_client_area_caf_files_role (source_role)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $draftStmt = $db->prepare(
        'SELECT id, service_type, customer_name, email, amount_cents, price_label, draft_json, expires_at, consumed_at
         FROM client_area_caf_checkout_drafts
         WHERE draft_token = ?
         LIMIT 1'
    );
    if (!$draftStmt) {
        throw new RuntimeException('Dati pratica non trovati.');
    }

    $draftStmt->bind_param('s', $draftToken);
    $draftStmt->execute();
    $draftResult = $draftStmt->get_result();
    $draftRow = $draftResult ? $draftResult->fetch_assoc() : null;
    $draftStmt->close();

    if (!$draftRow) {
        throw new RuntimeException('Dati pratica non trovati. Riprova dal modulo CAF/Patronato.');
    }
    if (!empty($draftRow['consumed_at'])) {
        throw new RuntimeException('Questa pratica è già stata finalizzata.');
    }
    if (empty($draftRow['expires_at']) || strtotime((string) $draftRow['expires_at']) < time()) {
        throw new RuntimeException('La sessione della pratica è scaduta. Riprova dal modulo.');
    }

    $stripeSession = client_area_get_stripe_checkout_session($stripeSessionId);
    $paymentCompleted = (($stripeSession['status'] ?? '') === 'complete') && (($stripeSession['paymentStatus'] ?? '') === 'paid');
    if (!$paymentCompleted) {
        throw new RuntimeException('Il pagamento Stripe non risulta completato.');
    }

    $expectedAmount = (int) ($draftRow['amount_cents'] ?? 0);
    if (strtolower((string) ($stripeSession['currency'] ?? 'eur')) !== 'eur' || (int) ($stripeSession['amountTotal'] ?? 0) !== $expectedAmount) {
        throw new RuntimeException('Il pagamento non corrisponde all\'importo atteso. La pratica è stata bloccata.');
    }

    $draft = [];
    try {
        $parsed = json_decode((string) ($draftRow['draft_json'] ?? '{}'), true);
        if (is_array($parsed)) {
            $draft = $parsed;
        }
    } catch (Throwable $ignored) {
        $draft = [];
    }

    $serviceType = (string) ($draft['serviceType'] ?? $draftRow['service_type'] ?? '');
    $serviceLabel = caf_service_label($serviceType);
    $scope = (string) ($draft['scope'] ?? (str_starts_with($serviceType, 'patronato-') ? 'patronato' : 'caf'));
    $categoryLabel = $scope === 'patronato' ? 'Patronato' : 'CAF';

    $details = [
        'scope' => $scope,
        'scopeLabel' => $scope === 'patronato' ? 'Patronato' : 'CAF',
        'serviceLabel' => $serviceLabel,
        'categoryLabel' => $categoryLabel,
        'urgency' => (string) ($draft['urgency'] ?? ''),
        'preferredContactMethod' => (string) ($draft['preferredContactMethod'] ?? ''),
        'preferredContactDate' => (string) ($draft['preferredContactDate'] ?? ''),
        'documentSummary' => (string) ($draft['documentSummary'] ?? ''),
        'customerUploadCount' => is_array($draft['pendingFiles'] ?? null) ? count($draft['pendingFiles']) : 0,
        'paymentRequired' => true,
    ];

    $requestStmt = $db->prepare(
        'INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES (\'caf-patronato\', ?, ?, ?, ?, ?, ?, ?)' 
    );
    if (!$requestStmt) {
        throw new RuntimeException('Impossibile registrare la pratica.');
    }

    $customerName = (string) ($draft['customerName'] ?? $draftRow['customer_name'] ?? '');
    $email = (string) ($draft['email'] ?? $draftRow['email'] ?? '');
    $phone = (string) ($draft['phone'] ?? '');
    $notes = (string) ($draft['notes'] ?? '');
    $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $status = 'new';
    $requestStmt->bind_param('sssssss', $serviceType, $customerName, $email, $phone, $notes, $detailsJson, $status);
    $requestStmt->execute();
    $requestId = (int) $requestStmt->insert_id;
    $requestStmt->close();

    if ($requestId <= 0) {
        throw new RuntimeException('Impossibile registrare la pratica.');
    }

    $cafStmt = $db->prepare(
        'INSERT INTO client_area_caf_requests
          (request_id, service_scope, service_label, category_label, preferred_contact_method, preferred_contact_date,
           urgency, document_summary, intake_status, operator_email, intake_payload_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, \"awaiting_review\", ?, ?)' 
    );

    if ($cafStmt) {
        $preferredContactMethod = (string) ($draft['preferredContactMethod'] ?? '');
        $preferredContactDate = trim((string) ($draft['preferredContactDate'] ?? ''));
        $preferredContactDateValue = $preferredContactDate !== '' ? $preferredContactDate : null;
        $urgency = (string) ($draft['urgency'] ?? '');
        $documentSummary = (string) ($draft['documentSummary'] ?? '');
        $operatorEmail = trim((string) (public_api_env('CAF_PATRONATO_OPERATOR_EMAIL', 'vincenzo@studioschettino.com') ?: 'vincenzo@studioschettino.com'));
        $intakePayloadJson = json_encode([
            'submittedAt' => (new DateTimeImmutable())->format(DATE_ATOM),
            'notes' => $notes,
            'payment' => [
                'amountCents' => $expectedAmount,
                'priceLabel' => (string) ($draftRow['price_label'] ?? ''),
                'stripeSessionId' => (string) ($stripeSession['id'] ?? ''),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $cafStmt->bind_param(
            'isssssssss',
            $requestId,
            $scope,
            $serviceLabel,
            $categoryLabel,
            $preferredContactMethod,
            $preferredContactDateValue,
            $urgency,
            $documentSummary,
            $operatorEmail,
            $intakePayloadJson
        );
        $cafStmt->execute();
        $cafStmt->close();
    }

    $pendingFiles = is_array($draft['pendingFiles'] ?? null) ? $draft['pendingFiles'] : [];
    $customerDir = __DIR__ . '/../../../../storage/caf-patronato/customer';
    if (!is_dir($customerDir)) {
        mkdir($customerDir, 0775, true);
    }

    foreach ($pendingFiles as $pendingFile) {
        if (!is_array($pendingFile)) continue;
        $storedName = (string) ($pendingFile['storedName'] ?? '');
        $absolutePath = (string) ($pendingFile['absolutePath'] ?? '');
        if ($storedName === '' || $absolutePath === '') continue;

        $destinationPath = $customerDir . '/' . $storedName;
        if (is_file($absolutePath)) {
            @rename($absolutePath, $destinationPath);
        }

        $fileStmt = $db->prepare(
            'INSERT INTO client_area_caf_files
              (request_id, source_role, original_name, stored_name, public_url, mime_type, size_bytes)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        if ($fileStmt) {
            $sourceRole = 'customer';
            $originalName = (string) ($pendingFile['originalName'] ?? 'documento');
            $mimeType = (string) ($pendingFile['mimeType'] ?? 'application/octet-stream');
            $sizeBytes = (int) ($pendingFile['sizeBytes'] ?? 0);
            $publicUrl = '';
            $fileStmt->bind_param('isssssi', $requestId, $sourceRole, $originalName, $storedName, $publicUrl, $mimeType, $sizeBytes);
            $fileStmt->execute();
            $fileStmt->close();
        }
    }

    $paymentStmt = $db->prepare(
        'INSERT INTO client_area_payments
          (request_id, stripe_session_id, amount_cents, currency, payment_status, checkout_status, price_label, stripe_response_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          request_id = VALUES(request_id),
          amount_cents = VALUES(amount_cents),
          currency = VALUES(currency),
          payment_status = VALUES(payment_status),
          checkout_status = VALUES(checkout_status),
          price_label = VALUES(price_label),
          stripe_response_json = VALUES(stripe_response_json),
          updated_at = CURRENT_TIMESTAMP'
    );

    $paymentId = 0;
    if ($paymentStmt) {
        $sessionId = (string) ($stripeSession['id'] ?? '');
        $amountTotal = (int) ($stripeSession['amountTotal'] ?? 0);
        $currency = (string) ($stripeSession['currency'] ?? 'eur');
        $paymentStatus = (string) ($stripeSession['paymentStatus'] ?? '');
        $checkoutStatus = (string) ($stripeSession['status'] ?? '');
        $priceLabel = (string) ($draftRow['price_label'] ?? '');
        $stripeJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $paymentStmt->bind_param('isisssss', $requestId, $sessionId, $amountTotal, $currency, $paymentStatus, $checkoutStatus, $priceLabel, $stripeJson);
        $paymentStmt->execute();
        $paymentId = (int) $paymentStmt->insert_id;
        $paymentStmt->close();
    }

    $invoiceStmt = $db->prepare(
        'INSERT INTO client_area_invoices
          (request_id, payment_id, shipment_id, provider, provider_document_id, status, invoice_pdf_url, billing_json, provider_payload_json)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)'
    );

    if ($invoiceStmt) {
        $invoiceProvider = trim((string) (public_api_env('INVOICE_PROVIDER', 'pending') ?: 'pending'));
        $invoiceStatus = $invoiceProvider === 'acube_stripe'
            ? 'managed_in_stripe_acube'
            : ($invoiceProvider !== '' ? 'pending_provider_issue' : 'pending_provider_config');

        $providerDocumentId = (string) ($stripeSession['invoiceId'] ?? '');
        $invoicePdfUrl = (string) ($stripeSession['invoicePdf'] ?? '');
        if ($invoicePdfUrl === '') {
            $invoicePdfUrl = (string) ($stripeSession['hostedInvoiceUrl'] ?? '');
        }
        $invoicePdfUrlValue = $invoicePdfUrl !== '' ? $invoicePdfUrl : null;

        $billingJson = json_encode([
            'customerName' => $customerName,
            'email' => $email,
            'phone' => $phone,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $providerPayloadJson = json_encode([
            'stripeSession' => $stripeSession,
            'cafPatronatoService' => $serviceType,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $paymentIdForInvoice = $paymentId > 0 ? $paymentId : null;
        $invoiceStmt->bind_param('iissssss', $requestId, $paymentIdForInvoice, $invoiceProvider, $providerDocumentId, $invoiceStatus, $invoicePdfUrlValue, $billingJson, $providerPayloadJson);
        $invoiceStmt->execute();
        $invoiceStmt->close();
    }

    $consumeStmt = $db->prepare('UPDATE client_area_caf_checkout_drafts SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?');
    if ($consumeStmt) {
        $draftId = (int) ($draftRow['id'] ?? 0);
        $consumeStmt->bind_param('i', $draftId);
        $consumeStmt->execute();
        $consumeStmt->close();
    }

    client_area_notify_event(
        'caf-patronato',
        'Nuova pratica CAF/Patronato finalizzata',
        $customerName,
        $email,
        $phone,
        [
            'requestId' => (string) $requestId,
            'servizio' => $serviceLabel,
            'ambito' => $scope,
            'sessionStripe' => (string) ($stripeSession['id'] ?? ''),
        ]
    );

    client_area_json([
        'message' => 'Pagamento confermato e pratica inviata al team. Il patronato ha già ricevuto il link operativo.',
        'requestId' => $requestId,
        'serviceLabel' => $serviceLabel,
        'payment' => [
            'amountCents' => (int) ($stripeSession['amountTotal'] ?? 0),
            'currency' => (string) ($stripeSession['currency'] ?? 'eur'),
            'sessionId' => (string) ($stripeSession['id'] ?? ''),
            'priceLabel' => (string) ($draftRow['price_label'] ?? ''),
            'invoicePdf' => (string) ($stripeSession['invoicePdf'] ?? ''),
            'hostedInvoiceUrl' => (string) ($stripeSession['hostedInvoiceUrl'] ?? ''),
        ],
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Pagamento presente, ma la pratica non è stata finalizzata.',
    ], 502);
}
