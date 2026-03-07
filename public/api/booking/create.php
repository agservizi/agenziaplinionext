<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    booking_json(['message' => 'Metodo non consentito'], 405);
}

$config = booking_config();
if (!$config['enabled'] || $config['calendarId'] === '') {
    booking_json(['message' => 'Google Calendar non configurato'], 503);
}

$body = booking_parse_json_body();
$service = trim((string) ($body['service'] ?? ''));
$date = trim((string) ($body['date'] ?? ''));
$time = trim((string) ($body['time'] ?? ''));
$name = trim((string) ($body['name'] ?? ''));
$email = trim((string) ($body['email'] ?? ''));
$phone = trim((string) ($body['phone'] ?? ''));
$notes = trim((string) ($body['notes'] ?? ''));

if ($service === '' || $date === '' || $time === '' || $name === '' || $email === '' || $phone === '') {
    booking_json(['message' => 'Compila tutti i campi obbligatori.'], 400);
}

$timezone = new DateTimeZone($config['timezone']);
$start = DateTimeImmutable::createFromFormat('Y-m-d H:i', $date . ' ' . $time, $timezone);
if (!$start) {
    booking_json(['message' => 'Data o ora non valide.'], 400);
}

$durationInterval = new DateInterval('PT' . (int) $config['defaultDuration'] . 'M');
$end = $start->add($durationInterval);
$now = new DateTimeImmutable('now', $timezone);

if ($start < $now->modify('-5 minutes')) {
    booking_json(['message' => 'Seleziona una data futura.'], 400);
}

$availableSlots = booking_build_slots($date, $config['timezone'], (int) $config['defaultDuration']);
$requestedStartTs = $start->getTimestamp();
$isWithinBusinessHours = false;

foreach ($availableSlots as $slot) {
    if (strtotime((string) $slot['start']) === $requestedStartTs) {
        $isWithinBusinessHours = true;
        break;
    }
}

if (!$isWithinBusinessHours) {
    booking_json(['message' => 'Questo orario non rientra nelle fasce prenotabili.'], 400);
}

try {
    $eventsResponse = booking_calendar_request(
        'GET',
        'calendars/' . rawurlencode($config['calendarId']) . '/events',
        [
            'timeMin' => $start->setTime(0, 0, 0)->format(DATE_ATOM),
            'timeMax' => $start->setTime(23, 59, 59)->format(DATE_ATOM),
            'singleEvents' => 'true',
            'orderBy' => 'startTime',
        ],
    );

    if ($eventsResponse['status'] < 200 || $eventsResponse['status'] >= 300) {
        booking_json([
            'message' => booking_google_error_message($eventsResponse, 'Errore nel controllo disponibilità'),
        ], 500);
    }

    $items = is_array($eventsResponse['json']['items'] ?? null) ? $eventsResponse['json']['items'] : [];
    $busyRanges = booking_busy_ranges($items, $date, $config['timezone']);
    $startTs = $start->getTimestamp();
    $endTs = $end->getTimestamp();

    foreach ($busyRanges as [$busyStart, $busyEnd]) {
        if ($startTs < $busyEnd && $endTs > $busyStart) {
            booking_json(['message' => 'Slot non disponibile.'], 409);
        }
    }

    $descriptionLines = [
        'Nome: ' . $name,
        'Email: ' . $email,
        'Telefono: ' . $phone,
    ];

    if ($notes !== '') {
        $descriptionLines[] = '';
        $descriptionLines[] = 'Note: ' . $notes;
    }

    $eventBody = [
        'summary' => 'Appuntamento ' . $service . ' - ' . $name,
        'description' => implode("\n", $descriptionLines),
        'start' => [
            'dateTime' => $start->format(DATE_ATOM),
            'timeZone' => $config['timezone'],
        ],
        'end' => [
            'dateTime' => $end->format(DATE_ATOM),
            'timeZone' => $config['timezone'],
        ],
    ];

    if ($config['inviteClient']) {
        $eventBody['attendees'] = [[
            'email' => $email,
            'displayName' => $name,
        ]];
    }

    $insertResponse = booking_calendar_request(
        'POST',
        'calendars/' . rawurlencode($config['calendarId']) . '/events',
        ['sendUpdates' => $config['sendUpdates']],
        $eventBody,
    );

    if (
        ($insertResponse['status'] < 200 || $insertResponse['status'] >= 300)
        && !empty($eventBody['attendees'])
        && booking_is_attendees_permission_error($insertResponse)
    ) {
        unset($eventBody['attendees']);
        $insertResponse = booking_calendar_request(
            'POST',
            'calendars/' . rawurlencode($config['calendarId']) . '/events',
            ['sendUpdates' => 'none'],
            $eventBody,
        );
    }

    if ($insertResponse['status'] < 200 || $insertResponse['status'] >= 300) {
        booking_json([
            'message' => booking_google_error_message($insertResponse, 'Errore nella creazione appuntamento'),
        ], 500);
    }

    $eventId = is_array($insertResponse['json']) ? (string) ($insertResponse['json']['id'] ?? '') : '';
    booking_store_request(
        $eventId !== '' ? $eventId : null,
        $name,
        $email,
        $phone,
        $service,
        $start,
        $end,
        $notes
    );

    booking_json([
        'message' => 'Prenotazione confermata',
        'eventId' => $eventId !== '' ? $eventId : null,
        'start' => $start->format(DATE_ATOM),
        'end' => $end->format(DATE_ATOM),
    ]);
} catch (Throwable $error) {
    booking_json([
        'message' => $error->getMessage() !== '' ? $error->getMessage() : 'Errore nella creazione appuntamento',
    ], 500);
}
