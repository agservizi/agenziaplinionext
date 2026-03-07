<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

admin_api_require_session();
admin_api_ensure_client_area_requests_table();
admin_api_ensure_client_area_payments_table();
admin_api_ensure_client_area_invoices_table();

$db = admin_api_require_db();
$result = $db->query(
    "SELECT
        p.id,
        p.request_id,
        p.shipment_id,
        p.stripe_session_id,
        p.amount_cents,
        p.currency,
        p.payment_status,
        p.checkout_status,
        p.price_label,
        p.created_at,
        r.customer_name,
        r.email,
        r.service_type,
        r.status AS request_status,
        i.status AS invoice_status,
        i.provider,
        i.provider_document_id,
        i.invoice_pdf_url
     FROM client_area_payments p
     LEFT JOIN client_area_requests r ON r.id = p.request_id
     LEFT JOIN client_area_invoices i ON i.payment_id = p.id OR i.request_id = p.request_id
     ORDER BY p.created_at DESC
     LIMIT 100"
);

if (!$result) {
    admin_api_json(['message' => 'Errore caricamento pagamenti'], 500);
}

$payments = [];
while ($row = $result->fetch_assoc()) {
    $payments[] = [
        'id' => (int) ($row['id'] ?? 0),
        'requestId' => (int) ($row['request_id'] ?? 0),
        'shipmentId' => (int) ($row['shipment_id'] ?? 0),
        'stripeSessionId' => (string) ($row['stripe_session_id'] ?? ''),
        'amountCents' => (int) ($row['amount_cents'] ?? 0),
        'currency' => (string) ($row['currency'] ?? 'eur'),
        'paymentStatus' => (string) ($row['payment_status'] ?? ''),
        'checkoutStatus' => (string) ($row['checkout_status'] ?? ''),
        'priceLabel' => (string) ($row['price_label'] ?? ''),
        'createdAt' => $row['created_at'] ?? null,
        'customerName' => (string) ($row['customer_name'] ?? ''),
        'email' => (string) ($row['email'] ?? ''),
        'serviceType' => (string) ($row['service_type'] ?? ''),
        'requestStatus' => (string) ($row['request_status'] ?? ''),
        'invoiceStatus' => (string) ($row['invoice_status'] ?? ''),
        'invoiceProvider' => (string) ($row['provider'] ?? ''),
        'invoiceDocumentId' => (string) ($row['provider_document_id'] ?? ''),
        'invoicePdfUrl' => (string) ($row['invoice_pdf_url'] ?? ''),
    ];
}

admin_api_json(['ok' => true, 'payments' => $payments]);
