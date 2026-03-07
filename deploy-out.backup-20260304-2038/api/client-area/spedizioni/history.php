<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    client_area_json(['message' => 'Metodo non consentito.'], 405);
}

if (!client_area_has_database_config()) {
    client_area_json(['shipments' => [], 'message' => 'Database non configurato.'], 200);
}

try {
    client_area_ensure_client_area_requests_table();
    client_area_ensure_client_area_shipments_table();
    client_area_ensure_client_area_payments_table();
    client_area_ensure_client_area_invoices_table();

    $db = client_area_require_db();
    $sql =
        'SELECT
            s.id,
            s.request_id,
            s.tracking_code,
            s.parcel_id,
            s.shipment_number_from,
            s.shipment_number_to,
            s.brt_response_json,
            s.created_at,
            r.customer_name,
            r.email,
            r.service_type,
            r.status,
            r.details_json,
            p.amount_cents,
            p.currency,
            p.payment_status,
            p.checkout_status,
            p.price_label,
            i.status AS invoice_status,
            i.invoice_pdf_url
        FROM client_area_shipments s
        LEFT JOIN client_area_requests r ON r.id = s.request_id
        LEFT JOIN client_area_payments p ON p.shipment_id = s.id OR p.request_id = s.request_id
        LEFT JOIN client_area_invoices i ON i.shipment_id = s.id OR i.request_id = s.request_id
        ORDER BY s.created_at DESC
        LIMIT 20';

    $result = $db->query($sql);
    if (!$result) {
        throw new RuntimeException('Impossibile leggere lo storico spedizioni.');
    }

    $shipments = [];
    while ($row = $result->fetch_assoc()) {
        $details = [];
        $brtResponse = [];

        $detailsJson = $row['details_json'] ?? null;
        if (is_string($detailsJson) && $detailsJson !== '') {
            $decoded = json_decode($detailsJson, true);
            if (is_array($decoded)) {
                $details = $decoded;
            }
        }

        $brtJson = $row['brt_response_json'] ?? null;
        if (is_string($brtJson) && $brtJson !== '') {
            $decoded = json_decode($brtJson, true);
            if (is_array($decoded)) {
                $brtResponse = $decoded;
            }
        }

        $manifest = [];
        if (is_array($brtResponse['manifest'] ?? null)) {
            $manifest = $brtResponse['manifest'];
        }

        $shipments[] = [
            'id' => (int) ($row['id'] ?? 0),
            'requestId' => (int) ($row['request_id'] ?? 0),
            'trackingCode' => (string) ($row['tracking_code'] ?? ''),
            'parcelId' => (string) ($row['parcel_id'] ?? ''),
            'shipmentNumberFrom' => (string) ($row['shipment_number_from'] ?? ''),
            'shipmentNumberTo' => (string) ($row['shipment_number_to'] ?? ''),
            'createdAt' => $row['created_at'] ?? null,
            'customerName' => (string) ($row['customer_name'] ?? ''),
            'email' => (string) ($row['email'] ?? ''),
            'serviceType' => (string) ($row['service_type'] ?? ''),
            'status' => (string) ($row['status'] ?? ''),
            'destinationCompanyName' => (string) ($details['destinationCompanyName'] ?? ''),
            'destinationCity' => (string) ($details['destinationCity'] ?? ''),
            'destinationCountry' => (string) ($details['destinationCountry'] ?? ''),
            'parcelCount' => (float) ($details['parcelCount'] ?? 0),
            'actualWeightKG' => (float) ($details['weightKG'] ?? 0),
            'volumetricWeightKG' => (float) ($details['volumetricWeightKG'] ?? 0),
            'volumeM3' => (float) ($details['volumeM3'] ?? 0),
            'paymentAmountCents' => (int) ($row['amount_cents'] ?? 0),
            'paymentCurrency' => (string) ($row['currency'] ?? 'eur'),
            'paymentStatus' => (string) ($row['payment_status'] ?? ''),
            'checkoutStatus' => (string) ($row['checkout_status'] ?? ''),
            'priceLabel' => (string) ($row['price_label'] ?? ''),
            'invoiceStatus' => (string) ($row['invoice_status'] ?? ''),
            'invoicePdfUrl' => (string) ($row['invoice_pdf_url'] ?? ''),
            'manifestCreated' => (bool) ($manifest['created'] ?? false),
            'manifestMessage' => (string) ($manifest['message'] ?? ''),
        ];
    }
    $result->close();

    client_area_json(['shipments' => $shipments], 200);
} catch (Throwable $error) {
    client_area_json([
        'shipments' => [],
        'message' => trim($error->getMessage()) !== '' ? $error->getMessage() : 'Caricamento storico spedizioni non riuscito.',
    ], 500);
}
