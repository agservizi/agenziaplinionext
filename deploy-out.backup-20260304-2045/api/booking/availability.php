<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$config = booking_config();
if (!$config['enabled'] || $config['calendarId'] === '') {
    booking_json(['message' => 'Google Calendar non configurato'], 503);
}

$date = trim((string) ($_GET['date'] ?? ''));
if ($date === '') {
    booking_json(['message' => 'Data non valida'], 400);
}

$day = DateTimeImmutable::createFromFormat('Y-m-d', $date, new DateTimeZone($config['timezone']));
if (!$day) {
    booking_json(['message' => 'Data non valida'], 400);
}

try {
    $response = booking_calendar_request(
        'GET',
        'calendars/' . rawurlencode($config['calendarId']) . '/events',
        [
            'timeMin' => $day->setTime(0, 0, 0)->format(DATE_ATOM),
            'timeMax' => $day->setTime(23, 59, 59)->format(DATE_ATOM),
            'singleEvents' => 'true',
            'orderBy' => 'startTime',
        ],
    );

    if ($response['status'] < 200 || $response['status'] >= 300) {
        booking_json(['message' => 'Errore nel recupero disponibilità'], 500);
    }

    $items = is_array($response['json']['items'] ?? null) ? $response['json']['items'] : [];
    $slots = booking_build_slots($date, $config['timezone'], (int) $config['defaultDuration']);
    $busyRanges = booking_busy_ranges($items, $date, $config['timezone']);

    booking_json([
        'date' => $date,
        'timezone' => $config['timezone'],
        'duration' => (int) $config['defaultDuration'],
        'slots' => booking_exclude_busy($slots, $busyRanges),
    ]);
} catch (Throwable $error) {
    booking_json(['message' => 'Errore nel recupero disponibilità'], 500);
}
