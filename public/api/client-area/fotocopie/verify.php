<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

function client_area_fotocopie_ensure_table(): void
{
    $db = client_area_require_db();
    $db->query("\n        CREATE TABLE IF NOT EXISTS client_area_photocopy_orders (\n          id INT AUTO_INCREMENT PRIMARY KEY,\n          request_id INT NOT NULL,\n          order_token CHAR(64) NOT NULL,\n          customer_name VARCHAR(191) NOT NULL,\n          email VARCHAR(191) NOT NULL,\n          phone VARCHAR(80) NOT NULL DEFAULT '',\n          resident_city VARCHAR(120) NOT NULL DEFAULT '',\n          pickup_mode VARCHAR(80) NOT NULL DEFAULT 'ritiro_in_agenzia',\n          pdf_file_name VARCHAR(255) NOT NULL,\n          pdf_url TEXT NOT NULL,\n          page_count INT NOT NULL,\n          unit_price_cents INT NOT NULL,\n          amount_cents INT NOT NULL,\n          currency VARCHAR(8) NOT NULL DEFAULT 'eur',\n          stripe_session_id VARCHAR(191) NOT NULL DEFAULT '',\n          payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',\n          checkout_status VARCHAR(40) NOT NULL DEFAULT '',\n          admin_notified_at DATETIME NULL,\n          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          UNIQUE KEY uq_client_area_photocopy_order_token (order_token),\n          KEY idx_client_area_photocopy_request (request_id),\n          KEY idx_client_area_photocopy_status (payment_status),\n          KEY idx_client_area_photocopy_session (stripe_session_id)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4\n    ");
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['message' => 'Database non configurato.'], 503);
}

if (!client_area_is_stripe_configured()) {
    client_area_json(['message' => 'Stripe non configurato.'], 503);
}

try {
    $body = client_area_parse_json_body();
    $sessionId = trim((string) ($body['sessionId'] ?? ''));
    $orderToken = trim((string) ($body['orderToken'] ?? ''));

    if ($sessionId === '' || $orderToken === '') {
        client_area_json(['message' => 'Sessione pagamento o token ordine mancanti.'], 400);
    }

    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_payments_table();
    client_area_fotocopie_ensure_table();

    $db = client_area_require_db();
    $stmt = $db->prepare(
        'SELECT id, request_id, customer_name, email, phone, resident_city, pickup_mode, pdf_url, page_count, unit_price_cents, amount_cents, currency, stripe_session_id, payment_status, checkout_status, admin_notified_at
         FROM client_area_photocopy_orders
         WHERE order_token = ?
         LIMIT 1'
    );

    if (!$stmt) {
        throw new RuntimeException('Impossibile verificare l\'ordine fotocopie.');
    }

    $stmt->bind_param('s', $orderToken);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    if (!$order) {
        client_area_json(['message' => 'Ordine fotocopie non trovato.'], 404);
    }

    $storedSessionId = trim((string) ($order['stripe_session_id'] ?? ''));
    if ($storedSessionId !== '' && $storedSessionId !== $sessionId) {
        client_area_json(['message' => 'Sessione Stripe non associata a questo ordine.'], 400);
    }

    $stripeSession = client_area_get_stripe_checkout_session($sessionId);
    $paid = ($stripeSession['status'] ?? '') === 'complete' && ($stripeSession['paymentStatus'] ?? '') === 'paid';

    if (!$paid) {
        client_area_json(['message' => 'Pagamento non ancora confermato da Stripe.'], 409);
    }

    $expectedAmount = (int) ($order['amount_cents'] ?? 0);
    $expectedCurrency = strtolower((string) ($order['currency'] ?? 'eur'));

    if ((int) ($stripeSession['amountTotal'] ?? 0) !== $expectedAmount || strtolower((string) ($stripeSession['currency'] ?? 'eur')) !== $expectedCurrency) {
        client_area_json([
            'message' => 'Importo pagamento non coerente con l\'ordine fotocopie.',
        ], 409);
    }

    $orderId = (int) ($order['id'] ?? 0);
    $requestId = (int) ($order['request_id'] ?? 0);

    $updateOrderStmt = $db->prepare(
        'UPDATE client_area_photocopy_orders
         SET stripe_session_id = ?, payment_status = ?, checkout_status = ?
         WHERE id = ?'
    );

    if ($updateOrderStmt) {
        $paymentStatus = (string) ($stripeSession['paymentStatus'] ?? 'paid');
        $checkoutStatus = (string) ($stripeSession['status'] ?? 'complete');
        $stripeSessionId = (string) ($stripeSession['id'] ?? $sessionId);
        $updateOrderStmt->bind_param('sssi', $stripeSessionId, $paymentStatus, $checkoutStatus, $orderId);
        $updateOrderStmt->execute();
        $updateOrderStmt->close();
    }

    $requestStatusStmt = $db->prepare(
        "UPDATE client_area_requests
         SET status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND area = 'fotocopie-online'"
    );

    if ($requestStatusStmt) {
        $requestStatusStmt->bind_param('i', $requestId);
        $requestStatusStmt->execute();
        $requestStatusStmt->close();
    }

    $priceLabel = number_format(((int) ($order['unit_price_cents'] ?? 0)) / 100, 2, ',', '') . ' €/pagina';
    $stripeJson = json_encode($stripeSession, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

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

    if ($paymentStmt) {
        $stripeSessionId = (string) ($stripeSession['id'] ?? $sessionId);
        $amountCents = (int) ($stripeSession['amountTotal'] ?? 0);
        $currency = (string) ($stripeSession['currency'] ?? 'eur');
        $paymentStatus = (string) ($stripeSession['paymentStatus'] ?? 'paid');
        $checkoutStatus = (string) ($stripeSession['status'] ?? 'complete');
        $paymentStmt->bind_param(
            'isisssss',
            $requestId,
            $stripeSessionId,
            $amountCents,
            $currency,
            $paymentStatus,
            $checkoutStatus,
            $priceLabel,
            $stripeJson
        );
        $paymentStmt->execute();
        $paymentStmt->close();
    }

    $alreadyNotified = !empty($order['admin_notified_at']);
    if (!$alreadyNotified) {
        $notify = client_area_notify_event(
            'fotocopie-online',
            'Nuovo ordine fotocopie pagato',
            (string) ($order['customer_name'] ?? ''),
            (string) ($order['email'] ?? ''),
            (string) ($order['phone'] ?? ''),
            [
                'Pratica' => '#' . $requestId,
                'Ordine' => '#' . $orderId,
                'Pagine' => (string) ((int) ($order['page_count'] ?? 0)),
                'Prezzo pagina' => $priceLabel,
                'Totale pagato' => number_format($expectedAmount / 100, 2, ',', '') . ' ' . strtoupper((string) ($order['currency'] ?? 'eur')),
                'Residenza' => (string) ($order['resident_city'] ?? ''),
                'Consegna' => 'Ritiro in agenzia',
                'PDF da stampare' => (string) ($order['pdf_url'] ?? ''),
            ]
        );

        if (!empty($notify['sent'])) {
            $notifiedStmt = $db->prepare('UPDATE client_area_photocopy_orders SET admin_notified_at = CURRENT_TIMESTAMP WHERE id = ?');
            if ($notifiedStmt) {
                $notifiedStmt->bind_param('i', $orderId);
                $notifiedStmt->execute();
                $notifiedStmt->close();
            }
        }
    }

    client_area_json([
        'message' => 'Pagamento confermato. Ordine fotocopie preso in carico con ritiro in agenzia.',
        'requestId' => $requestId,
        'orderId' => $orderId,
        'pageCount' => (int) ($order['page_count'] ?? 0),
        'unitPriceCents' => (int) ($order['unit_price_cents'] ?? 0),
        'amountCents' => $expectedAmount,
        'currency' => (string) ($order['currency'] ?? 'eur'),
        'pdfUrl' => (string) ($order['pdf_url'] ?? ''),
    ], 200);
} catch (Throwable $error) {
    client_area_json([
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Impossibile verificare il pagamento fotocopie.',
    ], 500);
}
