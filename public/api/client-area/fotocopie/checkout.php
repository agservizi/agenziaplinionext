<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function client_area_fotocopie_normalize_text(string $value): string
{
    $text = trim(strtolower($value));
    $text = str_replace(['à', 'á', 'â', 'ä'], 'a', $text);
    $text = str_replace(['è', 'é', 'ê', 'ë'], 'e', $text);
    $text = str_replace(['ì', 'í', 'î', 'ï'], 'i', $text);
    $text = str_replace(['ò', 'ó', 'ô', 'ö'], 'o', $text);
    $text = str_replace(['ù', 'ú', 'û', 'ü'], 'u', $text);
    return preg_replace('/\s+/', ' ', $text) ?: '';
}

function client_area_fotocopie_is_castellammare(string $city): bool
{
    return str_contains(client_area_fotocopie_normalize_text($city), 'castellammare di stabia');
}

function client_area_fotocopie_unit_price_cents(int $pageCount): int
{
    if ($pageCount >= 20 && $pageCount <= 100) {
        return 10;
    }

    if ($pageCount >= 101 && $pageCount <= 200) {
        return 7;
    }

    if ($pageCount >= 201 && $pageCount <= 500) {
        return 5;
    }

    return 0;
}

function client_area_fotocopie_count_pdf_pages(string $absolutePath): int
{
    $content = @file_get_contents($absolutePath);
    if (!is_string($content) || $content === '') {
        throw new RuntimeException('Impossibile leggere il file PDF caricato.');
    }

    if (preg_match_all('/\/Type\s*\/Page\b/', $content, $matches) && !empty($matches[0])) {
        return count($matches[0]);
    }

    if (preg_match('/\/Count\s+(\d+)/', $content, $match)) {
        return (int) ($match[1] ?? 0);
    }

    throw new RuntimeException('Non riesco a calcolare il numero di pagine del PDF.');
}

function client_area_fotocopie_store_pdf(array $file): array
{
    $name = (string) ($file['name'] ?? '');
    $tmpName = (string) ($file['tmp_name'] ?? '');
    $error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($error !== UPLOAD_ERR_OK || $tmpName === '' || !is_uploaded_file($tmpName)) {
        throw new RuntimeException('Caricamento PDF non riuscito.');
    }

    $extension = strtolower((string) pathinfo($name, PATHINFO_EXTENSION));
    if ($extension !== 'pdf') {
        throw new RuntimeException('È consentito solo il formato PDF.');
    }

    $mime = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mime = (string) finfo_file($finfo, $tmpName);
            finfo_close($finfo);
        }
    }

    if ($mime !== '' && $mime !== 'application/pdf' && $mime !== 'application/octet-stream') {
        throw new RuntimeException('Il file caricato non risulta un PDF valido.');
    }

    $documentRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot === false || $documentRoot === '') {
        $fallback = realpath(__DIR__ . '/../../../../');
        $documentRoot = $fallback !== false ? $fallback : dirname(__DIR__, 4);
    }

    $uploadDir = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'fotocopie';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        throw new RuntimeException('Impossibile creare la cartella upload fotocopie.');
    }

    $baseName = preg_replace('/[^a-zA-Z0-9_-]+/', '-', (string) pathinfo($name, PATHINFO_FILENAME));
    $baseName = trim((string) $baseName, '-');
    if ($baseName === '') {
        $baseName = 'documento';
    }

    $storedName = 'fotocopie-' . time() . '-' . bin2hex(random_bytes(4)) . '-' . substr($baseName, 0, 40) . '.pdf';
    $absolutePath = $uploadDir . DIRECTORY_SEPARATOR . $storedName;

    if (!move_uploaded_file($tmpName, $absolutePath)) {
        throw new RuntimeException('Non riesco a salvare il PDF caricato.');
    }

    $siteUrl = rtrim(client_area_site_origin(), '/');

    return [
        'absolutePath' => $absolutePath,
        'fileName' => $storedName,
        'fileUrl' => $siteUrl . '/uploads/fotocopie/' . rawurlencode($storedName),
    ];
}

function client_area_fotocopie_ensure_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_photocopy_orders (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          order_token CHAR(64) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) NOT NULL DEFAULT '',\n          resident_city VARCHAR(120) NOT NULL DEFAULT '',\n          pickup_mode VARCHAR(80) NOT NULL DEFAULT 'ritiro_in_agenzia',\n          pdf_file_name VARCHAR(255) NOT NULL,\n          pdf_url TEXT NOT NULL,\n          page_count INT NOT NULL,\n          unit_price_cents INT NOT NULL,\n          amount_cents INT NOT NULL,\n          currency VARCHAR(8) NOT NULL DEFAULT 'eur',\n          stripe_session_id VARCHAR(191) NOT NULL DEFAULT '',\n          payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',\n          checkout_status VARCHAR(40) NOT NULL DEFAULT '',\n          admin_notified_at DATETIME NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_photocopy_order_token (order_token),\n          KEY idx_client_area_photocopy_request (request_id),\n          KEY idx_client_area_photocopy_status (payment_status),\n          KEY idx_client_area_photocopy_session (stripe_session_id)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

try {
    $customerName = trim((string) ($_POST['customerName'] ?? ''));
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    $city = trim((string) ($_POST['city'] ?? ''));
    $notes = trim((string) ($_POST['notes'] ?? ''));
    $residentConfirmed = (string) ($_POST['residentConfirmed'] ?? '0') === '1';
    $pickupConfirmed = (string) ($_POST['pickupConfirmed'] ?? '0') === '1';

    if ($customerName === '' || !str_contains($email, '@') || $phone === '') {
        client_area_json(['message' => 'Compila nome, email e telefono prima di procedere.'], 400);
    }

    if (!$residentConfirmed || !client_area_fotocopie_is_castellammare($city)) {
        client_area_json([
            'message' => 'Servizio disponibile solo per residenti a Castellammare di Stabia.',
        ], 400);
    }

    if (!$pickupConfirmed) {
        client_area_json(['message' => 'Il servizio prevede solo il ritiro in agenzia.'], 400);
    }

    if (!isset($_FILES['pdfFile']) || !is_array($_FILES['pdfFile'])) {
        client_area_json(['message' => 'Carica un file PDF da stampare.'], 400);
    }

    $storedFile = client_area_fotocopie_store_pdf($_FILES['pdfFile']);
    $pageCount = client_area_fotocopie_count_pdf_pages((string) $storedFile['absolutePath']);

    if ($pageCount < 20 || $pageCount > 500) {
        client_area_json([
            'message' => 'Il PDF deve contenere da 20 a 500 pagine per questo servizio.',
        ], 400);
    }

    $unitPriceCents = client_area_fotocopie_unit_price_cents($pageCount);
    if ($unitPriceCents <= 0) {
        client_area_json(['message' => 'Fascia prezzo non valida per il numero di pagine.'], 400);
    }

    $amountCents = $pageCount * $unitPriceCents;
    $priceLabel = number_format($unitPriceCents / 100, 2, ',', '') . ' €/pagina';

    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_payments_table();
    client_area_fotocopie_ensure_table();

    $db = client_area_require_db();
    $details = [
        'service' => 'fotocopie-online',
        'residentCity' => $city,
        'pickupMode' => 'ritiro_in_agenzia',
        'pageCount' => $pageCount,
        'unitPriceCents' => $unitPriceCents,
        'amountCents' => $amountCents,
        'pdfUrl' => (string) $storedFile['fileUrl'],
    ];

    if ($notes !== '') {
        $details['notes'] = $notes;
    }

    $detailsJson = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $requestStmt = $db->prepare(
        "INSERT INTO client_area_requests
         (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES ('fotocopie-online', 'fotocopie-online', ?, ?, ?, ?, ?, 'pending_payment')"
    );

    if (!$requestStmt) {
        throw new RuntimeException('Impossibile registrare la richiesta fotocopie.');
    }

    $requestStmt->bind_param('sssss', $customerName, $email, $phone, $notes, $detailsJson);
    $requestStmt->execute();
    $requestId = (int) ($requestStmt->insert_id ?: 0);
    $requestStmt->close();

    if ($requestId <= 0) {
        throw new RuntimeException('Richiesta fotocopie non salvata.');
    }

    $orderToken = bin2hex(random_bytes(32));
    $orderStmt = $db->prepare(
        'INSERT INTO client_area_photocopy_orders
         (request_id, order_token, customer_name, email, phone, resident_city, pickup_mode, pdf_file_name, pdf_url, page_count, unit_price_cents, amount_cents, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$orderStmt) {
        throw new RuntimeException('Impossibile creare l\'ordine fotocopie.');
    }

    $currency = 'eur';
    $pickupMode = 'ritiro_in_agenzia';
    $fileName = (string) $storedFile['fileName'];
    $fileUrl = (string) $storedFile['fileUrl'];

    $orderStmt->bind_param(
        'issssssssiiis',
        $requestId,
        $orderToken,
        $customerName,
        $email,
        $phone,
        $city,
        $pickupMode,
        $fileName,
        $fileUrl,
        $pageCount,
        $unitPriceCents,
        $amountCents,
        $currency
    );
    $orderStmt->execute();
    $orderId = (int) ($orderStmt->insert_id ?: 0);
    $orderStmt->close();

    if ($orderId <= 0) {
        throw new RuntimeException('Ordine fotocopie non creato.');
    }

    $origin = client_area_site_origin();
    $checkout = client_area_create_stripe_checkout_session([
        'amountCents' => $amountCents,
        'customerEmail' => $email,
        'description' => 'Fotocopie online • ' . $pageCount . ' pagine',
        'successUrl' => $origin . '/area-clienti/fotocopie/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}&order_token=' . rawurlencode($orderToken),
        'cancelUrl' => $origin . '/area-clienti/fotocopie?fotocopie_checkout=cancel',
        'invoiceDescription' => 'Fotocopie online (' . $pageCount . ' pagine) per ' . $customerName,
        'metadata' => [
            'area' => 'fotocopie-online',
            'order_token' => $orderToken,
            'request_id' => (string) $requestId,
            'order_id' => (string) $orderId,
            'page_count' => (string) $pageCount,
            'unit_price_cents' => (string) $unitPriceCents,
            'pickup_mode' => $pickupMode,
        ],
    ]);

    $checkoutUrl = trim((string) ($checkout['url'] ?? ''));
    $stripeSessionId = trim((string) ($checkout['id'] ?? ''));

    if ($checkoutUrl === '' || $stripeSessionId === '') {
        throw new RuntimeException('URL checkout Stripe non disponibile.');
    }

    $updateStmt = $db->prepare(
        'UPDATE client_area_photocopy_orders
         SET stripe_session_id = ?, checkout_status = ?
         WHERE id = ?'
    );

    if ($updateStmt) {
        $checkoutStatus = 'open';
        $updateStmt->bind_param('ssi', $stripeSessionId, $checkoutStatus, $orderId);
        $updateStmt->execute();
        $updateStmt->close();
    }

    client_area_json([
        'url' => $checkoutUrl,
        'message' => 'Reindirizzamento a Stripe per completare il pagamento fotocopie.',
        'orderId' => $orderId,
        'orderToken' => $orderToken,
        'pageCount' => $pageCount,
        'unitPriceCents' => $unitPriceCents,
        'amountCents' => $amountCents,
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile avviare il checkout fotocopie.',
    ], 500);
}
