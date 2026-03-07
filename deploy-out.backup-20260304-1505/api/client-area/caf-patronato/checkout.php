<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function caf_service_scope(string $serviceType): string
{
    return str_starts_with($serviceType, 'patronato-') ? 'patronato' : 'caf';
}

function caf_service_label(string $serviceType): string
{
    $label = str_replace(['caf-', 'patronato-'], '', $serviceType);
    $label = str_replace('-', ' ', $label);
    $label = trim($label);
    if ($label === '') return 'Pratica';
    return mb_convert_case($label, MB_CASE_TITLE, 'UTF-8');
}

function caf_resolve_price(mysqli $db, string $serviceType): array
{
    $db->query("\n        CREATE TABLE IF NOT EXISTS caf_patronato_pricing_rules (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          service_type VARCHAR(120) NOT NULL,\n          label VARCHAR(191) NOT NULL,\n          price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,\n          sort_order INT NOT NULL DEFAULT 0,\n          active TINYINT(1) NOT NULL DEFAULT 1,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          KEY idx_caf_patronato_pricing_service (service_type),\n          KEY idx_caf_patronato_pricing_active (active)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $fallbackLabel = caf_service_label($serviceType) . ' CAF/Patronato';
    $fallback = ['amountCents' => 2900, 'label' => $fallbackLabel];

    $stmt = $db->prepare(
        'SELECT label, price_eur
         FROM caf_patronato_pricing_rules
         WHERE service_type = ? AND active = 1
         ORDER BY sort_order ASC, id ASC
         LIMIT 1'
    );

    if (!$stmt) return $fallback;

    $stmt->bind_param('s', $serviceType);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$row) return $fallback;

    $priceEUR = (float) ($row['price_eur'] ?? 0);
    if ($priceEUR <= 0) return $fallback;

    return [
        'amountCents' => (int) round($priceEUR * 100),
        'label' => trim((string) ($row['label'] ?? '')) !== '' ? (string) $row['label'] : $fallbackLabel,
    ];
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato'], 503);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

$customerName = trim((string) ($_POST['customerName'] ?? ''));
$email = strtolower(trim((string) ($_POST['email'] ?? '')));
$phone = trim((string) ($_POST['phone'] ?? ''));
$scope = trim((string) ($_POST['scope'] ?? ''));
$serviceType = trim((string) ($_POST['serviceType'] ?? ''));
$urgency = trim((string) ($_POST['urgency'] ?? ''));
$preferredContactMethod = trim((string) ($_POST['preferredContactMethod'] ?? ''));
$preferredContactDate = trim((string) ($_POST['preferredContactDate'] ?? ''));
$documentSummary = trim((string) ($_POST['documentSummary'] ?? ''));
$notes = trim((string) ($_POST['notes'] ?? ''));

if ($customerName === '' || !str_contains($email, '@') || $serviceType === '' || !in_array($scope, ['caf', 'patronato'], true)) {
    client_area_json(['message' => 'Compila nominativo, email, ambito e servizio prima del pagamento.'], 400);
}

try {
    $db = client_area_require_db();

    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_caf_checkout_drafts (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          draft_token VARCHAR(64) NOT NULL,\n          service_type VARCHAR(120) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          amount_cents INT NOT NULL DEFAULT 0,\n          price_label VARCHAR(191) NOT NULL DEFAULT '',\n          draft_json JSON NOT NULL,\n          expires_at DATETIME NOT NULL,\n          consumed_at DATETIME NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_caf_checkout_draft_token (draft_token),\n          KEY idx_client_area_caf_checkout_expires (expires_at)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");

    $price = caf_resolve_price($db, $serviceType);
    $draftToken = bin2hex(random_bytes(24));
    $expiresAt = (new DateTimeImmutable('+6 hours'))->format('Y-m-d H:i:s');

    $pendingDir = __DIR__ . '/../../../../storage/caf-patronato/pending';
    if (!is_dir($pendingDir)) {
        mkdir($pendingDir, 0775, true);
    }

    $pendingFiles = [];
    if (isset($_FILES['files'])) {
        $names = $_FILES['files']['name'] ?? [];
        $tmpNames = $_FILES['files']['tmp_name'] ?? [];
        $types = $_FILES['files']['type'] ?? [];
        $sizes = $_FILES['files']['size'] ?? [];
        $errors = $_FILES['files']['error'] ?? [];

        if (!is_array($names)) {
            $names = [$names];
            $tmpNames = [$tmpNames];
            $types = [$types];
            $sizes = [$sizes];
            $errors = [$errors];
        }

        foreach ($names as $index => $originalName) {
            if (($errors[$index] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                continue;
            }
            $tmpPath = (string) ($tmpNames[$index] ?? '');
            if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
                continue;
            }

            $safeOriginalName = preg_replace('/[^a-zA-Z0-9._-]/', '-', (string) $originalName) ?: 'documento';
            $storedName = time() . '-' . bin2hex(random_bytes(8)) . '-' . $safeOriginalName;
            $destination = $pendingDir . '/' . $storedName;
            if (!move_uploaded_file($tmpPath, $destination)) {
                continue;
            }

            $pendingFiles[] = [
                'originalName' => $safeOriginalName,
                'storedName' => $storedName,
                'absolutePath' => $destination,
                'mimeType' => (string) ($types[$index] ?? 'application/octet-stream'),
                'sizeBytes' => (int) ($sizes[$index] ?? 0),
            ];
        }
    }

    $draftJson = json_encode([
        'customerName' => $customerName,
        'email' => $email,
        'phone' => $phone,
        'scope' => $scope,
        'serviceType' => $serviceType,
        'urgency' => $urgency,
        'preferredContactMethod' => $preferredContactMethod,
        'preferredContactDate' => $preferredContactDate,
        'documentSummary' => $documentSummary,
        'notes' => $notes,
        'pendingFiles' => $pendingFiles,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $stmt = $db->prepare(
        'INSERT INTO client_area_caf_checkout_drafts
          (draft_token, service_type, customer_name, email, amount_cents, price_label, draft_json, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$stmt) {
        throw new RuntimeException('Impossibile salvare la bozza di checkout.');
    }

    $amountCents = (int) ($price['amountCents'] ?? 0);
    $priceLabel = (string) ($price['label'] ?? 'Pratica CAF/Patronato');
    $stmt->bind_param('ssssiiss', $draftToken, $serviceType, $customerName, $email, $amountCents, $priceLabel, $draftJson, $expiresAt);
    $stmt->execute();
    $stmt->close();

    $origin = client_area_site_origin();
    $checkout = client_area_create_stripe_checkout_session([
        'amountCents' => $amountCents,
        'customerEmail' => $email,
        'description' => $priceLabel . ' • ' . caf_service_label($serviceType),
        'productName' => 'Pratica CAF e Patronato AG SERVIZI',
        'successUrl' => $origin . '/area-clienti/caf-patronato/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}',
        'cancelUrl' => $origin . '/area-clienti/caf-patronato?caf_checkout=cancel',
        'invoiceDescription' => $priceLabel . ' per ' . $customerName,
        'metadata' => [
            'service_type' => $serviceType,
            'draft_token' => $draftToken,
            'customer_name' => $customerName,
            'scope' => $scope,
        ],
    ]);

    $url = trim((string) ($checkout['url'] ?? ''));
    if ($url === '') {
        throw new RuntimeException('URL checkout Stripe non disponibile.');
    }

    client_area_json([
        'url' => $url,
        'draftToken' => $draftToken,
        'amountCents' => $amountCents,
        'priceLabel' => $priceLabel,
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Pagamento pratica CAF/Patronato non avviato.',
    ], 502);
}
