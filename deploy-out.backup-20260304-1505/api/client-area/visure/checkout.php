<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

$body = client_area_parse_json_body();
$serviceType = trim((string) ($body['serviceType'] ?? ''));
$customerName = trim((string) ($body['customerName'] ?? ''));
$email = strtolower(trim((string) ($body['email'] ?? '')));

if (!in_array($serviceType, client_area_supported_visura_services(), true) || $customerName === '' || !str_contains($email, '@')) {
    client_area_json([
        'message' => 'Compila almeno nome, email e tipologia di visura prima del pagamento.',
    ], 400);
}

try {
    $price = client_area_resolve_visura_price($serviceType);
    $origin = client_area_site_origin();

    $checkout = client_area_create_stripe_checkout_session([
        'amountCents' => (int) ($price['amountCents'] ?? 0),
        'customerEmail' => $email,
        'description' => (string) ($price['label'] ?? 'Visura') . ' • ' . $serviceType,
        'successUrl' => $origin . '/area-clienti/visure/conferma-pagamento?session_id={CHECKOUT_SESSION_ID}',
        'cancelUrl' => $origin . '/area-clienti/visure?visura_checkout=cancel',
        'invoiceDescription' => (string) ($price['label'] ?? 'Visura') . ' per ' . $customerName,
        'metadata' => [
            'service_type' => $serviceType,
            'price_label' => (string) ($price['label'] ?? 'Visura'),
            'customer_name' => $customerName,
        ],
    ]);

    $url = trim((string) ($checkout['url'] ?? ''));
    if ($url === '') {
        throw new RuntimeException('URL checkout Stripe non disponibile.');
    }

    client_area_json([
        'url' => $url,
        'amountCents' => (int) ($price['amountCents'] ?? 0),
        'priceLabel' => (string) ($price['label'] ?? 'Visura'),
        'message' => 'Reindirizzamento a Stripe per completare il pagamento della visura.',
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Creazione checkout Stripe non riuscita.',
    ], 502);
}
