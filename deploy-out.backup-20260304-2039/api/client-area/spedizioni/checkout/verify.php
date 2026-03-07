<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

$body = client_area_parse_json_body();
$sessionId = client_area_require_string($body['sessionId'] ?? '');

if ($sessionId === '') {
    client_area_json(['message' => 'Sessione Stripe mancante.'], 400);
}

try {
    $session = client_area_get_stripe_checkout_session($sessionId);
    $paid = (($session['status'] ?? '') === 'complete') && (($session['paymentStatus'] ?? '') === 'paid');

    if (!$paid) {
        client_area_json(['message' => 'Pagamento non ancora confermato da Stripe.'], 402);
    }

    client_area_json([
        'paid' => true,
        'amountTotal' => (int) ($session['amountTotal'] ?? 0),
        'currency' => (string) ($session['currency'] ?? 'eur'),
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Verifica pagamento Stripe non riuscita.',
    ], 502);
}
