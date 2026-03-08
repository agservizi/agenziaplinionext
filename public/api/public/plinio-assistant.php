<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../client-area/bootstrap.php';

const PLINIO_ADDRESS = "Via Plinio il Vecchio 72, Castellammare di Stabia";
const PLINIO_EMAIL = "info@agenziaplinio.it";
const PLINIO_PHONE = "081 0584542";
const PLINIO_BUSINESS_NAME = "AG Servizi Via Plinio 72";
const PLINIO_WEBSITE = "https://agenziaplinio.it";
const PLINIO_BUSINESS_CATEGORY = "Agenzia multiservizi per privati e aziende";
const PLINIO_ACTIVE_FROM = "2016";
const PLINIO_BOLLETTINI_BENEFICIARI_PDF_URL = "https://www.drop-pay.com/documents/Elenco_Beneficiari_Bollettini.pdf";
const PLINIO_BOLLETTINI_BENEFICIARI_REFRESH_TTL_SECONDS = 43200;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    public_api_json(['message' => 'Metodo non consentito.'], 405);
}

$bodyRaw = file_get_contents('php://input');
$body = is_string($bodyRaw) && trim($bodyRaw) !== '' ? json_decode($bodyRaw, true) : [];
$body = is_array($body) ? $body : [];

$rawMessages = $body['messages'] ?? [];
if (!is_array($rawMessages) || $rawMessages === []) {
    public_api_json(['message' => 'Dimmi pure come posso aiutarti sui servizi di AG Servizi.']);
}

$allowedRoles = ['user', 'assistant'];
$messages = [];
foreach (array_slice($rawMessages, -12) as $item) {
    if (!is_array($item)) {
        continue;
    }
    $role = strtolower(trim((string) ($item['role'] ?? '')));
    $content = trim((string) ($item['content'] ?? ''));
    if (!in_array($role, $allowedRoles, true) || $content === '') {
        continue;
    }
    $messages[] = [
        'role' => $role,
        'content' => mb_substr($content, 0, 1800),
    ];
}

if ($messages === []) {
    public_api_json(['message' => 'Scrivimi una domanda e ti aiuto subito.']);
}

function plinio_normalize(string $text): string
{
    $text = strtolower(trim($text));
    $text = strtr($text, [
        'à' => 'a', 'á' => 'a', 'è' => 'e', 'é' => 'e', 'ì' => 'i', 'í' => 'i',
        'ò' => 'o', 'ó' => 'o', 'ù' => 'u', 'ú' => 'u',
    ]);
    return preg_replace('/\s+/', ' ', $text) ?: $text;
}

function plinio_contains_any(string $text, array $keywords): int
{
    $score = 0;
    foreach ($keywords as $keyword) {
        $needle = plinio_normalize((string) $keyword);
        if ($needle !== '' && str_contains($text, $needle)) {
            $score++;
        }
    }
    return $score;
}

function plinio_last_user_message(array $messages): string
{
    for ($i = count($messages) - 1; $i >= 0; $i--) {
        $item = $messages[$i];
        if (($item['role'] ?? '') === 'user') {
            return (string) ($item['content'] ?? '');
        }
    }
    return '';
}

function plinio_last_assistant_message(array $messages): string
{
    for ($i = count($messages) - 1; $i >= 0; $i--) {
        $item = $messages[$i];
        if (($item['role'] ?? '') === 'assistant') {
            return (string) ($item['content'] ?? '');
        }
    }
    return '';
}

function plinio_escalation_message(): string
{
    return "Per questa pratica ti conviene lasciare i tuoi recapiti oppure contattare l'agenzia allo " . PLINIO_PHONE . " / " . PLINIO_EMAIL . ".";
}

function plinio_all_user_text(array $messages): string
{
    $chunks = [];
    foreach ($messages as $item) {
        if (($item['role'] ?? '') === 'user') {
            $chunks[] = (string) ($item['content'] ?? '');
        }
    }
    return trim(implode("\n", $chunks));
}

function plinio_is_topic_switch_request(string $text): bool
{
    $normalized = plinio_normalize($text);
    if ($normalized === '') {
        return false;
    }

    return plinio_contains_any($normalized, [
        'cambiamo argomento',
        'cambiamo servizio',
        'parliamo di',
        'parliamo di altro',
        'parlare di altro',
        'possiamo parlare di altro',
        'passiamo a',
        'ora vorrei',
        'adesso vorrei',
        'invece',
        'altro servizio',
    ]) > 0;
}

function plinio_detect_service_scope(string $text): ?string
{
    $map = plinio_scope_keyword_map();

    // 1) Direct keyword score.
    $best = null;
    $bestScore = 0;
    foreach ($map as $scope => $keywords) {
        $score = plinio_contains_any($text, $keywords);
        if ($score > $bestScore) {
            $best = $scope;
            $bestScore = $score;
        }
    }

    if ($bestScore > 0) {
        return $best;
    }

    // 2) Lightweight semantic score on normalized tokens (handles colloquial/partial phrases).
    $semantic = plinio_semantic_scope_scores($text);
    if ($semantic !== []) {
        $bestScope = (string) array_key_first($semantic);
        $bestSemantic = (int) ($semantic[$bestScope] ?? 0);
        if ($bestSemantic >= 2) {
            return $bestScope;
        }
    }

    return null;
}

function plinio_stopwords_it(): array
{
    static $words = null;
    if (is_array($words)) {
        return $words;
    }

    $words = [
        'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno',
        'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
        'e', 'o', 'ma', 'che', 'se', 'mi', 'ti', 'ci', 'vi',
        'sono', 'sei', 'si', 'sì', 'ok', 'ciao', 'salve', 'buongiorno',
        'vorrei', 'sapere', 'info', 'informazioni', 'aiuto', 'aiutami',
        'posso', 'potete', 'fare', 'fate', 'avete', 'dove', 'quando',
        'quale', 'quali', 'come', 'altro', 'adesso', 'ora', 'quindi',
    ];
    return $words;
}

function plinio_tokenize_semantic(string $text): array
{
    $norm = plinio_normalize($text);
    if ($norm === '') {
        return [];
    }

    $clean = preg_replace('/[^a-z0-9\s]/', ' ', $norm) ?? $norm;
    $parts = preg_split('/\s+/', trim($clean)) ?: [];
    $stop = array_flip(plinio_stopwords_it());
    $tokens = [];
    foreach ($parts as $part) {
        $t = trim((string) $part);
        if ($t === '' || isset($stop[$t])) {
            continue;
        }
        if (strlen($t) < 3) {
            continue;
        }
        $tokens[] = $t;
    }
    return array_values(array_unique($tokens));
}

function plinio_semantic_scope_scores(string $text): array
{
    $tokens = plinio_tokenize_semantic($text);
    if ($tokens === []) {
        return [];
    }

    $map = plinio_scope_keyword_map();
    $scores = [];
    foreach ($map as $scope => $keywords) {
        $score = 0;
        foreach ($keywords as $keyword) {
            $kwTokens = plinio_tokenize_semantic((string) $keyword);
            if ($kwTokens === []) {
                continue;
            }
            foreach ($tokens as $t) {
                foreach ($kwTokens as $k) {
                    if ($t === $k) {
                        $score += 2;
                        continue;
                    }
                    if (strlen($t) >= 4 && strlen($k) >= 4 && (str_starts_with($t, $k) || str_starts_with($k, $t))) {
                        $score += 1;
                    }
                }
            }
        }
        if ($score > 0) {
            $scores[$scope] = $score;
        }
    }

    arsort($scores, SORT_NUMERIC);
    return $scores;
}

function plinio_is_ambiguous_short_request(string $text): bool
{
    $norm = plinio_normalize($text);
    if ($norm === '') {
        return false;
    }

    if (plinio_is_topic_switch_request($text)) {
        return false;
    }

    $tokens = plinio_query_tokens($text);
    if (count($tokens) > 4) {
        return false;
    }

    if (plinio_detect_service_scope($norm) !== null) {
        return false;
    }

    return true;
}

function plinio_scope_keyword_map(): array
{
    static $cache = null;
    if (is_array($cache)) {
        return $cache;
    }

    $map = [];
    $master = plinio_master_knowledge_json();
    $services = is_array($master['services'] ?? null) ? $master['services'] : [];
    foreach ($services as $service) {
        if (!is_array($service)) {
            continue;
        }
        $scope = trim((string) ($service['scope'] ?? ''));
        if ($scope === '') {
            continue;
        }

        $keywords = [];
        foreach (plinio_normalize_string_list($service['keywords'] ?? []) as $keyword) {
            $keywords[] = $keyword;
        }
        foreach (plinio_normalize_string_list($service['operators'] ?? []) as $operator) {
            $keywords[] = $operator;
        }

        $name = plinio_normalize((string) ($service['name'] ?? ''));
        $slug = plinio_normalize((string) ($service['slug'] ?? ''));
        if ($name !== '') {
            $keywords[] = $name;
        }
        if ($slug !== '') {
            $keywords[] = str_replace('-', ' ', $slug);
            $keywords[] = $slug;
        }

        $merged = array_values(array_unique(array_filter(array_map(static fn(string $v): string => trim($v), $keywords))));
        if ($merged !== []) {
            $map[$scope] = isset($map[$scope]) ? array_values(array_unique(array_merge($map[$scope], $merged))) : $merged;
        }
    }

    $fallback = [
        'telefonia' => ['telefonia', 'windtre', 'fastweb', 'iliad', 'sim', 'fibra', 'gestori', 'operatori', 'portabilita'],
        'energia' => ['luce', 'gas', 'energia', 'utenze', 'bolletta'],
        'pagamenti' => ['pagopa', 'f24', 'mav', 'rav', 'bollettino', 'bonifico', 'bollo auto', 'ricarica'],
        'spid' => ['spid', 'identita digitale'],
        'pec' => ['pec', 'posta certificata'],
        'firma-digitale' => ['firma digitale', 'firma elettronica'],
        'spedizioni' => ['spedizione', 'spedizioni', 'corriere', 'pacco', 'tracking', 'internazionale', 'nazionale'],
        'digitali' => ['servizi digitali', 'pubblica amministrazione'],
        'contatti' => ['dove', 'sede', 'indirizzo', 'contatti', 'telefono', 'email', 'orari'],
    ];
    foreach ($fallback as $scope => $keywords) {
        $map[$scope] = isset($map[$scope])
            ? array_values(array_unique(array_merge($map[$scope], $keywords)))
            : $keywords;
    }

    $cache = $map;
    return $cache;
}

function plinio_detect_intents_from_knowledge(string $text, ?string $scope = null): array
{
    $normalized = plinio_normalize($text);
    if ($normalized === '') {
        return [];
    }

    $master = plinio_master_knowledge_json();
    $intents = is_array($master['intents'] ?? null) ? $master['intents'] : [];
    $matches = [];

    foreach ($intents as $item) {
        if (!is_array($item)) {
            continue;
        }

        $intent = trim((string) ($item['intent'] ?? ''));
        $intentScope = trim((string) ($item['scope'] ?? ''));
        $triggers = plinio_normalize_string_list($item['triggers'] ?? []);
        if ($intent === '' || $triggers === []) {
            continue;
        }

        if ($scope !== null && $intentScope !== '' && $intentScope !== $scope) {
            continue;
        }

        $score = plinio_contains_any($normalized, $triggers);
        if ($score <= 0) {
            continue;
        }

        $matches[] = [
            'intent' => $intent,
            'scope' => $intentScope,
            'score' => $score,
        ];
    }

    usort($matches, static fn(array $a, array $b): int => ($b['score'] <=> $a['score']));
    return $matches;
}

function plinio_scope_sticky_followup_reply(string $scope): string
{
    return match ($scope) {
        'telefonia' => "Restiamo sulla telefonia. Posso aiutarti su confronto tra WindTre/Fastweb/Iliad, copertura, portabilita e documenti necessari. Dimmi se ti interessa mobile o internet casa.",
        'energia' => "Restiamo su luce e gas. Posso aiutarti su nuova attivazione, cambio fornitore e documenti necessari (POD/PDR e bolletta). Dimmi se parliamo di luce, gas o entrambe.",
        'pagamenti' => "Restiamo sui pagamenti. Posso guidarti su pagoPA, F24, bollettini, MAV/RAV e bollo auto. Dimmi quale pratica devi completare.",
        'spid' => "Restiamo sullo SPID. Posso guidarti sui documenti necessari e sui prossimi passi per l'attivazione.",
        'pec' => "Restiamo sulla PEC. Posso indicarti subito documenti necessari e differenza tra PEC personale e aziendale.",
        'firma-digitale' => "Restiamo sulla firma digitale. Posso spiegarti documenti necessari e come avviare la richiesta.",
        'spedizioni' => "Restiamo sulle spedizioni. Posso aiutarti su spedizione nazionale/internazionale e tracking.",
        default => "Restiamo su questo servizio. Dimmi il dettaglio che vuoi chiarire e ti rispondo in modo mirato.",
    };
}

function plinio_is_short_followup_message(string $text): bool
{
    $normalized = plinio_normalize($text);
    if ($normalized === '') {
        return false;
    }

    if (in_array($normalized, ['si', 'sì', 'ok', 'va bene', 'procedi', 'continua', 'e poi', 'come'], true)) {
        return true;
    }

    if (plinio_contains_any($normalized, ['cosa occorre', 'che occorre', 'cosa serve', 'documenti']) > 0) {
        return true;
    }

    return count(plinio_query_tokens($text)) <= 3;
}

function plinio_scope_capabilities_reply(string $scope): ?string
{
    return match ($scope) {
        'pagamenti' => "Sui pagamenti posso aiutarti con PagoPA, F24, bollettini, MAV/RAV, bonifici e bollo auto. Dimmi quale pratica devi fare e ti dico subito cosa portare.",
        'telefonia' => "Sulla telefonia posso aiutarti a confrontare WindTre, Fastweb e Iliad, valutare portabilita e scegliere tra mobile o internet casa.",
        'energia' => "Su luce e gas posso guidarti su cambio fornitore, verifica documenti (POD/PDR) e stima indicativa della bolletta.",
        'spedizioni' => "Sulle spedizioni posso aiutarti con preventivo indicativo nazionale/internazionale, tracking e documenti utili per spedire.",
        'spid' => "Per SPID posso spiegarti requisiti, documenti necessari, livello di accesso e costi indicativi.",
        'pec' => "Per PEC posso indicarti documenti richiesti, differenze tra piano annuale e triennale e prossimi passi.",
        'firma-digitale' => "Per firma digitale posso indicarti documenti, requisiti tecnici e passaggi per attivazione.",
        default => null,
    };
}

function plinio_scope_guided_followup_reply(string $scope, string $lastUserRaw = '', string $lastAssistantRaw = ''): ?string
{
    $lastUser = plinio_normalize($lastUserRaw);
    $lastAssistant = plinio_normalize($lastAssistantRaw);
    $docsReply = plinio_docs_followup_reply($scope);
    $isYes = in_array($lastUser, ['si', 'sì', 'ok', 'va bene', 'procedi'], true);
    $isNo = in_array($lastUser, ['no', 'nono', 'no grazie'], true);
    $isPresenceReply = in_array($lastUser, ['si', 'sì', 'ok', 'va bene', 'procedi', 'certo', 'ci sono', 'sono qui', 'eccomi', 'presente'], true);
    $assistantWasIdleNudge = in_array($lastAssistant, [plinio_normalize('Ci sei ancora?'), plinio_normalize('Sei ancora qui?')], true);

    if ($assistantWasIdleNudge && $isPresenceReply) {
        return "Perfetto, eccomi. Dimmi pure quale servizio ti serve e ti guido subito (es. telefonia, SPID, PEC, pagamenti, spedizioni).";
    }

    if (
        $scope === 'spedizioni'
        && plinio_contains_any($lastAssistant, ['codice tracking', 'corriere e il codice', 'inviami anche il codice tracking']) > 0
    ) {
        return "Perfetto. Per procedere con il tracking scrivimi corriere + codice (esempio: Traccia BRT 123456789).";
    }

    if ($scope === 'telefonia') {
        $mobileIntent = plinio_contains_any($lastUser, ['mobile', 'sim', 'solo mobile']) > 0;
        $homeIntent = plinio_contains_any($lastUser, ['casa', 'internet casa', 'fibra', 'fisso', 'solo casa']) > 0;
        $assistantAskedPortability = plinio_contains_any($lastAssistant, ['vuoi mantenere il tuo numero attuale']) > 0;
        $assistantAskedHomeMigration = plinio_contains_any($lastAssistant, ['hai gia una linea attiva da migrare']) > 0;

        if ($assistantAskedPortability && $isYes) {
            return "Perfetto, procediamo con portabilita mobile. Per avviare la pratica in genere servono: documento, codice fiscale, numero da migrare e ICCID della SIM attuale. Se vuoi, nel prossimo passo ti preparo una checklist rapida per confronto WindTre/Fastweb/Iliad in base al tuo uso (giga/minuti) e budget.";
        }

        if ($assistantAskedPortability && $isNo) {
            return "Perfetto, allora valutiamo una nuova numerazione mobile. Per procedere in genere servono documento e codice fiscale. Se vuoi, ti aiuto a scegliere tra WindTre, Fastweb e Iliad partendo da giga/minuti e budget mensile.";
        }

        if ($assistantAskedHomeMigration && $isYes) {
            return "Perfetto, procediamo con migrazione internet casa. In genere servono documento, codice fiscale, codice migrazione della linea attuale e indirizzo di attivazione. Se vuoi, ti aiuto a confrontare WindTre/Fastweb/Iliad su copertura e velocita disponibile nel tuo indirizzo.";
        }

        if ($assistantAskedHomeMigration && $isNo) {
            return "Perfetto, allora valutiamo una nuova attivazione internet casa. In genere servono documento, codice fiscale e indirizzo completo di attivazione. Se vuoi, partiamo da copertura e budget per confrontare WindTre, Fastweb e Iliad.";
        }

        if ($mobileIntent) {
            return "Perfetto, andiamo sul mobile. Possiamo confrontare WindTre, Fastweb e Iliad su copertura nella tua zona, giga/minuti che usi e budget mensile. Per procedere in genere servono documento, codice fiscale e numero da migrare (se vuoi portabilita). Vuoi mantenere il tuo numero attuale?";
        }

        if ($homeIntent) {
            return "Perfetto, parliamo di internet casa. Possiamo confrontare WindTre, Fastweb e Iliad su copertura fibra/FWA, velocita disponibile e budget. In genere servono documento, codice fiscale e indirizzo di attivazione. Hai gia una linea attiva da migrare?";
        }
    }

    if ($scope === 'spid' && plinio_contains_any($lastUser, ['livello 2', 'livello due', 'livello']) > 0) {
        return "Di norma lo SPID usato per i servizi online e di livello 2 (password + codice temporaneo OTP). In alcuni casi specifici puo essere richiesto il livello 3.";
    }

    if (plinio_contains_any($lastUser, ['cosa occorre', 'che occorre', 'cosa serve', 'document']) > 0 && $docsReply !== null) {
        return $docsReply;
    }

    return match ($scope) {
        'spid', 'pec', 'firma-digitale' => $docsReply,
        'telefonia' => "Perfetto, restiamo sulla telefonia. Dimmi se ti interessa mobile o internet casa; in genere servono documento, codice fiscale e numero da migrare (se presente).",
        'energia' => "Perfetto, restiamo su luce e gas. Dimmi se parliamo di luce, gas o entrambe; in genere servono documento, codice fiscale, POD/PDR e ultima bolletta.",
        'pagamenti' => "Perfetto, restiamo sui pagamenti. Dimmi quale pratica devi fare (PagoPA, F24, bollettino, MAV/RAV); in genere serve l'avviso/modello da pagare.",
        'spedizioni' => "Perfetto, restiamo sulle spedizioni. Dimmi se nazionale o internazionale; in genere servono dati mittente/destinatario, peso e contenuto dichiarato.",
        'digitali' => "Perfetto, restiamo sui servizi digitali. Dimmi quale pratica vuoi avviare e ti indico subito i documenti utili.",
        default => plinio_scope_sticky_followup_reply($scope),
    };
}

function plinio_is_generic_non_answer(string $reply): bool
{
    $normalized = plinio_normalize($reply);
    if ($normalized === '') {
        return true;
    }

    return plinio_contains_any($normalized, [
        'posso aiutarti su pagamenti',
        'dimmi pure il servizio che ti interessa',
        'scrivimi pure il servizio',
        'il mio compito e fornire assistenza',
    ]) > 0;
}

function plinio_docs_followup_reply(string $scope): ?string
{
    $docs = plinio_documents_for_scope($scope);
    if ($docs === []) {
        return null;
    }

    return "Per " . plinio_service_label($scope) . " in genere servono " . implode(', ', $docs) . ".";
}

function plinio_is_reply_off_topic(string $reply, string $expectedScope): bool
{
    $map = plinio_scope_keyword_map();
    $replyNorm = plinio_normalize($reply);
    if ($replyNorm === '' || !isset($map[$expectedScope])) {
        return false;
    }

    $expectedScore = plinio_contains_any($replyNorm, $map[$expectedScope]);
    $bestOtherScore = 0;
    foreach ($map as $scope => $keywords) {
        if ($scope === $expectedScope) {
            continue;
        }
        $score = plinio_contains_any($replyNorm, $keywords);
        if ($score > $bestOtherScore) {
            $bestOtherScore = $score;
        }
    }

    return $expectedScore === 0 && $bestOtherScore >= 2;
}

function plinio_detect_conversation_focus(array $messages): ?string
{
    $userMessages = [];
    foreach ($messages as $item) {
        if (($item['role'] ?? '') === 'user') {
            $userMessages[] = trim((string) ($item['content'] ?? ''));
        }
    }

    if ($userMessages === []) {
        return null;
    }

    $lastMessage = (string) end($userMessages);
    $lastScope = plinio_detect_service_scope(plinio_normalize($lastMessage));
    if ($lastScope !== null) {
        return $lastScope;
    }

    if (plinio_is_topic_switch_request($lastMessage)) {
        return null;
    }

    $scores = [];
    $window = array_slice($userMessages, -8);
    $total = count($window);
    foreach ($window as $idx => $msg) {
        $scope = plinio_detect_service_scope(plinio_normalize($msg));
        if ($scope === null) {
            continue;
        }
        $weight = $idx + 1;
        if ($idx === $total - 1) {
            $weight += 2;
        }
        $scores[$scope] = ($scores[$scope] ?? 0) + $weight;
    }

    if ($scores === []) {
        return null;
    }

    arsort($scores, SORT_NUMERIC);
    $bestScope = (string) array_key_first($scores);
    $bestScore = (int) ($scores[$bestScope] ?? 0);
    return $bestScore >= 1 ? $bestScope : null;
}

function plinio_extract_email(string $text): string
{
    if (preg_match('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', $text, $matches)) {
        return strtolower(trim((string) ($matches[0] ?? '')));
    }
    return '';
}

function plinio_extract_phone(string $text): string
{
    if (preg_match('/(?:\+39)?\s*([0-9][0-9\s\-]{7,15}[0-9])/', $text, $matches)) {
        $raw = (string) ($matches[0] ?? '');
        $digits = preg_replace('/[^0-9+]/', '', $raw) ?: '';
        return $digits;
    }
    return '';
}

function plinio_extract_name(string $text): string
{
    if (preg_match('/\bmi chiamo\s+([a-zA-Zàèéìòù\'\-\s]{2,60})/u', $text, $matches)) {
        return trim((string) ($matches[1] ?? ''));
    }
    if (preg_match('/\bsono\s+([a-zA-Zàèéìòù\'\-\s]{2,60})/u', $text, $matches)) {
        return trim((string) ($matches[1] ?? ''));
    }
    return '';
}

function plinio_extract_contact_name_candidate(string $text): string
{
    $clean = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', ' ', $text) ?? $text;
    $clean = preg_replace('/(?:\+?\d[\d\s\-]{6,}\d)/u', ' ', $clean) ?? $clean;
    $clean = preg_replace('/[^a-zA-ZàèéìòùÀÈÉÌÒÙ\'\-\s]/u', ' ', $clean) ?? $clean;
    $clean = trim((string) preg_replace('/\s+/u', ' ', $clean));
    if ($clean === '') {
        return '';
    }

    $parts = array_values(array_filter(explode(' ', $clean), static fn($p): bool => trim((string) $p) !== ''));
    if (count($parts) < 2) {
        return '';
    }

    $stop = ['si', 'sì', 'ok', 'va', 'bene', 'procedi', 'telefono', 'email', 'servizio', 'richiamami', 'richiamatemi'];
    $first = plinio_normalize((string) ($parts[0] ?? ''));
    $second = plinio_normalize((string) ($parts[1] ?? ''));
    if (in_array($first, $stop, true) || in_array($second, $stop, true)) {
        return '';
    }

    $fullName = trim($parts[0] . ' ' . $parts[1]);
    return $fullName;
}

function plinio_detect_carrier(string $text): ?string
{
    $normalized = plinio_normalize($text);
    $map = [
        'poste' => ['poste', 'poste italiane'],
        'brt' => ['brt', 'bartolini'],
        'sda' => ['sda'],
        'fedex' => ['fedex', 'tnt', 'tnt fedex', 'tnt/fedex'],
    ];

    foreach ($map as $carrier => $keywords) {
        if (plinio_contains_any($normalized, $keywords) > 0) {
            return $carrier;
        }
    }
    return null;
}

function plinio_extract_tracking_code(string $text): string
{
    if (preg_match('/\b([A-Z0-9][A-Z0-9\-]{7,34})\b/i', $text, $matches)) {
        return strtoupper(trim((string) ($matches[1] ?? '')));
    }
    return '';
}

function plinio_tracking_link(string $carrier, string $code): string
{
    $encoded = rawurlencode($code);
    return match ($carrier) {
        'poste' => "https://www.poste.it/cerca/index.html#/risultati-spedizioni/$encoded",
        'brt' => "https://www.brt.it/it/mybrt/tracking?referenceNumber=$encoded",
        'sda' => "https://www.sda.it/wps/portal/Servizi_online/ricerca_spedizioni",
        'fedex' => "https://www.fedex.com/fedextrack/?trknbr=$encoded",
        default => '',
    };
}

function plinio_carrier_label(string $carrier): string
{
    return match ($carrier) {
        'poste' => 'Poste Italiane',
        'brt' => 'BRT',
        'sda' => 'SDA',
        'fedex' => 'TNT/FedEx',
        default => 'corriere',
    };
}

function plinio_tracking_live_status(string $carrier, string $code): ?array
{
    if ($carrier === 'brt') {
        if (!function_exists('client_area_get_missing_brt_config') || !function_exists('client_area_brt_track_parcel')) {
            return null;
        }

        $missing = client_area_get_missing_brt_config();
        if ($missing !== []) {
            return null;
        }

        try {
            $result = client_area_brt_track_parcel($code);
            $events = is_array($result['events'] ?? null) ? $result['events'] : [];
            $lastEvent = $events[0] ?? [];
            return [
                'status' => trim((string) ($result['status'] ?? '')),
                'statusDescription' => trim((string) ($result['statusDescription'] ?? '')),
                'lastEvent' => trim((string) ($lastEvent['description'] ?? '')),
            ];
        } catch (Throwable) {
            return null;
        }
    }

    $proxyUrl = trim((string) (public_api_env('TRACKING_WEBSERVICE_URL', '') ?: ''));
    if ($proxyUrl === '') {
        return null;
    }

    $headers = ['Content-Type: application/json'];
    $token = trim((string) (public_api_env('TRACKING_WEBSERVICE_TOKEN', '') ?: ''));
    if ($token !== '') {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    try {
        $response = public_api_http_request(
            'POST',
            $proxyUrl,
            $headers,
            json_encode([
                'carrier' => $carrier,
                'trackingCode' => $code,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        $statusCode = (int) ($response['status'] ?? 0);
        $json = is_array($response['json'] ?? null) ? $response['json'] : [];
        if ($statusCode < 200 || $statusCode >= 300 || !is_array($json)) {
            return null;
        }

        return [
            'status' => trim((string) ($json['status'] ?? '')),
            'statusDescription' => trim((string) ($json['statusDescription'] ?? $json['description'] ?? '')),
            'lastEvent' => trim((string) ($json['lastEvent'] ?? '')),
        ];
    } catch (Throwable) {
        return null;
    }
}

function plinio_service_label(?string $scope): string
{
    $scopeName = plinio_service_name_by_scope($scope);
    if ($scopeName !== null) {
        return $scopeName;
    }

    return match ($scope) {
        'telefonia' => 'telefonia',
        'energia' => 'luce e gas',
        'pagamenti' => 'pagamenti',
        'spid' => 'SPID',
        'pec' => 'PEC',
        'firma-digitale' => 'firma digitale',
        'spedizioni' => 'spedizioni',
        default => 'servizi multiservizi',
    };
}

function plinio_scope_help_message(): string
{
    return "Ti aiuto volentieri. Posso supportarti su pagamenti, SPID, PEC, firma digitale, telefonia, luce/gas, spedizioni, orari, sede e contatti. Scrivi ad esempio: \"Come faccio lo SPID?\".";
}

function plinio_pagamenti_customer_overview_reply(): string
{
    return "Certo. Possiamo aiutarti con i principali pagamenti: bollettini postali (bianchi e premarcati), pagoPA, deleghe F24, MAV/RAV, bollettini bancari con prenotazione e bollo auto. Possiamo supportarti anche su ricariche telefoniche e servizi digitali. Se vuoi, dimmi quale pagamento devi fare e ti indico subito cosa portare.";
}

function plinio_ricariche_customer_overview_reply(): string
{
    return "Certo. In agenzia possiamo supportarti su ricariche telefoniche dei principali operatori (TIM, Vodafone, WindTre, Iliad, Fastweb e ho.), ricariche per contenuti digitali e gift card, Pay TV/streaming (es. DAZN, Netflix, SKY), console gaming e conti gioco. Dimmi quale ricarica ti serve e ti confermo subito cosa possiamo gestire operativamente.";
}

function plinio_biglietteria_customer_overview_reply(): string
{
    return "Certo. In agenzia possiamo supportarti anche sulla rivendita biglietti: titoli di viaggio e abbonamenti (treno, bus, metro), soluzioni per sosta/parcheggio e biglietti per parchi divertimento e musei. Dimmi che tipo di biglietto ti serve e ti confermo subito la disponibilita operativa.";
}

function plinio_bollettini_beneficiari_paths(): array
{
    $base = __DIR__ . '/knowledge';
    return [
        'list' => $base . '/bollettini-beneficiari.txt',
        'meta' => $base . '/bollettini-beneficiari.meta.json',
    ];
}

function plinio_should_refresh_bollettini_beneficiari(): bool
{
    $paths = plinio_bollettini_beneficiari_paths();
    $metaPath = (string) ($paths['meta'] ?? '');
    if ($metaPath === '' || !is_file($metaPath) || !is_readable($metaPath)) {
        return true;
    }

    $raw = (string) file_get_contents($metaPath);
    $json = json_decode($raw, true);
    $fetchedAt = is_array($json) ? (int) ($json['fetched_at'] ?? 0) : 0;
    if ($fetchedAt <= 0) {
        return true;
    }

    return (time() - $fetchedAt) >= PLINIO_BOLLETTINI_BENEFICIARI_REFRESH_TTL_SECONDS;
}

function plinio_write_bollettini_beneficiari_meta(int $lineCount): void
{
    $paths = plinio_bollettini_beneficiari_paths();
    $metaPath = (string) ($paths['meta'] ?? '');
    if ($metaPath === '') {
        return;
    }

    $payload = [
        'source_url' => PLINIO_BOLLETTINI_BENEFICIARI_PDF_URL,
        'fetched_at' => time(),
        'line_count' => max(0, $lineCount),
    ];
    @file_put_contents(
        $metaPath,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
    );
}

function plinio_download_file(string $url): ?string
{
    $ch = curl_init($url);
    if ($ch === false) {
        return null;
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_USERAGENT, 'PlinioAssistant/1.0');
    $body = curl_exec($ch);
    $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!is_string($body) || $body === '' || $statusCode < 200 || $statusCode >= 300) {
        return null;
    }

    return $body;
}

function plinio_extract_lines_from_bollettini_pdf(string $pdfBinary): array
{
    if ($pdfBinary === '' || !function_exists('shell_exec')) {
        return [];
    }

    $tmpPdf = tempnam(sys_get_temp_dir(), 'plinio-bollettini-');
    if (!is_string($tmpPdf) || $tmpPdf === '') {
        return [];
    }
    $tmpTxt = $tmpPdf . '.txt';
    @file_put_contents($tmpPdf, $pdfBinary);

    $cmd = 'pdftotext -layout ' . escapeshellarg($tmpPdf) . ' ' . escapeshellarg($tmpTxt) . ' 2>/dev/null';
    @shell_exec($cmd);

    if (!is_file($tmpTxt) || !is_readable($tmpTxt)) {
        @unlink($tmpPdf);
        @unlink($tmpTxt);
        return [];
    }

    $text = (string) file_get_contents($tmpTxt);
    @unlink($tmpPdf);
    @unlink($tmpTxt);
    if ($text === '') {
        return [];
    }

    $lines = preg_split('/\R/u', $text) ?: [];
    $out = [];
    $skipPatterns = [
        'a-tono payment institute',
        'con socio unico',
        'sede legale',
        'capitale sociale',
        'iscrizione albo',
        'tel:',
        'fax:',
        'sito:',
        'email:',
        'pec:',
        'servizio pagamento bollettini',
        'le informazioni relative',
        'hanno efficacia',
        'in tutte le altre',
        'l’elenco completo',
        "l'elenco completo",
        'per le caratteristiche',
        'i fogli informativi',
        'le condizioni generali',
        'drop-pay.com',
        'pagabili pro-solvendo',
    ];

    foreach ($lines as $line) {
        $value = rtrim((string) $line);
        if ($value === '') {
            continue;
        }

        // PDF is often two-column: split logical candidates by wide spacing.
        $parts = preg_split('/\s{3,}/u', $value) ?: [];
        foreach ($parts as $part) {
            $candidate = trim((string) $part);
            if (mb_strlen($candidate) < 4) {
                continue;
            }
            if (preg_match('/^\d+$/', $candidate) === 1) {
                continue;
            }

            $norm = plinio_normalize($candidate);
            $skip = false;
            foreach ($skipPatterns as $pattern) {
                if (str_contains($norm, $pattern)) {
                    $skip = true;
                    break;
                }
            }
            if ($skip) {
                continue;
            }

            $out[] = $candidate;
        }
    }

    return array_values(array_unique($out));
}

function plinio_refresh_bollettini_beneficiari_cache_if_needed(): void
{
    if (!plinio_should_refresh_bollettini_beneficiari()) {
        return;
    }

    $pdfBody = plinio_download_file(PLINIO_BOLLETTINI_BENEFICIARI_PDF_URL);
    if (!is_string($pdfBody) || $pdfBody === '') {
        return;
    }

    $lines = plinio_extract_lines_from_bollettini_pdf($pdfBody);
    if (count($lines) < 200) {
        return;
    }

    $paths = plinio_bollettini_beneficiari_paths();
    $listPath = (string) ($paths['list'] ?? '');
    if ($listPath === '') {
        return;
    }

    $payload = implode(PHP_EOL, $lines) . PHP_EOL;
    if (@file_put_contents($listPath, $payload) === false) {
        return;
    }

    plinio_write_bollettini_beneficiari_meta(count($lines));
}

function plinio_bollettini_beneficiari_list(): array
{
    static $cache = null;
    if (is_array($cache)) {
        return $cache;
    }

    plinio_refresh_bollettini_beneficiari_cache_if_needed();
    $paths = plinio_bollettini_beneficiari_paths();
    $path = (string) ($paths['list'] ?? '');
    if (!is_file($path) || !is_readable($path)) {
        $cache = [];
        return $cache;
    }

    $rows = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($rows)) {
        $cache = [];
        return $cache;
    }

    $list = [];
    foreach ($rows as $row) {
        $label = trim((string) $row);
        if ($label === '') {
            continue;
        }
        $normalized = plinio_normalize($label);
        if ($normalized === '' || str_starts_with($normalized, 'pagabili pro-solvendo')) {
            continue;
        }
        $list[] = ['label' => $label, 'norm' => $normalized];
    }

    $cache = $list;
    return $cache;
}

function plinio_extract_beneficiary_query(string $rawText): string
{
    $text = trim($rawText);
    if ($text === '') {
        return '';
    }

    if (preg_match('/["“](.{3,120})["”]/u', $text, $m) === 1) {
        return trim((string) $m[1]);
    }

    $work = mb_strtolower($text);
    $work = preg_replace('/[^\p{L}\p{N}\s\-\&\.\']+/u', ' ', $work) ?? $work;
    $work = preg_replace(
        '/\b(vorrei|sapere|ricerca|cercare|beneficiario|beneficiari|bollettino|bollettini|pagare|pagabile|pagato|agenzia|in|di|del|della|dei|che|se|si|puo|può|potra|potrà|questo|questa|questi|queste)\b/u',
        ' ',
        $work
    ) ?? $work;
    $work = preg_replace('/\s+/', ' ', $work) ?? $work;
    $work = trim($work);

    return mb_strlen($work) >= 3 ? $work : '';
}

function plinio_match_bollettini_beneficiary(string $query): ?string
{
    $candidate = plinio_normalize($query);
    if ($candidate === '') {
        return null;
    }

    $list = plinio_bollettini_beneficiari_list();
    if ($list === []) {
        return null;
    }

    foreach ($list as $row) {
        $line = (string) ($row['norm'] ?? '');
        if ($line !== '' && str_contains($line, $candidate)) {
            return (string) ($row['label'] ?? '');
        }
    }

    $genericTokens = [
        'energia', 'energetica', 'energetici', 'gas', 'luce', 'power',
        'spa', 'srl', 'srls', 'sas', 'snc', 'scarl', 'societa',
        'servizi', 'service', 'group', 'holding', 'italia',
        'comune', 'concessionario',
    ];
    $tokens = array_values(array_filter(
        explode(' ', $candidate),
        static fn(string $token): bool => mb_strlen($token) >= 3 && !in_array($token, $genericTokens, true)
    ));
    if ($tokens === []) {
        return null;
    }

    $tokenMatchesLine = static function (string $line, string $token): bool {
        if ($line === '' || $token === '') {
            return false;
        }
        if (preg_match('/\d/u', $token) === 1) {
            return str_contains($line, $token);
        }
        if (mb_strlen($token) <= 3) {
            return preg_match('/\b' . preg_quote($token, '/') . '\b/u', $line) === 1;
        }
        return str_contains($line, $token);
    };

    $bestLabel = null;
    $bestScore = 0;
    foreach ($list as $row) {
        $line = (string) ($row['norm'] ?? '');
        if ($line === '') {
            continue;
        }
        $score = 0;
        foreach ($tokens as $token) {
            if ($tokenMatchesLine($line, $token)) {
                $score++;
            }
        }
        if ($score > $bestScore) {
            $bestScore = $score;
            $bestLabel = (string) ($row['label'] ?? '');
        }
    }

    $tokenCount = count($tokens);
    $threshold = $tokenCount <= 1 ? 1 : max(2, (int) ceil($tokenCount * 0.6));
    return $bestScore >= $threshold ? $bestLabel : null;
}

function plinio_beneficiary_label_for_reply(string $query, string $rawMatch): string
{
    $query = trim($query);
    $match = trim((string) preg_replace('/\s+/u', ' ', $rawMatch));
    if ($match === '') {
        return $query !== '' ? $query : 'beneficiario richiesto';
    }

    $queryNorm = plinio_normalize($query);
    $matchNorm = plinio_normalize($match);

    if ($queryNorm !== '' && str_contains($matchNorm, $queryNorm)) {
        return $query;
    }
    if (mb_strlen($match) > 70) {
        return $query !== '' ? $query : $match;
    }

    return $match;
}

function plinio_known_service_price_reply(?string $scope = null): ?string
{
    $prices = [
        'spid' => 'SPID: 22 EUR',
        'firma-digitale' => 'Firma digitale: 55 EUR',
        'pec' => 'PEC: 15 EUR annuale oppure 30 EUR triennale',
    ];

    if ($scope !== null && isset($prices[$scope])) {
        return "Prezzo del servizio " . plinio_service_label($scope) . ": " . $prices[$scope] . ".";
    }

    return "Prezzi disponibili: SPID 22 EUR, firma digitale 55 EUR, PEC 15 EUR annuale oppure 30 EUR triennale.";
}

function plinio_service_name_by_scope(?string $scope): ?string
{
    if ($scope === null || trim($scope) === '') {
        return null;
    }

    $master = plinio_master_knowledge_json();
    $services = is_array($master['services'] ?? null) ? $master['services'] : [];
    foreach ($services as $service) {
        if (!is_array($service)) {
            continue;
        }
        if (trim((string) ($service['scope'] ?? '')) === $scope) {
            $name = trim((string) ($service['name'] ?? ''));
            return $name !== '' ? $name : null;
        }
    }

    return null;
}

function plinio_knowledge_load_json(string $fileName): array
{
    static $cache = [];
    if (array_key_exists($fileName, $cache)) {
        return is_array($cache[$fileName]) ? $cache[$fileName] : [];
    }

    $path = __DIR__ . '/knowledge/' . ltrim($fileName, '/');
    if (!is_file($path) || !is_readable($path)) {
        $cache[$fileName] = [];
        return [];
    }

    $raw = (string) file_get_contents($path);
    if (trim($raw) === '') {
        $cache[$fileName] = [];
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        $cache[$fileName] = [];
        return [];
    }

    $cache[$fileName] = $decoded;
    return $decoded;
}

function plinio_normalize_string_list(mixed $value): array
{
    if (!is_array($value)) {
        return [];
    }

    $normalized = [];
    foreach ($value as $item) {
        if (!is_scalar($item)) {
            continue;
        }
        $text = trim((string) $item);
        if ($text !== '') {
            $normalized[] = $text;
        }
    }
    return array_values(array_unique($normalized));
}

function plinio_default_master_knowledge_json(): array
{
    return [
        'business' => [
            'name' => PLINIO_BUSINESS_NAME,
            'website' => PLINIO_WEBSITE,
            'address' => PLINIO_ADDRESS,
            'category' => PLINIO_BUSINESS_CATEGORY,
            'active_from' => PLINIO_ACTIVE_FROM,
        ],
        'services' => [
            [
                'slug' => 'spid',
                'name' => 'SPID',
                'scope' => 'spid',
                'keywords' => ['spid', 'identita digitale', 'identità digitale'],
                'description' => 'Assistenza per attivazione SPID',
                'documents' => ['documento di identita valido e non scaduto', 'tessera sanitaria o codice fiscale', 'numero di cellulare personale', 'email personale attiva'],
            ],
            [
                'slug' => 'pec',
                'name' => 'PEC',
                'scope' => 'pec',
                'keywords' => ['pec', 'posta certificata', 'email certificata'],
                'description' => 'Attivazione PEC personale o aziendale',
                'documents' => ['documento di identita valido', 'codice fiscale', 'email e numero di cellulare attivi', 'se azienda: partita IVA e dati del legale rappresentante'],
            ],
            [
                'slug' => 'firma-digitale',
                'name' => 'Firma Digitale',
                'scope' => 'firma-digitale',
                'keywords' => ['firma digitale', 'firma elettronica', 'token'],
                'description' => 'Supporto per attivazione firma digitale',
                'documents' => ['documento di identita valido e non scaduto', 'tessera sanitaria o codice fiscale', 'email attiva', 'numero di cellulare personale', 'smartphone per codici OTP e riconoscimento'],
            ],
            [
                'slug' => 'telefonia',
                'name' => 'Telefonia',
                'scope' => 'telefonia',
                'keywords' => ['telefonia', 'windtre', 'fastweb', 'iliad', 'sim', 'fibra', 'portabilita', 'migrazione'],
                'description' => 'Supporto per attivazioni, cambio operatore e consulenza offerte',
                'documents' => ['documento di identita', 'codice fiscale', 'numero da migrare se presente'],
            ],
            [
                'slug' => 'luce-gas',
                'name' => 'Luce e Gas',
                'scope' => 'energia',
                'keywords' => ['luce', 'gas', 'energia', 'utenze', 'bolletta', 'pod', 'pdr'],
                'description' => 'Supporto informativo per attivazioni e cambio fornitore',
                'documents' => ['documento di identita', 'codice fiscale', 'POD o PDR', 'ultima bolletta se disponibile'],
            ],
            [
                'slug' => 'pagamenti',
                'name' => 'Pagamenti',
                'scope' => 'pagamenti',
                'keywords' => ['pagopa', 'f24', 'mav', 'rav', 'bollettino', 'bollettini', 'bonifico', 'bollo auto', 'ricarica'],
                'description' => 'Supporto pratico su pagamenti e pratiche affini',
                'documents' => ['avviso o modello da pagare', 'dati anagrafici corretti'],
            ],
            [
                'slug' => 'spedizioni',
                'name' => 'Spedizioni',
                'scope' => 'spedizioni',
                'keywords' => ['spedizione', 'spedizioni', 'corriere', 'pacco', 'tracking', 'traccia', 'nazionale', 'internazionale', 'brt', 'poste', 'sda', 'fedex', 'tnt'],
                'description' => 'Spedizioni nazionali e internazionali con supporto logistico di base',
                'documents' => ['dati mittente e destinatario', 'peso del collo', 'contenuto dichiarato'],
            ],
            [
                'slug' => 'contatti',
                'name' => 'Sede e contatti',
                'scope' => 'contatti',
                'keywords' => ['dove', 'sede', 'indirizzo', 'contatti', 'telefono', 'email', 'orari', 'operatore'],
                'description' => 'Informazioni su sede, orari e canali contatto',
                'documents' => ['se vuoi richiamata: nome, telefono o email'],
            ],
        ],
        'faq' => [],
        'intents' => [],
        'conversation_flows' => [],
        'rules' => [
            'never_invent_prices' => true,
            'never_guarantee_times' => true,
            'always_offer_human_contact_when_needed' => true,
        ],
    ];
}

function plinio_documents_for_scope(string $scope): array
{
    $master = plinio_master_knowledge_json();
    $services = is_array($master['services'] ?? null) ? $master['services'] : [];
    foreach ($services as $service) {
        if (!is_array($service)) {
            continue;
        }
        if (trim((string) ($service['scope'] ?? '')) === $scope) {
            return plinio_normalize_string_list($service['documents'] ?? []);
        }
    }
    return [];
}

function plinio_master_knowledge_json(): array
{
    static $cache = null;
    if (is_array($cache)) {
        return $cache;
    }

    $default = plinio_default_master_knowledge_json();

    $businessInfo = plinio_knowledge_load_json('business-info.json');
    $servicesPayload = plinio_knowledge_load_json('services.json');
    $documentsPayload = plinio_knowledge_load_json('documents.json');
    $faqPayload = plinio_knowledge_load_json('faq.json');
    $intentsPayload = plinio_knowledge_load_json('intents.json');
    $flowsPayload = plinio_knowledge_load_json('conversation-flows.json');
    $rulesPayload = plinio_knowledge_load_json('rules.json');

    $servicesInput = [];
    if (isset($servicesPayload['services']) && is_array($servicesPayload['services'])) {
        $servicesInput = $servicesPayload['services'];
    } elseif (array_is_list($servicesPayload)) {
        $servicesInput = $servicesPayload;
    }

    $documentsMap = [];
    $rawDocuments = $documentsPayload;
    if (isset($documentsPayload['documents']) && is_array($documentsPayload['documents'])) {
        $rawDocuments = $documentsPayload['documents'];
    }
    foreach ($rawDocuments as $key => $value) {
        if (!is_string($key)) {
            continue;
        }
        $documentsMap[$key] = plinio_normalize_string_list($value);
    }

    $services = [];
    foreach ($servicesInput as $service) {
        if (!is_array($service)) {
            continue;
        }
        $slug = trim((string) ($service['slug'] ?? ''));
        $scope = trim((string) ($service['scope'] ?? ''));
        if ($scope === '' && $slug !== '') {
            $scope = $slug;
        }
        if ($slug === '' || $scope === '') {
            continue;
        }

        $name = trim((string) ($service['name'] ?? ''));
        $description = trim((string) ($service['description'] ?? ''));
        $keywords = plinio_normalize_string_list($service['keywords'] ?? []);
        $operators = plinio_normalize_string_list($service['operators'] ?? []);
        $documentsRef = trim((string) ($service['documents_ref'] ?? ''));
        $documents = plinio_normalize_string_list($service['documents'] ?? []);

        if ($documents === []) {
            if ($documentsRef !== '' && isset($documentsMap[$documentsRef])) {
                $documents = $documentsMap[$documentsRef];
            } elseif (isset($documentsMap[$scope])) {
                $documents = $documentsMap[$scope];
            } elseif (isset($documentsMap[$slug])) {
                $documents = $documentsMap[$slug];
            }
        }

        $services[] = [
            'slug' => $slug,
            'name' => $name !== '' ? $name : ucfirst(str_replace('-', ' ', $slug)),
            'scope' => $scope,
            'keywords' => $keywords,
            'operators' => $operators,
            'description' => $description,
            'documents' => $documents,
            'intents' => plinio_normalize_string_list($service['intents'] ?? []),
        ];
    }

    if ($services === []) {
        $services = is_array($default['services'] ?? null) ? $default['services'] : [];
    }

    $business = is_array($default['business'] ?? null) ? $default['business'] : [];
    if (is_array($businessInfo) && $businessInfo !== []) {
        $business = array_merge($business, $businessInfo);
    }

    $faq = [];
    if (isset($faqPayload['faq']) && is_array($faqPayload['faq'])) {
        $faq = $faqPayload['faq'];
    } elseif (array_is_list($faqPayload)) {
        $faq = $faqPayload;
    }

    $intents = [];
    if (isset($intentsPayload['intents']) && is_array($intentsPayload['intents'])) {
        $intents = $intentsPayload['intents'];
    } elseif (array_is_list($intentsPayload)) {
        $intents = $intentsPayload;
    }

    $flows = [];
    if (isset($flowsPayload['flows']) && is_array($flowsPayload['flows'])) {
        $flows = $flowsPayload['flows'];
    } elseif (array_is_list($flowsPayload)) {
        $flows = $flowsPayload;
    }

    $rules = is_array($default['rules'] ?? null) ? $default['rules'] : [];
    if (is_array($rulesPayload) && $rulesPayload !== []) {
        $rules = array_merge($rules, $rulesPayload);
    }

    $cache = [
        'business' => $business,
        'services' => $services,
        'faq' => $faq,
        'intents' => $intents,
        'conversation_flows' => $flows,
        'rules' => $rules,
    ];

    return $cache;
}

function plinio_kb_documents(): array
{
    $master = plinio_master_knowledge_json();
    $services = is_array($master['services'] ?? null) ? $master['services'] : [];
    $documents = [];
    foreach ($services as $service) {
        if (!is_array($service)) {
            continue;
        }
        $documents[] = [
            'id' => (string) ($service['slug'] ?? ''),
            'scope' => (string) ($service['scope'] ?? 'digitali'),
            'title' => (string) ($service['name'] ?? 'Servizio'),
            'keywords' => is_array($service['keywords'] ?? null) ? $service['keywords'] : [],
            'answer' => (string) ($service['description'] ?? ''),
            'docs' => is_array($service['documents'] ?? null) ? implode(', ', $service['documents']) : '',
        ];
    }

    $faq = is_array($master['faq'] ?? null) ? $master['faq'] : [];
    $faqCount = 0;
    foreach ($faq as $item) {
        if (!is_array($item)) {
            continue;
        }
        $question = trim((string) ($item['question'] ?? ''));
        $answer = trim((string) ($item['answer'] ?? ''));
        if ($question === '' || $answer === '') {
            continue;
        }
        $scope = trim((string) ($item['scope'] ?? 'supporto_generico'));
        $faqCount++;
        $documents[] = [
            'id' => 'faq:' . $faqCount,
            'scope' => $scope,
            'title' => 'FAQ',
            'keywords' => array_merge([$scope], plinio_query_tokens($question)),
            'answer' => $answer,
            'docs' => '',
            'content' => $question . "\n" . $answer,
        ];
    }
    return $documents;
}

function plinio_query_tokens(string $text): array
{
    $normalized = plinio_normalize($text);
    $parts = preg_split('/[^a-z0-9]+/i', $normalized) ?: [];
    $stop = [
        'come', 'quando', 'dove', 'quale', 'quali', 'posso', 'per', 'con', 'del', 'della', 'delle', 'dei', 'gli', 'una',
        'uno', 'che', 'chi', 'sono', 'fare', 'fate', 'serve', 'servono', 'voglio', 'avere', 'questa', 'questo', 'sui', 'sul',
    ];
    $tokens = [];
    foreach ($parts as $part) {
        $token = trim((string) $part);
        if ($token === '' || strlen($token) < 3 || in_array($token, $stop, true)) {
            continue;
        }
        $tokens[$token] = true;
    }
    return array_keys($tokens);
}

function plinio_strip_html_to_text(string $html): string
{
    $content = preg_replace('/<script\b[^>]*>.*?<\/script>/is', ' ', $html) ?? $html;
    $content = preg_replace('/<style\b[^>]*>.*?<\/style>/is', ' ', $content) ?? $content;
    $content = strip_tags($content);
    $content = html_entity_decode($content, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $content = preg_replace('/\s+/u', ' ', $content) ?? $content;
    return trim($content);
}

function plinio_safe_excerpt(string $text, int $max = 560): string
{
    $trimmed = trim($text);
    if ($trimmed === '') {
        return '';
    }
    if (mb_strlen($trimmed) <= $max) {
        return $trimmed;
    }
    return rtrim(mb_substr($trimmed, 0, $max - 1)) . '...';
}

function plinio_qwen_base_url(): string
{
    return rtrim(trim((string) (public_api_env('QWEN_BASE_URL', '') ?: '')), '/');
}

function plinio_qwen_api_key(): string
{
    return trim((string) (public_api_env('QWEN_API_KEY', '') ?: ''));
}

function plinio_is_openrouter_base(string $baseUrl): bool
{
    return str_contains(strtolower($baseUrl), 'openrouter.ai');
}

function plinio_openrouter_auto_failover_enabled(): bool
{
    $raw = strtolower(trim((string) (public_api_env('QWEN_AUTO_FREE_FAILOVER', 'true') ?: 'true')));
    return !in_array($raw, ['0', 'false', 'no', 'off'], true);
}

function plinio_openrouter_failover_max_models(): int
{
    $raw = (int) (public_api_env('QWEN_FAILOVER_MAX_MODELS', '8') ?: '8');
    if ($raw < 3) {
        return 3;
    }
    if ($raw > 20) {
        return 20;
    }
    return $raw;
}

function plinio_qwen_http_headers(string $baseUrl, string $apiKey): array
{
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
    ];

    if (plinio_is_openrouter_base($baseUrl)) {
        $referer = trim((string) (public_api_env('OPENROUTER_HTTP_REFERER', public_api_env('NEXT_PUBLIC_SITE_URL', 'https://agenziaplinio.it')) ?: 'https://agenziaplinio.it'));
        $title = trim((string) (public_api_env('OPENROUTER_X_TITLE', 'Plinio Assistant') ?: 'Plinio Assistant'));
        if ($referer !== '') {
            $headers[] = 'HTTP-Referer: ' . $referer;
        }
        if ($title !== '') {
            $headers[] = 'X-Title: ' . $title;
        }
    }

    return $headers;
}

function plinio_response_error_text(?array $response): string
{
    if (!is_array($response)) {
        return '';
    }

    $json = is_array($response['json'] ?? null) ? $response['json'] : [];
    $error = $json['error'] ?? null;
    if (is_array($error)) {
        $msg = trim((string) ($error['message'] ?? ''));
        if ($msg !== '') {
            return $msg;
        }
    }

    $raw = trim((string) ($response['body'] ?? ''));
    if ($raw !== '') {
        return mb_substr($raw, 0, 400);
    }
    return '';
}

function plinio_fetch_openrouter_free_models(string $baseUrl, string $apiKey): array
{
    if (!plinio_is_openrouter_base($baseUrl) || $baseUrl === '' || $apiKey === '') {
        return [];
    }

    $endpoint = str_ends_with($baseUrl, '/v1') ? $baseUrl . '/models' : $baseUrl . '/v1/models';

    try {
        $response = public_api_http_request(
            'GET',
            $endpoint,
            plinio_qwen_http_headers($baseUrl, $apiKey),
            null
        );
    } catch (Throwable) {
        return [];
    }

    $status = (int) ($response['status'] ?? 0);
    if ($status < 200 || $status >= 300) {
        return [];
    }

    $json = is_array($response['json'] ?? null) ? $response['json'] : [];
    $rows = is_array($json['data'] ?? null) ? $json['data'] : [];
    if ($rows === []) {
        return [];
    }

    $preferred = [];
    $others = [];
    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }

        $id = trim((string) ($row['id'] ?? ''));
        if ($id === '' || !str_contains($id, ':free')) {
            continue;
        }

        $lower = strtolower($id);
        if (str_starts_with($lower, 'qwen/')) {
            $preferred[] = $id;
        } elseif (str_starts_with($lower, 'google/gemma')) {
            $preferred[] = $id;
        } elseif (str_starts_with($lower, 'meta-llama/')) {
            $preferred[] = $id;
        } else {
            $others[] = $id;
        }
    }

    return array_values(array_unique(array_merge($preferred, $others)));
}

function plinio_embedding_model(): string
{
    return trim((string) (public_api_env('QWEN_EMBEDDING_MODEL', '') ?: ''));
}

function plinio_embeddings_enabled(): bool
{
    return plinio_qwen_base_url() !== ''
        && plinio_qwen_api_key() !== ''
        && plinio_embedding_model() !== '';
}

function plinio_vector_ensure_table(mysqli $db): void
{
    $db->query("
        CREATE TABLE IF NOT EXISTS plinio_assistant_vectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          doc_key VARCHAR(191) NOT NULL,
          source_type VARCHAR(60) NOT NULL DEFAULT 'site',
          source_path VARCHAR(255) NOT NULL DEFAULT '',
          title VARCHAR(255) NOT NULL DEFAULT '',
          content_hash CHAR(64) NOT NULL,
          content_excerpt TEXT NULL,
          embedding_model VARCHAR(80) NOT NULL,
          embedding_json MEDIUMTEXT NOT NULL,
          last_indexed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_plinio_assistant_vectors_doc (doc_key),
          KEY idx_plinio_assistant_vectors_source (source_type),
          KEY idx_plinio_assistant_vectors_indexed (last_indexed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function plinio_vector_request_embedding(string $text): ?array
{
    if (!plinio_embeddings_enabled()) {
        return null;
    }

    $apiKey = plinio_qwen_api_key();
    $baseUrl = plinio_qwen_base_url();
    $model = plinio_embedding_model();
    $input = trim($text);
    if ($input === '' || $model === '' || $baseUrl === '' || $apiKey === '') {
        return null;
    }

    $endpoint = $baseUrl;
    if (!str_ends_with($endpoint, '/embeddings')) {
        $endpoint .= str_ends_with($endpoint, '/v1') ? '/embeddings' : '/v1/embeddings';
    }

    $payload = [
        'model' => $model,
        'input' => mb_substr($input, 0, 8000),
    ];

    try {
        $response = public_api_http_request(
            'POST',
            $endpoint,
            plinio_qwen_http_headers($baseUrl, $apiKey),
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );

        $status = (int) ($response['status'] ?? 0);
        $json = is_array($response['json'] ?? null) ? $response['json'] : [];
        if ($status < 200 || $status >= 300) {
            return null;
        }

        $vector = $json['data'][0]['embedding'] ?? null;
        if (!is_array($vector) || $vector === []) {
            return null;
        }

        $normalized = [];
        foreach ($vector as $value) {
            if (!is_numeric($value)) {
                continue;
            }
            $normalized[] = (float) $value;
        }
        return $normalized !== [] ? $normalized : null;
    } catch (Throwable) {
        return null;
    }
}

function plinio_vector_cosine(array $a, array $b): float
{
    $len = min(count($a), count($b));
    if ($len === 0) {
        return 0.0;
    }

    $dot = 0.0;
    $normA = 0.0;
    $normB = 0.0;
    for ($i = 0; $i < $len; $i++) {
        $x = (float) $a[$i];
        $y = (float) $b[$i];
        $dot += ($x * $y);
        $normA += ($x * $x);
        $normB += ($y * $y);
    }

    if ($normA <= 0.0 || $normB <= 0.0) {
        return 0.0;
    }

    return $dot / (sqrt($normA) * sqrt($normB));
}

function plinio_vector_doc_key(array $doc): string
{
    $id = trim((string) ($doc['id'] ?? ''));
    if ($id !== '') {
        return $id;
    }
    $title = trim((string) ($doc['title'] ?? 'doc'));
    return 'doc:' . substr(hash('sha256', $title . '|' . (string) ($doc['content'] ?? '')), 0, 24);
}

function plinio_vector_upsert_document(mysqli $db, array $doc): bool
{
    $docKey = plinio_vector_doc_key($doc);
    $content = trim((string) ($doc['content'] ?? $doc['answer'] ?? ''));
    if ($docKey === '' || $content === '' || mb_strlen($content) < 40) {
        return false;
    }

    $model = plinio_embedding_model();
    $contentHash = hash('sha256', $model . '|' . $content);
    $sourceType = str_contains($docKey, ':') ? explode(':', $docKey, 2)[0] : 'site';
    $sourcePath = trim((string) ($doc['source'] ?? ''));
    $title = mb_substr(trim((string) ($doc['title'] ?? 'Documento')), 0, 255);
    $excerpt = plinio_safe_excerpt($content, 900);

    $existingHash = '';
    $stmtRead = $db->prepare('SELECT content_hash FROM plinio_assistant_vectors WHERE doc_key = ? LIMIT 1');
    if ($stmtRead) {
        $stmtRead->bind_param('s', $docKey);
        $stmtRead->execute();
        $result = $stmtRead->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $stmtRead->close();
        $existingHash = trim((string) ($row['content_hash'] ?? ''));
    }

    if ($existingHash !== '' && $existingHash === $contentHash) {
        return false;
    }

    $vector = plinio_vector_request_embedding($content);
    if (!is_array($vector) || $vector === []) {
        return false;
    }
    $vectorJson = json_encode($vector, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($vectorJson) || $vectorJson === '') {
        return false;
    }

    $stmtWrite = $db->prepare(
        "INSERT INTO plinio_assistant_vectors
         (doc_key, source_type, source_path, title, content_hash, content_excerpt, embedding_model, embedding_json, last_indexed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           source_type = VALUES(source_type),
           source_path = VALUES(source_path),
           title = VALUES(title),
           content_hash = VALUES(content_hash),
           content_excerpt = VALUES(content_excerpt),
           embedding_model = VALUES(embedding_model),
           embedding_json = VALUES(embedding_json),
           last_indexed_at = NOW()"
    );
    if (!$stmtWrite) {
        return false;
    }

    $stmtWrite->bind_param(
        'ssssssss',
        $docKey,
        $sourceType,
        $sourcePath,
        $title,
        $contentHash,
        $excerpt,
        $model,
        $vectorJson
    );
    $ok = $stmtWrite->execute();
    $stmtWrite->close();
    return $ok;
}

function plinio_vector_index_documents(array $docs): void
{
    if (!plinio_embeddings_enabled()) {
        return;
    }

    $db = public_api_db();
    if (!$db) {
        return;
    }

    plinio_vector_ensure_table($db);
    $maxPerRequest = (int) (public_api_env('PLINIO_VECTOR_MAX_INDEX_PER_REQUEST', '8') ?: '8');
    $maxPerRequest = max(0, min(40, $maxPerRequest));
    if ($maxPerRequest === 0) {
        return;
    }

    $processed = 0;
    foreach ($docs as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        if (plinio_vector_upsert_document($db, $doc)) {
            $processed++;
            if ($processed >= $maxPerRequest) {
                break;
            }
        }
    }
}

function plinio_vector_search(string $query, int $top = 12): array
{
    if (!plinio_embeddings_enabled()) {
        return [];
    }

    $db = public_api_db();
    if (!$db) {
        return [];
    }

    plinio_vector_ensure_table($db);
    $queryVector = plinio_vector_request_embedding($query);
    if (!is_array($queryVector) || $queryVector === []) {
        return [];
    }

    $candidateLimit = (int) (public_api_env('PLINIO_VECTOR_CANDIDATE_LIMIT', '320') ?: '320');
    $candidateLimit = max(40, min(1200, $candidateLimit));
    $top = max(1, min(60, $top));

    $result = $db->query(
        'SELECT doc_key, embedding_json FROM plinio_assistant_vectors ORDER BY last_indexed_at DESC LIMIT ' . $candidateLimit
    );

    $scores = [];
    while ($result && ($row = $result->fetch_assoc())) {
        $docKey = trim((string) ($row['doc_key'] ?? ''));
        $vectorJson = (string) ($row['embedding_json'] ?? '');
        if ($docKey === '' || $vectorJson === '') {
            continue;
        }
        $vector = json_decode($vectorJson, true);
        if (!is_array($vector) || $vector === []) {
            continue;
        }

        $score = plinio_vector_cosine($queryVector, $vector);
        if ($score <= 0.40) {
            continue;
        }
        $scores[$docKey] = $score;
    }

    arsort($scores, SORT_NUMERIC);
    return array_slice($scores, 0, $top, true);
}

function plinio_site_paths_from_sitemap(string $documentRoot): array
{
    $sitemap = rtrim($documentRoot, '/') . '/sitemap.xml';
    if (!is_file($sitemap) || !is_readable($sitemap)) {
        return [];
    }

    $raw = (string) file_get_contents($sitemap);
    if (trim($raw) === '') {
        return [];
    }

    preg_match_all('/<loc>(.*?)<\/loc>/i', $raw, $matches);
    $locs = is_array($matches[1] ?? null) ? $matches[1] : [];
    $paths = [];
    foreach ($locs as $loc) {
        $path = parse_url((string) $loc, PHP_URL_PATH);
        if (!is_string($path) || trim($path) === '') {
            continue;
        }
        $normalizedPath = '/' . ltrim($path, '/');
        if ($normalizedPath !== '/' && str_ends_with($normalizedPath, '/')) {
            $normalizedPath = rtrim($normalizedPath, '/');
        }
        $paths[$normalizedPath] = true;
    }
    return array_keys($paths);
}

function plinio_site_kb_documents(): array
{
    static $cache = null;
    if (is_array($cache)) {
        return $cache;
    }

    $documentRoot = trim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot === '' || !is_dir($documentRoot)) {
        $cache = [];
        return $cache;
    }

    $paths = plinio_site_paths_from_sitemap($documentRoot);
    if ($paths === []) {
        $paths = [
            '/',
            '/chi-siamo',
            '/contatti',
            '/servizi',
            '/servizi/pagamenti',
            '/servizi/spid-pec-firma-digitale',
            '/servizi/telefonia',
            '/servizi/energia',
            '/servizi/logistica',
            '/servizi/digitali',
            '/area-clienti',
            '/prenota',
        ];
    }

    $docs = [];
    foreach (array_slice($paths, 0, 140) as $path) {
        if (!is_string($path) || trim($path) === '' || str_starts_with($path, '/api/')) {
            continue;
        }

        $cleanPath = $path === '/' ? '/' : '/' . trim($path, '/');
        $base = rtrim($documentRoot, '/');
        $candidates = $cleanPath === '/'
            ? [$base . '/index.html']
            : [$base . $cleanPath . '.html', $base . $cleanPath . '/index.html'];

        $file = '';
        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                $file = $candidate;
                break;
            }
        }
        if ($file === '') {
            continue;
        }

        $html = (string) file_get_contents($file);
        if (trim($html) === '') {
            continue;
        }

        preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $titleMatch);
        $title = trim((string) ($titleMatch[1] ?? ''));
        $text = plinio_strip_html_to_text($html);
        if ($text === '') {
            continue;
        }

        $excerpt = plinio_safe_excerpt($text, 560);
        $pathTerms = array_values(array_filter(explode('/', trim($cleanPath, '/'))));
        $keywordBase = array_filter(array_map(static fn(string $term): string => str_replace('-', ' ', trim($term)), $pathTerms));
        if ($title !== '') {
            $keywordBase[] = $title;
        }

        $docs[] = [
            'id' => 'site:' . $cleanPath,
            'scope' => 'site',
            'title' => $title !== '' ? $title : $cleanPath,
            'keywords' => $keywordBase,
            'answer' => $excerpt,
            'docs' => '',
            'content' => $text,
            'source' => $cleanPath,
        ];
    }

    $cache = $docs;
    return $cache;
}

function plinio_learning_documents(int $max = 120): array
{
    $db = public_api_db();
    if (!$db) {
        return [];
    }

    plinio_learning_ensure_table($db);
    $max = max(20, min(400, $max));
    $result = $db->query(
        'SELECT id, question_norm, answer_text, source, service_scope, hit_count
         FROM plinio_assistant_memory
         ORDER BY hit_count DESC, last_used_at DESC
         LIMIT ' . $max
    );

    $docs = [];
    while ($result && ($row = $result->fetch_assoc())) {
        $id = (int) ($row['id'] ?? 0);
        $question = trim((string) ($row['question_norm'] ?? ''));
        $answer = trim((string) ($row['answer_text'] ?? ''));
        if ($id <= 0 || $question === '' || $answer === '') {
            continue;
        }

        $scope = trim((string) ($row['service_scope'] ?? ''));
        $source = trim((string) ($row['source'] ?? 'memory'));
        $keywords = plinio_query_tokens($question);
        $title = 'Memoria chatbot';
        if ($scope !== '') {
            $title .= ' - ' . $scope;
        }

        $docs[] = [
            'id' => 'memory:' . $id,
            'scope' => $scope !== '' ? $scope : 'memory',
            'title' => $title,
            'keywords' => $keywords,
            'answer' => plinio_safe_excerpt($answer, 400),
            'docs' => '',
            'content' => $question . "\n" . $answer,
            'source' => 'memory/' . $source,
        ];
    }

    return $docs;
}

function plinio_retrieve_kb(string $text, int $max = 3): array
{
    $normalized = plinio_normalize($text);
    $tokens = plinio_query_tokens($text);
    $scored = [];
    $allDocs = array_merge(
        plinio_kb_documents(),
        plinio_site_kb_documents(),
        plinio_learning_documents(140)
    );
    plinio_vector_index_documents($allDocs);
    $vectorScores = plinio_vector_search($text, max(10, $max * 6));

    foreach ($allDocs as $doc) {
        $docKey = plinio_vector_doc_key($doc);
        $score = plinio_contains_any($normalized, (array) ($doc['keywords'] ?? []));
        $searchText = plinio_normalize((string) (($doc['content'] ?? '') . ' ' . ($doc['answer'] ?? '') . ' ' . ($doc['title'] ?? '')));
        foreach ($tokens as $token) {
            if ($token !== '' && str_contains($searchText, $token)) {
                $score += 1;
            }
        }
        $vectorScore = (float) ($vectorScores[$docKey] ?? 0.0);
        if ($vectorScore > 0.0) {
            $score += $vectorScore * 10.0;
        }

        if ($score > 0 || $vectorScore >= 0.62) {
            $scored[] = ['doc' => $doc, 'score' => $score];
        }
    }

    usort(
        $scored,
        static fn(array $a, array $b): int => ($b['score'] <=> $a['score'])
    );

    $picked = [];
    foreach (array_slice($scored, 0, $max) as $row) {
        $picked[] = $row['doc'];
    }
    return $picked;
}

function plinio_kb_context(array $docs): string
{
    if ($docs === []) {
        return '';
    }

    $lines = [];
    foreach ($docs as $doc) {
        $lines[] = "- " . ($doc['title'] ?? 'Servizio') . ": " . ($doc['answer'] ?? '');
        if (trim((string) ($doc['source'] ?? '')) !== '') {
            $lines[] = "  Fonte: " . (string) $doc['source'];
        }
        $lines[] = "  Documenti: " . ($doc['docs'] ?? '');
    }
    return implode("\n", $lines);
}

function plinio_faq_context(array $faqItems): string
{
    if ($faqItems === []) {
        return '';
    }

    $lines = [];
    foreach ($faqItems as $item) {
        if (!is_array($item)) {
            continue;
        }
        $question = trim((string) ($item['question'] ?? ''));
        $answer = trim((string) ($item['answer'] ?? ''));
        if ($question === '' || $answer === '') {
            continue;
        }
        $lines[] = '- Q: ' . $question;
        $lines[] = '  A: ' . plinio_safe_excerpt($answer, 280);
    }

    return implode("\n", $lines);
}

function plinio_flows_context(array $flows): string
{
    if ($flows === []) {
        return '';
    }

    $lines = [];
    foreach ($flows as $item) {
        if (!is_array($item)) {
            continue;
        }
        $name = trim((string) ($item['name'] ?? $item['id'] ?? ''));
        $goal = trim((string) ($item['goal'] ?? ''));
        $botReply = trim((string) ($item['bot_reply'] ?? $item['response'] ?? ''));
        if ($name === '' || $botReply === '') {
            continue;
        }

        $lines[] = '- Flusso: ' . $name;
        if ($goal !== '') {
            $lines[] = '  Obiettivo: ' . $goal;
        }
        $lines[] = '  Risposta tipo: ' . plinio_safe_excerpt($botReply, 240);
    }

    return implode("\n", $lines);
}

function plinio_guard_response(array $messages, ?string $focusScope = null): ?string
{
    $lastRaw = plinio_last_user_message($messages);
    $last = plinio_normalize($lastRaw);
    if ($last === '') {
        return "Scrivimi una domanda sui servizi AG Servizi e ti aiuto subito.";
    }

    $lettersOnly = preg_replace('/[^a-z0-9 ]/i', '', $last) ?? '';
    $lettersOnly = trim(preg_replace('/\s+/', ' ', $lettersOnly) ?? '');
    if (strlen($lettersOnly) <= 3) {
        return "Non ho capito bene la richiesta. " . plinio_scope_help_message();
    }

    $greetings = ['ciao', 'salve', 'buongiorno', 'buonasera', 'hey'];
    if (in_array($last, $greetings, true)) {
        return "Ciao, sono l'assistente AG Servizi. " . plinio_scope_help_message();
    }

    $scope = plinio_detect_service_scope($last);
    $kbHits = plinio_retrieve_kb($last, 2);
    $genericSupport = plinio_contains_any($last, [
        'document', 'cosa serve', 'servizi', 'cosa fate', 'fate', 'offrite',
        'orari', 'orario', 'apertura', 'dove', 'sede', 'indirizzo',
        'contatti', 'telefono', 'email', 'operatore', 'richiam', 'contattami', 'contattatemi',
        'pagamenti', 'pagopa', 'f24', 'bollettini', 'mav', 'rav', 'bonifico',
    ]) > 0;

    if ($scope === null && !$genericSupport && $kbHits === [] && $focusScope === null) {
        return plinio_scope_help_message();
    }

    return null;
}

function plinio_learning_ensure_table(mysqli $db): void
{
    $db->query("
        CREATE TABLE IF NOT EXISTS plinio_assistant_memory (
          id INT AUTO_INCREMENT PRIMARY KEY,
          question_raw TEXT NOT NULL,
          question_norm VARCHAR(191) NOT NULL,
          question_hash CHAR(64) NOT NULL,
          answer_text TEXT NOT NULL,
          source VARCHAR(40) NOT NULL DEFAULT 'model',
          service_scope VARCHAR(80) NOT NULL DEFAULT '',
          hit_count INT NOT NULL DEFAULT 1,
          last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_plinio_assistant_memory_hash (question_hash),
          KEY idx_plinio_assistant_memory_scope (service_scope),
          KEY idx_plinio_assistant_memory_last_used (last_used_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function plinio_learning_sanitize(string $text): string
{
    $safe = trim($text);
    if ($safe === '') {
        return '';
    }
    $safe = preg_replace('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', '[email]', $safe) ?? $safe;
    $safe = preg_replace('/(?:\+39)?\s*[0-9][0-9\s\-]{7,15}[0-9]/', '[telefono]', $safe) ?? $safe;
    $safe = preg_replace('/\b[A-Z0-9\-]{8,34}\b/i', '[codice]', $safe) ?? $safe;
    return trim($safe);
}

function plinio_learning_upsert(string $question, string $answer, string $source = 'model', string $scope = ''): void
{
    $db = public_api_db();
    if (!$db) {
        return;
    }

    $qRaw = mb_substr(plinio_learning_sanitize($question), 0, 1800);
    $qNorm = mb_substr(plinio_normalize($qRaw), 0, 191);
    $aText = mb_substr(plinio_learning_sanitize($answer), 0, 3500);
    if ($qNorm === '' || $aText === '') {
        return;
    }

    plinio_learning_ensure_table($db);
    $hash = hash('sha256', $qNorm);
    $scopeValue = trim($scope);
    $sourceValue = trim($source) !== '' ? trim($source) : 'model';

    $stmt = $db->prepare(
        "INSERT INTO plinio_assistant_memory
         (question_raw, question_norm, question_hash, answer_text, source, service_scope, hit_count, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE
           answer_text = VALUES(answer_text),
           source = VALUES(source),
           service_scope = VALUES(service_scope),
           hit_count = hit_count + 1,
           last_used_at = NOW()"
    );
    if (!$stmt) {
        return;
    }

    $stmt->bind_param('ssssss', $qRaw, $qNorm, $hash, $aText, $sourceValue, $scopeValue);
    $stmt->execute();
    $stmt->close();
}

function plinio_learning_retrieve(string $question, int $max = 3): array
{
    $db = public_api_db();
    if (!$db) {
        return [];
    }

    $questionNorm = plinio_normalize(plinio_learning_sanitize($question));
    if ($questionNorm === '') {
        return [];
    }

    plinio_learning_ensure_table($db);
    $scope = plinio_detect_service_scope($questionNorm) ?? '';
    $tokens = plinio_query_tokens($questionNorm);

    $rows = [];
    if ($scope !== '') {
        $stmt = $db->prepare(
            "SELECT question_norm, answer_text, source, service_scope, hit_count
             FROM plinio_assistant_memory
             WHERE service_scope = ?
             ORDER BY last_used_at DESC
             LIMIT 220"
        );
        if ($stmt) {
            $stmt->bind_param('s', $scope);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($result && ($row = $result->fetch_assoc())) {
                $rows[] = $row;
            }
            $stmt->close();
        }
    }

    if ($rows === []) {
        $result = $db->query(
            "SELECT question_norm, answer_text, source, service_scope, hit_count
             FROM plinio_assistant_memory
             ORDER BY last_used_at DESC
             LIMIT 220"
        );
        while ($result && ($row = $result->fetch_assoc())) {
            $rows[] = $row;
        }
    }

    $scored = [];
    foreach ($rows as $row) {
        $rowQ = plinio_normalize((string) ($row['question_norm'] ?? ''));
        if ($rowQ === '') {
            continue;
        }

        $score = 0;
        if (str_contains($rowQ, $questionNorm) || str_contains($questionNorm, $rowQ)) {
            $score += 10;
        }
        foreach ($tokens as $token) {
            if ($token !== '' && str_contains($rowQ, $token)) {
                $score += 2;
            }
        }
        $score += min(6, (int) floor(((int) ($row['hit_count'] ?? 0)) / 5));

        if ($score > 0) {
            $scored[] = [
                'answer' => (string) ($row['answer_text'] ?? ''),
                'source' => (string) ($row['source'] ?? ''),
                'scope' => (string) ($row['service_scope'] ?? ''),
                'score' => $score,
            ];
        }
    }

    usort($scored, static fn(array $a, array $b): int => ($b['score'] <=> $a['score']));
    return array_slice($scored, 0, max(1, $max));
}

function plinio_learning_context(array $memories): string
{
    if ($memories === []) {
        return '';
    }

    $lines = [];
    foreach ($memories as $memory) {
        $answer = trim((string) ($memory['answer'] ?? ''));
        if ($answer === '') {
            continue;
        }
        $lines[] = "- " . plinio_safe_excerpt($answer, 360);
    }
    return implode("\n", $lines);
}

function plinio_reply_with_learning(array $messages, string $reply, string $source = 'model', ?string $scopeHint = null): void
{
    $question = plinio_last_user_message($messages);
    $scope = $scopeHint ?? plinio_detect_service_scope(plinio_normalize($question)) ?? '';
    plinio_learning_upsert($question, $reply, $source, $scope);
    $scopeForUi = trim((string) $scope);
    $intentMatches = plinio_detect_intents_from_knowledge($question, $scopeForUi !== '' ? $scopeForUi : null);
    $intentNames = [];
    foreach (array_slice($intentMatches, 0, 4) as $match) {
        if (!is_array($match)) {
            continue;
        }
        $intent = trim((string) ($match['intent'] ?? ''));
        if ($intent !== '') {
            $intentNames[] = $intent;
        }
    }
    $intentNames = array_values(array_unique($intentNames));

    $handoffRecommended = plinio_contains_any(plinio_normalize($reply), [
        'operatore',
        'contattare',
        'ricontatt',
        'email',
        'telefono',
    ]) > 0;

    $suggestedPrompts = plinio_suggested_prompts($scopeForUi !== '' ? $scopeForUi : null, $question);
    plinio_analytics_log_turn($question, $reply, $source, $scopeForUi, $intentNames, $handoffRecommended);

    public_api_json([
        'message' => $reply,
        'focus_scope' => $scopeForUi !== '' ? $scopeForUi : null,
        'intents' => $intentNames,
        'handoff_recommended' => $handoffRecommended,
        'suggested_prompts' => $suggestedPrompts,
    ], 200);
}

function plinio_suggested_prompts(?string $scope, string $question): array
{
    $global = [
        'Come faccio ad attivare lo SPID?',
        'Che documenti servono per la PEC?',
        'Fate pagamenti pagoPA, F24 o bollettini?',
        'Dove vi trovate?',
        'Quali sono gli orari?',
        'Posso parlare con un operatore?',
    ];

    $byScope = [
        'telefonia' => [
            'Mi aiuti a scegliere tra WindTre, Fastweb e Iliad?',
            'Che documenti servono per la portabilita?',
            'Meglio mobile o internet casa nel mio caso?',
            'Posso mantenere il mio numero?',
        ],
        'energia' => [
            'Fate attivazioni luce e gas?',
            'Che documenti servono per cambio fornitore?',
            'Serve il POD o il PDR?',
            'Posso fare una nuova attivazione?',
        ],
        'pagamenti' => [
            'Fate pagamenti pagoPA, F24 o bollettini?',
            'Posso pagare MAV e RAV?',
            'Posso pagare il bollo auto in agenzia?',
            'Serve portare l’avviso cartaceo?',
        ],
        'spedizioni' => [
            'Cosa serve per una spedizione nazionale?',
            'Cosa serve per una spedizione internazionale?',
            'Mi aiuti a tracciare una spedizione?',
            'Posso spedire dall’area clienti?',
        ],
        'spid' => [
            'Come faccio ad attivare lo SPID?',
            'Quali documenti devo portare per SPID?',
            'Posso usare email e cellulare personali?',
            'Quanto tempo richiede la pratica SPID?',
        ],
        'pec' => [
            'Che documenti servono per la PEC?',
            'Posso attivare una PEC aziendale?',
            'Che differenza c’e tra PEC personale e business?',
            'Posso essere assistito in agenzia per la PEC?',
        ],
    ];

    $pool = $global;
    if ($scope !== null && isset($byScope[$scope])) {
        $pool = array_values(array_unique(array_merge($byScope[$scope], $global)));
    }

    if ($pool === []) {
        return [];
    }

    $seedSource = $scope . '|' . plinio_normalize($question);
    $seed = abs((int) crc32($seedSource));
    $offset = $seed % count($pool);
    $size = min(4, count($pool));
    $out = [];
    for ($i = 0; $i < $size; $i++) {
        $out[] = $pool[($offset + $i) % count($pool)];
    }
    return array_values(array_unique($out));
}

function plinio_analytics_ensure_table(mysqli $db): void
{
    $db->query("
        CREATE TABLE IF NOT EXISTS plinio_assistant_analytics (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          question_text TEXT NOT NULL,
          answer_text TEXT NOT NULL,
          source VARCHAR(40) NOT NULL DEFAULT 'model',
          focus_scope VARCHAR(64) DEFAULT '',
          intents_json JSON NULL,
          handoff_recommended TINYINT(1) NOT NULL DEFAULT 0,
          quality_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
          learning_score_snapshot TINYINT UNSIGNED NOT NULL DEFAULT 0,
          intent_match TINYINT(1) NOT NULL DEFAULT 0,
          focus_retained TINYINT(1) NOT NULL DEFAULT 0,
          followup_resolved TINYINT(1) NOT NULL DEFAULT 0,
          generic_reply TINYINT(1) NOT NULL DEFAULT 0,
          fallback_used TINYINT(1) NOT NULL DEFAULT 0,
          task_completed TINYINT(1) NOT NULL DEFAULT 0,
          cta_conversion_proxy TINYINT(1) NOT NULL DEFAULT 0,
          positive_signal TINYINT(1) NOT NULL DEFAULT 0,
          repeated_issue TINYINT(1) NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_plinio_assistant_analytics_scope (focus_scope),
          KEY idx_plinio_assistant_analytics_source (source),
          KEY idx_plinio_assistant_analytics_created (created_at),
          KEY idx_plinio_assistant_analytics_quality (quality_score)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'quality_score')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN quality_score TINYINT UNSIGNED NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'learning_score_snapshot')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN learning_score_snapshot TINYINT UNSIGNED NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'intent_match')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN intent_match TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'focus_retained')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN focus_retained TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'followup_resolved')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN followup_resolved TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'generic_reply')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN generic_reply TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'fallback_used')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN fallback_used TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'task_completed')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN task_completed TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'cta_conversion_proxy')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN cta_conversion_proxy TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'positive_signal')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN positive_signal TINYINT(1) NOT NULL DEFAULT 0");
    }
    if (!plinio_db_column_exists($db, 'plinio_assistant_analytics', 'repeated_issue')) {
        $db->query("ALTER TABLE plinio_assistant_analytics ADD COLUMN repeated_issue TINYINT(1) NOT NULL DEFAULT 0");
    }
}

function plinio_db_column_exists(mysqli $db, string $table, string $column): bool
{
    $dbName = '';
    $res = $db->query('SELECT DATABASE() AS db_name');
    if ($res instanceof mysqli_result) {
        $row = $res->fetch_assoc();
        $dbName = (string) ($row['db_name'] ?? '');
        $res->free();
    }
    if ($dbName === '') {
        return false;
    }

    $stmt = $db->prepare(
        "SELECT 1
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ?
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1"
    );
    if (!$stmt) {
        return false;
    }
    $stmt->bind_param('sss', $dbName, $table, $column);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result instanceof mysqli_result && $result->num_rows > 0;
    if ($result instanceof mysqli_result) {
        $result->free();
    }
    $stmt->close();
    return $exists;
}

function plinio_analytics_turn_quality_score(
    string $question,
    string $answer,
    string $source,
    string $scope,
    array $intents,
    bool $handoffRecommended
): int {
    $score = 45.0;
    $answerNorm = plinio_normalize($answer);

    if ($scope !== '') {
        $score += 10;
        if (!plinio_is_reply_off_topic($answer, $scope)) {
            $score += 10;
        } else {
            $score -= 20;
        }
    }

    if (!plinio_is_generic_non_answer($answer)) {
        $score += 10;
    } else {
        $score -= 18;
    }

    if ($source === 'model') {
        $score += 6;
    } elseif ($source === 'fallback') {
        $score -= 8;
    } elseif ($source === 'guard') {
        $score += 2;
    }

    if ($intents !== []) {
        $score += 8;
    }

    $len = mb_strlen(trim($answer));
    if ($len >= 80 && $len <= 700) {
        $score += 6;
    } elseif ($len < 35) {
        $score -= 8;
    }

    if ($handoffRecommended) {
        $score -= 4;
    }

    if (plinio_contains_any($answerNorm, [
        'al momento non riesco a rispondere',
        'contatta direttamente',
        'non riesco a registrarla automaticamente',
    ]) > 0) {
        $score -= 20;
    }

    $score = max(0.0, min(100.0, $score));
    return (int) round($score);
}

function plinio_analytics_question_positive_signal(string $question): bool
{
    return plinio_contains_any(plinio_normalize($question), [
        'grazie',
        'perfetto',
        'ottimo',
        'chiaro',
        'ok',
        'va bene',
    ]) > 0;
}

function plinio_analytics_task_completed_signal(string $answer): bool
{
    $norm = plinio_normalize($answer);
    return plinio_contains_any($norm, [
        'tracking',
        'preventivo indicativo',
        'stima indicativa',
        'in genere servono',
        'prezzo',
        'codice richiesta',
        'aprire una richiesta',
    ]) > 0;
}

function plinio_analytics_cta_signal(string $answer): bool
{
    $norm = plinio_normalize($answer);
    return plinio_contains_any($norm, [
        'se vuoi',
        'compila il pannello',
        'contatta',
        'scrivimi',
        'dimmi',
        'puoi',
    ]) > 0;
}

function plinio_analytics_is_repeated_issue(mysqli $db, string $question, string $scope): bool
{
    $scope = trim($scope);
    $questionNorm = plinio_normalize($question);
    if ($questionNorm === '') {
        return false;
    }

    if ($scope === '') {
        $stmt = $db->prepare(
            "SELECT question_text
             FROM plinio_assistant_analytics
             ORDER BY id DESC
             LIMIT 12"
        );
    } else {
        $stmt = $db->prepare(
            "SELECT question_text
             FROM plinio_assistant_analytics
             WHERE focus_scope = ?
             ORDER BY id DESC
             LIMIT 12"
        );
    }
    if (!$stmt) {
        return false;
    }
    if ($scope !== '') {
        $stmt->bind_param('s', $scope);
    }
    $stmt->execute();
    $res = $stmt->get_result();
    if (!($res instanceof mysqli_result)) {
        $stmt->close();
        return false;
    }

    $tokens = plinio_query_tokens($question);
    foreach ($res as $row) {
        $q = plinio_normalize((string) ($row['question_text'] ?? ''));
        if ($q === '') {
            continue;
        }
        if ($q === $questionNorm || str_contains($q, $questionNorm) || str_contains($questionNorm, $q)) {
            $res->free();
            $stmt->close();
            return true;
        }
        $shared = 0;
        foreach ($tokens as $token) {
            if ($token !== '' && str_contains($q, $token)) {
                $shared++;
            }
        }
        if ($shared >= 4) {
            $res->free();
            $stmt->close();
            return true;
        }
    }
    $res->free();
    $stmt->close();
    return false;
}

function plinio_analytics_turn_metrics(
    mysqli $db,
    string $question,
    string $answer,
    string $source,
    string $scope,
    array $intents
): array {
    $intentMatch = $intents !== [] ? 1 : 0;
    $focusRetained = ($scope !== '' && !plinio_is_reply_off_topic($answer, $scope)) ? 1 : 0;
    $genericReply = plinio_is_generic_non_answer($answer) ? 1 : 0;
    $fallbackUsed = $source === 'fallback' ? 1 : 0;
    $taskCompleted = plinio_analytics_task_completed_signal($answer) ? 1 : 0;
    $ctaConversionProxy = plinio_analytics_cta_signal($answer) ? 1 : 0;
    $positiveSignal = plinio_analytics_question_positive_signal($question) ? 1 : 0;
    $repeatedIssue = plinio_analytics_is_repeated_issue($db, $question, $scope) ? 1 : 0;
    $followupResolved = (
        plinio_is_short_followup_message($question)
        && $genericReply === 0
        && mb_strlen(trim($answer)) >= 40
    ) ? 1 : 0;

    return [
        'intent_match' => $intentMatch,
        'focus_retained' => $focusRetained,
        'followup_resolved' => $followupResolved,
        'generic_reply' => $genericReply,
        'fallback_used' => $fallbackUsed,
        'task_completed' => $taskCompleted,
        'cta_conversion_proxy' => $ctaConversionProxy,
        'positive_signal' => $positiveSignal,
        'repeated_issue' => $repeatedIssue,
    ];
}

function plinio_analytics_learning_score(mysqli $db, int $window = 250): int
{
    $window = max(30, min(1000, $window));
    $sql = "
        SELECT
          COUNT(*) AS total_rows,
          AVG(quality_score) AS avg_quality,
          SUM(CASE WHEN source = 'fallback' THEN 1 ELSE 0 END) AS fallback_rows,
          SUM(CASE WHEN handoff_recommended = 1 THEN 1 ELSE 0 END) AS handoff_rows,
          AVG(intent_match) AS avg_intent_match,
          AVG(focus_retained) AS avg_focus_retained,
          AVG(followup_resolved) AS avg_followup_resolved,
          AVG(generic_reply) AS avg_generic_reply,
          AVG(fallback_used) AS avg_fallback_used,
          AVG(task_completed) AS avg_task_completed,
          AVG(cta_conversion_proxy) AS avg_cta_conversion_proxy,
          AVG(positive_signal) AS avg_positive_signal,
          AVG(repeated_issue) AS avg_repeated_issue
        FROM (
          SELECT quality_score, source, handoff_recommended,
                 intent_match, focus_retained, followup_resolved, generic_reply,
                 fallback_used, task_completed, cta_conversion_proxy, positive_signal, repeated_issue
          FROM plinio_assistant_analytics
          ORDER BY id DESC
          LIMIT {$window}
        ) t
    ";
    $res = $db->query($sql);
    if (!($res instanceof mysqli_result)) {
        return 0;
    }

    $row = $res->fetch_assoc() ?: [];
    $res->free();

    $total = (int) ($row['total_rows'] ?? 0);
    if ($total <= 0) {
        return 0;
    }

    $avgQuality = (float) ($row['avg_quality'] ?? 0);
    $fallbackRate = ((float) ($row['avg_fallback_used'] ?? 0));
    if ($fallbackRate <= 0 && $total > 0) {
        $fallbackRate = ((int) ($row['fallback_rows'] ?? 0)) / $total;
    }
    $handoffRate = ((int) ($row['handoff_rows'] ?? 0)) / $total;
    $intentRate = (float) ($row['avg_intent_match'] ?? 0);
    $focusRate = (float) ($row['avg_focus_retained'] ?? 0);
    $followupRate = (float) ($row['avg_followup_resolved'] ?? 0);
    $genericRate = (float) ($row['avg_generic_reply'] ?? 0);
    $taskRate = (float) ($row['avg_task_completed'] ?? 0);
    $ctaRate = (float) ($row['avg_cta_conversion_proxy'] ?? 0);
    $positiveRate = (float) ($row['avg_positive_signal'] ?? 0);
    $repeatedRate = (float) ($row['avg_repeated_issue'] ?? 0);

    $score = 0.0;
    $score += ($avgQuality * 0.40);
    $score += ($intentRate * 12.0);
    $score += ($focusRate * 14.0);
    $score += ($followupRate * 8.0);
    $score += ($taskRate * 10.0);
    $score += ((1.0 - $genericRate) * 8.0);
    $score += ((1.0 - $fallbackRate) * 8.0);
    $score += ($ctaRate * 6.0);
    $score += ($positiveRate * 4.0);
    $score += ((1.0 - $repeatedRate) * 6.0);
    $score -= ($handoffRate * 6.0);

    if ($total >= 100) {
        $score += 2.0;
    }

    $score = max(0.0, min(100.0, $score));
    return (int) round($score);
}

function plinio_analytics_log_turn(string $question, string $answer, string $source, string $scope, array $intents, bool $handoffRecommended): void
{
    $db = public_api_db();
    if (!$db) {
        return;
    }

    plinio_analytics_ensure_table($db);

    $question = mb_substr(trim($question), 0, 1800);
    $answer = mb_substr(trim($answer), 0, 3500);
    $source = mb_substr(trim($source), 0, 40);
    $scope = mb_substr(trim($scope), 0, 64);
    $intentsJson = json_encode(array_values(array_unique(array_filter($intents, static fn($v): bool => is_string($v) && trim($v) !== ''))), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $handoff = $handoffRecommended ? 1 : 0;
    $metrics = plinio_analytics_turn_metrics($db, $question, $answer, $source, $scope, $intents);
    $qualityScore = plinio_analytics_turn_quality_score($question, $answer, $source, $scope, $intents, $handoffRecommended);
    $learningScore = plinio_analytics_learning_score($db);

    $stmt = $db->prepare(
        "INSERT INTO plinio_assistant_analytics
         (question_text, answer_text, source, focus_scope, intents_json, handoff_recommended, quality_score, learning_score_snapshot,
          intent_match, focus_retained, followup_resolved, generic_reply, fallback_used, task_completed, cta_conversion_proxy, positive_signal, repeated_issue)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$stmt) {
        return;
    }

    $intentsPayload = is_string($intentsJson) ? $intentsJson : '[]';
    $intentMatch = (int) ($metrics['intent_match'] ?? 0);
    $focusRetained = (int) ($metrics['focus_retained'] ?? 0);
    $followupResolved = (int) ($metrics['followup_resolved'] ?? 0);
    $genericReply = (int) ($metrics['generic_reply'] ?? 0);
    $fallbackUsed = (int) ($metrics['fallback_used'] ?? 0);
    $taskCompleted = (int) ($metrics['task_completed'] ?? 0);
    $ctaConversionProxy = (int) ($metrics['cta_conversion_proxy'] ?? 0);
    $positiveSignal = (int) ($metrics['positive_signal'] ?? 0);
    $repeatedIssue = (int) ($metrics['repeated_issue'] ?? 0);
    $stmt->bind_param(
        'sssssiiiiiiiiiiii',
        $question,
        $answer,
        $source,
        $scope,
        $intentsPayload,
        $handoff,
        $qualityScore,
        $learningScore,
        $intentMatch,
        $focusRetained,
        $followupResolved,
        $genericReply,
        $fallbackUsed,
        $taskCompleted,
        $ctaConversionProxy,
        $positiveSignal,
        $repeatedIssue
    );
    $stmt->execute();
    $stmt->close();
}

function plinio_save_contact_request(string $name, string $email, string $phone, string $serviceType, string $notes): ?string
{
    $db = public_api_db();
    if (!$db) {
        return null;
    }

    $db->query("
        CREATE TABLE IF NOT EXISTS client_area_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          area VARCHAR(40) NOT NULL,
          service_type VARCHAR(120) NOT NULL,
          customer_name VARCHAR(191) NOT NULL,
          email VARCHAR(191) NOT NULL,
          phone VARCHAR(80) DEFAULT '',
          notes TEXT DEFAULT '',
          details_json JSON NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'new',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_client_area_requests_area (area),
          KEY idx_client_area_requests_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $stmt = $db->prepare(
        "INSERT INTO client_area_requests
          (area, service_type, customer_name, email, phone, notes, details_json, status)
         VALUES ('plinio-assistant', ?, ?, ?, ?, ?, NULL, 'new')"
    );
    if (!$stmt) {
        return null;
    }

    $safeEmail = $email !== '' ? $email : 'non-disponibile@agenziaplinio.it';
    $stmt->bind_param('sssss', $serviceType, $name, $safeEmail, $phone, $notes);
    $stmt->execute();
    $requestId = (int) $stmt->insert_id;
    $stmt->close();

    if ($requestId <= 0) {
        return null;
    }

    $code = 'CHAT-' . gmdate('Ymd') . '-' . str_pad((string) $requestId, 6, '0', STR_PAD_LEFT);
    plinio_send_contact_request_email($code, $name, $email, $phone, $serviceType, $notes);
    return $code;
}

function plinio_send_contact_request_email(string $code, string $name, string $email, string $phone, string $serviceType, string $notes): void
{
    $resendKey = trim((string) (public_api_env('RESEND_API_KEY', '') ?: ''));
    $resendFrom = trim((string) (public_api_env('RESEND_FROM', '') ?: ''));
    $resendTo = 'ag.servizi16@gmail.com';
    if ($resendKey === '' || $resendFrom === '' || $resendTo === '') {
        return;
    }

    $lines = [
        'Nuova richiesta contatto da Plinio Assistant',
        'Codice: ' . $code,
        'Nome: ' . ($name !== '' ? $name : 'n/d'),
        'Telefono: ' . ($phone !== '' ? $phone : 'n/d'),
        'Email: ' . ($email !== '' ? $email : 'n/d'),
        'Servizio: ' . ($serviceType !== '' ? $serviceType : 'generico'),
        'Note: ' . ($notes !== '' ? $notes : 'n/d'),
    ];

    $payload = [
        'from' => $resendFrom,
        'to' => [$resendTo],
        'subject' => '[Plinio Assistant] Nuovo contatto ' . $code,
        'text' => implode("\n", $lines),
    ];

    if ($email !== '' && str_contains($email, '@')) {
        $payload['reply_to'] = $email;
    }

    $ch = curl_init('https://api.resend.com/emails');
    if (!$ch) {
        return;
    }
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $resendKey,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function plinio_rule_based_response(array $messages, ?string $focusScope = null): ?string
{
    $lastRaw = plinio_last_user_message($messages);
    $lastAssistantRaw = plinio_last_assistant_message($messages);
    $allRaw = plinio_all_user_text($messages);
    $last = plinio_normalize($lastRaw);
    $lastAssistant = plinio_normalize($lastAssistantRaw);
    $all = plinio_normalize($allRaw);
    if ($last === '') {
        return null;
    }

    if (plinio_is_ambiguous_short_request($lastRaw) && $focusScope === null) {
        return "Ti seguo. Per risponderti in modo preciso, dimmi l'ambito: pagamenti, SPID/PEC/firma digitale, telefonia, luce e gas oppure spedizioni.";
    }

    $trackingIntent = plinio_contains_any($last, ['tracking', 'traccia', 'dove il pacco', 'dov e il pacco', 'stato spedizione']) > 0;
    if ($trackingIntent) {
        $carrier = plinio_detect_carrier($allRaw) ?? plinio_detect_carrier($lastRaw);
        $code = plinio_extract_tracking_code($lastRaw);
        if ($carrier === null) {
            return "Certo. Posso aiutarti a tracciare spedizioni per Poste Italiane, BRT, SDA e TNT/FedEx. Scrivimi il corriere e il codice tracking (esempio: \"Traccia BRT 123456789\").";
        }
        if ($code === '') {
            return "Perfetto, per " . plinio_carrier_label($carrier) . " inviami anche il codice tracking.";
        }
        $link = plinio_tracking_link($carrier, $code);
        $live = plinio_tracking_live_status($carrier, $code);
        if (is_array($live) && trim((string) ($live['status'] ?? '')) !== '') {
            $status = trim((string) ($live['status'] ?? ''));
            $description = trim((string) ($live['statusDescription'] ?? ''));
            $lastEvent = trim((string) ($live['lastEvent'] ?? ''));
            $parts = [];
            $parts[] = "Tracking " . plinio_carrier_label($carrier) . " ($code):";
            $parts[] = "Stato: " . $status . ($description !== '' ? " - " . $description : "");
            if ($lastEvent !== '') {
                $parts[] = "Ultimo evento: " . $lastEvent;
            }
            $parts[] = "Se vuoi posso anche aprire una richiesta di assistenza spedizione direttamente qui in chat.";
            return implode(" ", $parts);
        }
        if ($link !== '') {
            return "Ho rilevato " . plinio_carrier_label($carrier) . " con codice $code, ma al momento il tracking diretto in chat non è disponibile per questo corriere. Se vuoi, posso aprire subito una richiesta di assistenza interna senza farti uscire dal sito.";
        }
        return "Ho rilevato il corriere " . plinio_carrier_label($carrier) . " e il codice $code. Posso gestire tutto qui in chat aprendo una richiesta assistenza spedizione.";
    }

    $asksWhere = plinio_contains_any($last, ['dove', 'sede', 'indirizzo', 'via plinio']) > 0;
    if ($asksWhere) {
        return "Ci trovi in " . PLINIO_ADDRESS . ". Se vuoi ti indico anche il servizio giusto da attivare in sede.";
    }

    $asksHours = plinio_contains_any($last, ['orari', 'orario', 'apertura', 'quando siete aperti']) > 0;
    if ($asksHours) {
        return "Gli orari indicativi sono: Lunedi - Venerdi 08:45 - 13:20 / 16:20 - 19:00. Sabato 09:20 - 12:30. Domenica: Chiuso. Per conferma aggiornata " . plinio_escalation_message();
    }

    $asksContacts = plinio_contains_any($last, ['contatti', 'telefono', 'whatsapp', 'email', 'operatore', 'parlare con']) > 0;
    $contactIntent = plinio_contains_any($last, ['richiam', 'contattami', 'contattatemi', 'voglio essere contattato', 'parlare con un operatore']) > 0;
    $scopeLast = plinio_detect_service_scope($last);
    $scopeAll = plinio_detect_service_scope($all);
    $scope = $scopeLast ?? $scopeAll;

    $asksHumanOperator = plinio_contains_any($last, [
        'parlare con un operatore',
        'parlare con operatore',
        'operatore umano',
        'assistenza umana',
        'persona reale',
        'persona vera',
        'operatore',
    ]) > 0;
    if ($asksHumanOperator) {
        return "Certo. Ti metto in contatto con un operatore umano. " . plinio_escalation_message() . " Se preferisci, posso anche raccogliere qui nome e telefono/email per farti richiamare.";
    }

    $asksHowCanYouHelp = plinio_contains_any($last, [
        'come puoi aiutarmi',
        'come mi puoi aiutare',
        'in cosa puoi aiutarmi',
        'in cosa mi puoi aiutare',
    ]) > 0;
    if ($asksHowCanYouHelp) {
        if ($scope !== null) {
            $capability = plinio_scope_capabilities_reply($scope);
            if ($capability !== null) {
                return $capability;
            }
        }
        return "Posso aiutarti su pagamenti, SPID/PEC/firma digitale, telefonia, luce e gas, spedizioni, orari e contatti. Dimmi cosa ti serve e ti guido passo passo.";
    }

    $assistantAskedBeneficiaryName = plinio_contains_any($lastAssistant, [
        'denominazione esatta del beneficiario',
        'beneficiario bollettino',
        'elenco beneficiari bollettini',
    ]) > 0;
    if ($assistantAskedBeneficiaryName && !plinio_is_topic_switch_request($lastRaw) && count(plinio_query_tokens($lastRaw)) <= 6) {
        $asksPayabilityFollowup = plinio_contains_any($last, [
            'posso pagarlo', 'posso pagare', 'quindi posso', 'da voi', 'in agenzia',
            'si puo pagare', 'si può pagare', 'pagabile',
        ]) > 0;
        if ($asksPayabilityFollowup && plinio_contains_any($lastAssistant, ['risulta presente']) > 0) {
            return "Si, in linea generale puoi pagarlo in agenzia. Conferma finale operativa al momento del pagamento.";
        }
        if ($asksPayabilityFollowup && plinio_contains_any($lastAssistant, ['non trovo una corrispondenza', 'non risulta']) > 0) {
            return "Al momento non ho una conferma certa di pagabilita. Inviami la denominazione completa del beneficiario (come da bollettino) e ricontrollo subito.";
        }

        $beneficiaryQuery = trim($lastRaw);
        if ($beneficiaryQuery !== '') {
            $match = plinio_match_bollettini_beneficiary($beneficiaryQuery);
            if (is_string($match) && trim($match) !== '') {
                $label = plinio_beneficiary_label_for_reply($beneficiaryQuery, $match);
                return "Da verifica elenco beneficiari bollettini, \"" . $label . "\" risulta presente. In linea generale il bollettino puo essere pagato in agenzia. Conferma finale operativa al momento del pagamento.";
            }
            return "Ho ricevuto \"" . $beneficiaryQuery . "\". Al momento non trovo una corrispondenza certa nell'elenco disponibile: puoi inviarmi la denominazione completa del beneficiario per una verifica piu precisa.";
        }
    }

    if ($scope === null && $focusScope !== null && !plinio_is_topic_switch_request($lastRaw)) {
        $scope = $focusScope;
    }

    $assistantAskedContactDetails = plinio_contains_any($lastAssistant, [
        'farti richiamare',
        'raccogliere qui nome e telefono/email',
        'scrivimi: nome, telefono',
        'dati di contatto',
    ]) > 0;
    $hasContactInCurrentMessage = (plinio_extract_phone($lastRaw) !== '') || (plinio_extract_email($lastRaw) !== '');
    if (!$contactIntent && $assistantAskedContactDetails && $hasContactInCurrentMessage) {
        $contactIntent = true;
    }
    if ($scope !== null && !plinio_is_topic_switch_request($lastRaw) && plinio_is_short_followup_message($lastRaw)) {
        $guided = plinio_scope_guided_followup_reply($scope, $lastRaw, $lastAssistantRaw);
        if (is_string($guided) && trim($guided) !== '') {
            return $guided;
        }
    }
    $intentMatches = plinio_detect_intents_from_knowledge($last, $scope);
    $topIntent = $intentMatches[0]['intent'] ?? null;

    $indecisionIntent = plinio_contains_any($last, ['non so', 'indeciso', 'non sono sicuro', 'non so cosa scegliere']) > 0;
    if ($indecisionIntent) {
        if ($scope === 'telefonia') {
            return "Ti aiuto io a scegliere in modo pratico tra WindTre, Fastweb e Iliad. Per guidarti bene, partiamo da tre punti: uso principale (chiamate/dati), copertura nella tua zona e budget mensile. Se mi dici se ti interessa mobile o internet casa, ti preparo un confronto chiaro passo per passo.";
        }
        return "Certo, ti aiuto volentieri. Hai bisogno di assistenza per pagamenti, SPID, PEC, telefonia, luce e gas oppure spedizioni?";
    }

    $adviceIntent = plinio_contains_any($last, [
        'consigli',
        'consiglio',
        'mi consigli',
        'cosa mi consigli',
        'che consigli mi puoi dare',
        'consigliami',
        'cosa conviene',
        'quale conviene'
    ]) > 0;
    if ($adviceIntent && $scope === null) {
        return "Certo, ti aiuto volentieri. Per consigliarti in modo coerente, quali servizi ti occorrono tra pagamenti, SPID/PEC, telefonia, luce e gas o spedizioni?";
    }

    $paymentsOverviewIntent = $scope === 'pagamenti'
        && (
            plinio_contains_any($last, ['pagamenti', 'pagamento']) > 0
            || plinio_contains_any($last, ['che effettuate', 'quali fate', 'cosa posso pagare', 'di piu', 'di più']) > 0
        );
    $ricaricheOverviewIntent = $scope === 'pagamenti'
        && (
            plinio_contains_any($last, ['ricariche', 'ricarica']) > 0
            || plinio_contains_any($last, ['telefonia', 'pay tv', 'streaming', 'console', 'conti gioco', 'gift card']) > 0
        );
    $biglietteriaOverviewIntent = (
            $scope === 'pagamenti'
            || $scope === null
        ) && (
            plinio_contains_any($last, ['biglietti', 'biglietto', 'biglietteria', 'rivendita biglietti']) > 0
            || plinio_contains_any($last, ['trenitalia', 'treno', 'bus', 'metro', 'abbonamento', 'sosta', 'parcheggio', 'parchi', 'musei']) > 0
        );
    if ($biglietteriaOverviewIntent) {
        return plinio_biglietteria_customer_overview_reply();
    }
    if ($ricaricheOverviewIntent) {
        return plinio_ricariche_customer_overview_reply();
    }
    if ($paymentsOverviewIntent) {
        return plinio_pagamenti_customer_overview_reply();
    }

    $beneficiaryListIntent = plinio_contains_any($last, ['beneficiario', 'beneficiari']) > 0
        && plinio_contains_any($last, ['quali', 'elenco', 'lista', 'ci sono', 'disponibili']) > 0;
    if ($beneficiaryListIntent) {
        return "L'elenco beneficiari bollettini e molto ampio e aggiornato periodicamente. Posso verificare subito per nome: scrivimi la denominazione esatta del beneficiario (esempio: \"Comune di ...\" oppure \"A2A Energia\") e ti confermo se risulta pagabile in agenzia.";
    }

    $beneficiaryLookupIntent = plinio_contains_any($last, ['beneficiario', 'beneficiari']) > 0
        && plinio_contains_any($last, ['pagare', 'pagabile', 'pagato', 'ricerca', 'verifica', 'agenzia']) > 0;
    if ($beneficiaryLookupIntent) {
        $beneficiaryQuery = plinio_extract_beneficiary_query($lastRaw);
        if ($beneficiaryQuery === '') {
            return "Posso verificare il beneficiario bollettino. Scrivimi la denominazione esatta del beneficiario (esempio: \"Comune di ...\" oppure \"A2A Energia\").";
        }
        $match = plinio_match_bollettini_beneficiary($beneficiaryQuery);
        if (is_string($match) && trim($match) !== '') {
            $label = plinio_beneficiary_label_for_reply($beneficiaryQuery, $match);
            return "Da verifica elenco beneficiari bollettini, \"" . $label . "\" risulta presente. In linea generale il bollettino puo essere pagato in agenzia. Conferma finale operativa al momento del pagamento.";
        }
        return "Al momento non trovo una corrispondenza certa del beneficiario nell'elenco disponibile. Potrebbe dipendere dalla denominazione inserita o da aggiornamenti recenti: porta il bollettino in agenzia e facciamo una verifica operativa prima del pagamento.";
    }

    $phoneComparisonIntent = $scope === 'telefonia'
        && plinio_contains_any($last, ['scegli', 'scegliere', 'confront', 'migliore', 'quale operatore', 'quale conviene', 'gestori', 'operatori']) > 0;
    if ($phoneComparisonIntent) {
        return "Certo. Possiamo aiutarti a confrontare WindTre, Fastweb e Iliad in base a copertura, uso (mobile o casa) e budget. In genere servono documento, codice fiscale e numero da migrare se presente. Dimmi se ti interessa mobile o internet casa.";
    }

    if ($scope === 'energia' && plinio_contains_any($last, ['gestori', 'operatori', 'fornitori']) > 0) {
        return "Per luce e gas ti aiutiamo a valutare il cambio fornitore e la soluzione piu adatta in base ai tuoi consumi. Per partire in genere servono documento, codice fiscale, POD/PDR e ultima bolletta.";
    }

    $shippingQuoteIntent = $scope === 'spedizioni'
        && plinio_contains_any($last, ['preventivo', 'stima', 'quanto costa', 'prezzo', 'costo']) > 0;
    if ($shippingQuoteIntent) {
        return "Certo. Posso preparare un preventivo indicativo rapido per la spedizione: inserisci nel pannello preventivo servizio (nazionale/internazionale), paese di destinazione, peso e misure del pacco.";
    }

    $knownServicePriceIntent = plinio_contains_any($last, ['prezzo', 'costo', 'quanto costa', 'quanto viene', 'tariffa']) > 0;
    if ($knownServicePriceIntent && in_array((string) $scope, ['spid', 'pec', 'firma-digitale'], true)) {
        return plinio_known_service_price_reply($scope);
    }

    if ($scope === 'spid' && plinio_contains_any($last, ['livello 2', 'livello due', 'livello']) > 0) {
        return "Di norma lo SPID usato per i servizi online e di livello 2 (password + codice temporaneo OTP). In alcuni casi specifici puo essere richiesto il livello 3.";
    }

    $asksDocsExtended = plinio_contains_any($last, [
        'document',
        'cosa serve',
        'che serve',
        'necessari',
        'necessario',
        'cosa occorre',
        'che occorre',
        'occorre',
    ]) > 0;
    if ($asksDocsExtended && $scope !== null) {
        $docsReply = plinio_docs_followup_reply($scope);
        if ($docsReply !== null) {
            return $docsReply;
        }
    }

    $isConfirmation = in_array($last, ['si', 'sì', 'ok', 'va bene', 'procedi'], true);
    $assistantWasAskingDocs = plinio_contains_any($lastAssistant, ['documenti necessari', 'cosa serve', 'cosa occorre']) > 0;
    if ($isConfirmation && $assistantWasAskingDocs && $scope !== null) {
        $docsReply = plinio_docs_followup_reply($scope);
        if ($docsReply !== null) {
            return $docsReply;
        }
    }

    $utilityEstimateIntent = $scope === 'energia'
        && plinio_contains_any($last, ['stima', 'preventivo', 'analisi', 'consiglio', 'bolletta', 'consumi', 'pod', 'pdr']) > 0;
    if ($utilityEstimateIntent) {
        return "Certo. Posso preparare una stima indicativa luce/gas: compila il pannello stima bolletta con spesa mensile e consumi annui (se disponibili).";
    }

    $telephonyAuditIntent = $scope === 'telefonia'
        && plinio_contains_any($last, ['audit', 'analisi', 'confronto', 'ottimizzare', 'consiglio']) > 0;
    if ($telephonyAuditIntent) {
        return "Perfetto. Posso fare un controllo rapido della tua offerta telefonica: compila il pannello con spesa mensile, GB, minuti e portabilita.";
    }

    if ($scope !== null && $topIntent !== null) {
        if ($topIntent === 'verifica_offerta' || $topIntent === 'cambio_operatore' || $topIntent === 'portabilita' || $topIntent === 'attivazione_linea') {
            return "Perfetto, restiamo sulla telefonia. Possiamo valutare insieme attivazione, cambio operatore o portabilita in base a copertura e utilizzo. In genere servono documento, codice fiscale e numero da migrare (se presente).";
        }
        if ($topIntent === 'attivazione_luce' || $topIntent === 'attivazione_gas' || $topIntent === 'cambio_fornitore' || $topIntent === 'verifica_tariffa') {
            return "Perfetto, restiamo su luce e gas. Possiamo guidarti su nuova attivazione o cambio fornitore; in genere servono documento, codice fiscale, POD/PDR e ultima bolletta.";
        }
    }

    if ($asksContacts && !$contactIntent) {
        return "Puoi contattare AG Servizi via email (" . PLINIO_EMAIL . ") o telefono (" . PLINIO_PHONE . "). Se vuoi, posso anche aprire una richiesta contatto indicando il servizio che ti interessa.";
    }

    if ($contactIntent) {
        $email = plinio_extract_email($lastRaw);
        if ($email === '') {
            $email = plinio_extract_email($allRaw);
        }
        $phone = plinio_extract_phone($lastRaw);
        if ($phone === '') {
            $phone = plinio_extract_phone($allRaw);
        }
        $name = plinio_extract_name($lastRaw);
        if ($name === '') {
            $name = plinio_extract_name($allRaw);
        }
        if ($name === '') {
            $name = plinio_extract_contact_name_candidate($lastRaw);
        }
        if ($name === '') {
            $name = plinio_extract_contact_name_candidate($allRaw);
        }
        $serviceLabel = plinio_service_label($scope);

        if ($name === '' || ($phone === '' && $email === '')) {
            return "Posso raccogliere subito la richiesta. Inserisci nome e almeno un recapito (telefono o email). Se vuoi, usa il modulo contatto nel pannello chat per invio rapido.";
        }

        $notes = "Richiesta da chatbot. Servizio: " . $serviceLabel;
        $code = plinio_save_contact_request($name, $email, $phone, $scope ?? 'generico', $notes);
        if ($code !== null) {
            return "Perfetto, ho registrato la tua richiesta contatto per " . $serviceLabel . ". Codice richiesta: " . $code . ". Un operatore ti ricontattera ai recapiti indicati.";
        }
        return "Posso raccogliere la tua richiesta, ma al momento non riesco a registrarla automaticamente. " . plinio_escalation_message();
    }

    $asksServices = plinio_contains_any($last, ['servizi', 'cosa fate', 'fate', 'offrite']) > 0;
    if ($asksServices) {
        if ($scope === 'telefonia') {
            return "Per la telefonia possiamo supportarti su nuove attivazioni, cambio operatore e confronto offerte tra WindTre, Fastweb e Iliad. Possiamo valutare insieme se conviene una soluzione mobile o internet casa, in base a copertura e utilizzo reale. Se vuoi, iniziamo subito dal tuo profilo d'uso e dal numero da mantenere (se hai portabilita).";
        }
        if ($scope === 'pagamenti') {
            if (plinio_contains_any($last, ['biglietti', 'biglietto', 'biglietteria', 'treno', 'bus', 'metro', 'abbonamento', 'sosta', 'parcheggio', 'parchi', 'musei']) > 0) {
                return plinio_biglietteria_customer_overview_reply();
            }
            if (plinio_contains_any($last, ['ricariche', 'ricarica']) > 0) {
                return plinio_ricariche_customer_overview_reply();
            }
            return plinio_pagamenti_customer_overview_reply();
        }
        return "Offriamo supporto su: pagamenti (PagoPA, F24, bollettini, MAV/RAV, bonifici), SPID/PEC/firma digitale, telefonia (WindTre, Fastweb, Iliad), consulenza luce e gas, spedizioni nazionali e internazionali. Dimmi l'ambito e ti guido sul servizio giusto.";
    }

    $asksDocs = plinio_contains_any($last, ['document', 'cosa serve', 'che serve', 'necessari', 'necessario', 'cosa occorre', 'che occorre', 'occorre']) > 0;
    if ($asksDocs && $scope !== null) {
        $docs = plinio_documents_for_scope($scope);
        if ($docs !== []) {
            return "Per " . plinio_service_label($scope) . " in genere servono " . implode(', ', $docs) . ".";
        }
        return null;
    }

    if ($scope !== null && plinio_contains_any($last, ['fate', 'si puo', 'si può', 'attiv']) > 0) {
        return "Si, gestiamo il servizio di " . plinio_service_label($scope) . ". Se vuoi ti indico i documenti necessari per procedere.";
    }

    $telephonyDeepDiveIntent = $scope === 'telefonia'
        && plinio_contains_any($last, [
            'aiutami', 'mi aiuti', 'consiglio', 'consigliami', 'quale conviene', 'differenza',
            'windtre', 'fastweb', 'iliad', 'offerta', 'tariffa', 'sim', 'fibra'
        ]) > 0;
    if ($telephonyDeepDiveIntent) {
        return "Perfetto, restiamo sulla telefonia. Per consigliarti bene tra WindTre, Fastweb e Iliad valutiamo: copertura nella tua zona, quanti giga o minuti usi, se vuoi mantenere il numero e se ti serve solo mobile o anche internet casa. In genere per partire servono documento, codice fiscale e numero da migrare (se fai portabilita). Se vuoi, iniziamo dal tuo obiettivo principale e ti accompagno fino alla scelta più adatta.";
    }

    $complexIntent = plinio_contains_any($last, [
        'urgente', 'problema complesso', 'reclamo', 'contestazione', 'ricorso',
        'caso particolare', 'non riesco', 'bloccato', 'assistenza operatore',
    ]) > 0;
    if ($complexIntent) {
        return plinio_escalation_message();
    }

    if ($scope !== null && !plinio_is_topic_switch_request($lastRaw) && count(plinio_query_tokens($lastRaw)) <= 6) {
        return plinio_scope_sticky_followup_reply($scope);
    }

    return null;
}

function plinio_local_fallback(array $messages, ?string $focusScope = null): string
{
    $questionRaw = plinio_last_user_message($messages);
    $question = plinio_normalize($questionRaw);
    if ($question === '') {
        if ($focusScope === 'telefonia') {
            return "Continuiamo pure sulla telefonia. Posso aiutarti a scegliere tra WindTre, Fastweb e Iliad in base a uso, copertura e budget, e poi indicarti i documenti utili per procedere.";
        }
        return "Posso aiutarti su pagamenti, SPID/PEC, telefonia, spedizioni e servizi digitali. Dimmi pure cosa ti serve.";
    }

    $shortGeneric = count(plinio_query_tokens($questionRaw)) <= 2
        && plinio_contains_any($question, ['mi aiuti', 'aiuto', 'aiutami', 'supporto', 'info', 'informazioni']) > 0;
    if ($shortGeneric && $focusScope === null) {
        return "Certo, ti aiuto volentieri. Dimmi il servizio che ti interessa tra pagamenti, SPID/PEC, telefonia, luce e gas o spedizioni.";
    }

    $adviceIntent = plinio_contains_any($question, [
        'consigli',
        'consiglio',
        'mi consigli',
        'cosa mi consigli',
        'che consigli mi puoi dare',
        'consigliami',
        'cosa conviene',
        'quale conviene'
    ]) > 0;
    if ($adviceIntent && $focusScope === null) {
        return "Certo, ti aiuto volentieri. Per consigliarti in modo coerente, quali servizi ti occorrono tra pagamenti, SPID/PEC, telefonia, luce e gas o spedizioni?";
    }

    if (plinio_is_ambiguous_short_request($questionRaw) && $focusScope === null) {
        return "Per aiutarti bene, indicami il servizio: pagamenti, SPID/PEC/firma digitale, telefonia, luce e gas o spedizioni.";
    }

    $beneficiaryListIntent = plinio_contains_any($question, ['beneficiario', 'beneficiari']) > 0
        && plinio_contains_any($question, ['quali', 'elenco', 'lista', 'ci sono', 'disponibili']) > 0;
    if ($beneficiaryListIntent) {
        return "L'elenco beneficiari bollettini e molto ampio e aggiornato periodicamente. Posso verificare subito per nome: scrivimi la denominazione esatta del beneficiario (esempio: \"Comune di ...\" oppure \"A2A Energia\") e ti confermo se risulta pagabile in agenzia.";
    }

    $beneficiaryLookupIntent = plinio_contains_any($question, ['beneficiario', 'beneficiari']) > 0
        && plinio_contains_any($question, ['pagare', 'pagabile', 'pagato', 'ricerca', 'verifica', 'agenzia']) > 0;
    if ($beneficiaryLookupIntent) {
        return "Posso verificare il beneficiario bollettino. Scrivimi la denominazione esatta del beneficiario (esempio: \"Comune di ...\" oppure \"A2A Energia\").";
    }

    $learned = plinio_learning_retrieve($questionRaw, 1);
    if ($learned !== [] && ((int) ($learned[0]['score'] ?? 0)) >= 8) {
        $learnedAnswer = trim((string) ($learned[0]['answer'] ?? ''));
        if ($learnedAnswer !== '' && !plinio_is_noisy_site_answer($learnedAnswer)) {
            return $learnedAnswer;
        }
    }

    $priceOrTimingAsked = plinio_contains_any($question, [
        'prezzo', 'costo', 'quanto', 'offerta', 'promozione', 'tempo', 'giorni', 'disponibilita', 'attivazione',
    ]) > 0;
    $best = plinio_retrieve_kb($questionRaw, 4);
    $entry = plinio_pick_fallback_doc($best, $focusScope);
    if (!is_array($entry)) {
        if ($focusScope === 'telefonia') {
            return "Restiamo sulla telefonia: posso guidarti nel confronto tra operatori, chiarire cosa serve per attivazione o portabilita e prepararti i prossimi passi in modo semplice. Se vuoi, partiamo da mobile o internet casa.";
        }
        return "Il mio compito e fornire assistenza sui servizi offerti da AG Servizi Via Plinio 72. Se hai bisogno di informazioni su SPID, PEC, telefonia, pagamenti o spedizioni posso aiutarti.";
    }

    $response = trim((string) ($entry['answer'] ?? ''));
    $docs = trim((string) ($entry['docs'] ?? ''));
    if ($docs !== '') {
        $response .= " In genere servono " . $docs . ".";
    }
    if ($priceOrTimingAsked) {
        if (in_array((string) $focusScope, ['spid', 'pec', 'firma-digitale'], true)) {
            $knownPrice = plinio_known_service_price_reply($focusScope);
            if (is_string($knownPrice) && $knownPrice !== '') {
                $response .= " " . $knownPrice;
            }
        } else {
            $response .= " Per prezzi, promozioni, tempi e disponibilita specifiche ti consiglio di contattare direttamente l'agenzia oppure recarti in sede.";
        }
    } else {
        $response .= " Se vuoi, ti indirizzo al servizio corretto sul sito.";
    }

    return $response;
}

function plinio_is_noisy_site_answer(string $text): bool
{
    $normalized = plinio_normalize($text);
    if ($normalized === '') {
        return true;
    }

    $navNoise = plinio_contains_any($normalized, [
        'home', 'menu', 'chiudi', 'accedi all area clienti', 'prenota un appuntamento',
        'servizi logistici a castellammare', 'ag servizi home', 'cookie policy', 'privacy policy',
    ]) >= 2;

    $veryLong = mb_strlen($normalized) > 420;
    return $navNoise || $veryLong;
}

function plinio_pick_fallback_doc(array $docs, ?string $focusScope = null): ?array
{
    if ($docs === []) {
        return null;
    }

    $candidates = [];
    foreach ($docs as $doc) {
        if (!is_array($doc)) {
            continue;
        }
        $answer = trim((string) ($doc['answer'] ?? ''));
        if ($answer === '' || plinio_is_noisy_site_answer($answer)) {
            continue;
        }
        $candidates[] = $doc;
    }

    if ($candidates === []) {
        return null;
    }

    if ($focusScope !== null) {
        foreach ($candidates as $doc) {
            if (trim((string) ($doc['scope'] ?? '')) === $focusScope) {
                return $doc;
            }
        }
    }

    foreach ($candidates as $doc) {
        if (trim((string) ($doc['scope'] ?? '')) !== 'site') {
            return $doc;
        }
    }

    return $candidates[0] ?? null;
}

function plinio_chat_model(): string
{
    $model = trim((string) (public_api_env('QWEN_MODEL', '') ?: ''));
    return $model !== '' ? $model : 'Qwen/Qwen2.5-7B-Instruct';
}

function plinio_chat_models(): array
{
    $primary = plinio_chat_model();
    $fallbackRaw = trim((string) (public_api_env('QWEN_FALLBACK_MODELS', '') ?: ''));
    $fallbackList = [];
    if ($fallbackRaw !== '') {
        foreach (explode(',', $fallbackRaw) as $item) {
            $model = trim((string) $item);
            if ($model !== '') {
                $fallbackList[] = $model;
            }
        }
    }

    $models = array_values(array_unique(array_filter(array_merge([$primary], $fallbackList), static fn(string $m): bool => $m !== '')));
    return $models !== [] ? $models : ['google/gemma-3-12b-it:free'];
}

function plinio_chat_config(): array
{
    return [
        'base_url' => plinio_qwen_base_url(),
        'api_key' => plinio_qwen_api_key(),
    ];
}

function plinio_chat_is_configured(): bool
{
    $config = plinio_chat_config();
    return ($config['base_url'] ?? '') !== '' && ($config['api_key'] ?? '') !== '';
}

function plinio_chat_request(array $payload): ?array
{
    $config = plinio_chat_config();
    $baseUrl = (string) ($config['base_url'] ?? '');
    $apiKey = (string) ($config['api_key'] ?? '');
    if ($baseUrl === '' || $apiKey === '') {
        return null;
    }

    $endpoint = $baseUrl;
    if (!str_ends_with($endpoint, '/chat/completions')) {
        $endpoint .= str_ends_with($endpoint, '/v1') ? '/chat/completions' : '/v1/chat/completions';
    }

    return public_api_http_request(
        'POST',
        $endpoint,
        plinio_qwen_http_headers($baseUrl, $apiKey),
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
}

$models = plinio_chat_models();
$lastQuestion = plinio_last_user_message($messages);
$conversationFocus = plinio_detect_conversation_focus($messages);
$lastQuestionScope = plinio_detect_service_scope(plinio_normalize($lastQuestion));
$effectiveScope = $lastQuestionScope ?? $conversationFocus;
$memoryContext = plinio_learning_context(plinio_learning_retrieve($lastQuestion, 4));

$guardResponse = plinio_guard_response($messages, $effectiveScope);
if ($guardResponse !== null) {
    plinio_reply_with_learning($messages, $guardResponse, 'guard', $effectiveScope);
}

$ruleBasedResponse = plinio_rule_based_response($messages, $effectiveScope);
if ($ruleBasedResponse !== null) {
    plinio_reply_with_learning($messages, $ruleBasedResponse, 'rule', $effectiveScope);
}

if (!plinio_chat_is_configured()) {
    plinio_reply_with_learning($messages, plinio_local_fallback($messages, $effectiveScope), 'fallback', $effectiveScope);
}

$masterKnowledge = plinio_master_knowledge_json();
$knowledgeContext = plinio_kb_context(plinio_retrieve_kb(plinio_all_user_text($messages), 4));
$knowledgeJsonContext = json_encode($masterKnowledge, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$faqContext = plinio_faq_context(is_array($masterKnowledge['faq'] ?? null) ? $masterKnowledge['faq'] : []);
$flowsContext = plinio_flows_context(is_array($masterKnowledge['conversation_flows'] ?? null) ? $masterKnowledge['conversation_flows'] : []);
$rulesContext = json_encode($masterKnowledge['rules'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$systemPrompt = <<<'PROMPT'
Sei l’assistente virtuale ufficiale di AG Servizi Via Plinio 72.
Aiuti i clienti a capire quali servizi sono disponibili, quali documenti servono e come contattare l’agenzia.
Rispondi in italiano, in modo chiaro e breve.
Non inventare prezzi, tempi o disponibilità se non presenti nei dati forniti.
Se la richiesta riguarda una pratica complessa o non confermabile online, invita il cliente a contattare direttamente l’agenzia.
Sede: Via Plinio il Vecchio 72, Castellammare di Stabia.
Contatti: info@agenziaplinio.it, 081 0584542.
Servizi principali: pagamenti, telefonia, luce e gas, SPID, PEC, firma digitale, spedizioni, servizi digitali.

Regole operative:
- prima identifica il servizio richiesto
- poi spiega brevemente cosa può fare l’agenzia
- poi indica i documenti utili per iniziare
- fai 1 domanda utile alla volta
- se l’utente chiede dettagli non certi (prezzi, tempi, disponibilità specifiche), non inventare e invita al contatto umano
- se l’utente chiede supporto operatore, usa una frase di escalation chiara con email e telefono
- se la domanda è fuori ambito rispetto ai servizi elencati, non rispondere a caso: invita a fare una domanda sui servizi AG Servizi

FAQ base da coprire:
- “Come faccio lo SPID?”
- “Che documenti servono per la PEC?”
- “Fate attivazioni luce e gas?”
- “Dove vi trovate?”
- “Quali sono gli orari?”
- “Posso parlare con un operatore?”
- “Fate pagamenti pagoPA, F24 o bollettini?”
- “Mi tracci una spedizione con Poste/BRT/SDA/TNT-FedEx?”

Intents da riconoscere:
richiesta_orari, richiesta_contatti, richiesta_indirizzo, attivazione_spid, attivazione_pec, firma_digitale, pagamento_bollettino, pagamento_pagopa, pagamento_f24, attivazione_telefonia, cambio_operatore, attivazione_luce_gas, richiesta_documenti, richiesta_costi, richiesta_tempi, supporto_generico, parlare_con_operatore, lasciare_contatto.

Missione:
- aiutare il visitatore a capire il servizio corretto
- indicare i documenti da preparare
- capire se conviene recarsi in agenzia
- raccogliere contatto quando utile
- indirizzare a operatore umano quando necessario
PROMPT;

if ($effectiveScope !== null) {
    $systemPrompt .= "\n\nFocus conversazione corrente: " . $effectiveScope . ". Mantieni il focus su questo tema e non cambiare servizio se l'utente non lo chiede esplicitamente.";
}
if ($effectiveScope === 'telefonia') {
    $systemPrompt .= "\n\nRegola aggiuntiva telefonia: rispondi in modo piu approfondito (5-8 frasi), pratico e consulenziale. Resta su confronto operatori, copertura, portabilita, documenti e prossimi passi operativi. Non deviare su altri servizi se non richiesto esplicitamente.";
}

if ($knowledgeContext !== '') {
    $systemPrompt .= "\n\nContesto interno (fonte sito/servizi):\n" . $knowledgeContext;
}
if (is_string($knowledgeJsonContext) && $knowledgeJsonContext !== '') {
    $systemPrompt .= "\n\nKnowledge JSON:\n" . $knowledgeJsonContext;
}
if ($memoryContext !== '') {
    $systemPrompt .= "\n\nMemoria conversazioni utili (richieste reali utenti):\n" . $memoryContext;
}
if ($faqContext !== '') {
    $systemPrompt .= "\n\nFAQ operative:\n" . $faqContext;
}
if ($flowsContext !== '') {
    $systemPrompt .= "\n\nFlussi conversazionali da rispettare:\n" . $flowsContext;
}
if (is_string($rulesContext) && $rulesContext !== '' && $rulesContext !== '[]' && $rulesContext !== '{}') {
    $systemPrompt .= "\n\nRegole operative strutturate:\n" . $rulesContext;
}

$chatMessages = array_merge(
    [['role' => 'system', 'content' => $systemPrompt]],
    $messages
);

$basePayload = [
    'messages' => $chatMessages,
    'temperature' => 0.2,
    'max_tokens' => $effectiveScope === 'telefonia' ? 650 : 450,
];

try {
    $message = '';
    $failedModels = [];
    $lastResponse = null;
    $dynamicModelsTried = false;

    foreach ($models as $model) {
        $payload = $basePayload;
        $payload['model'] = $model;

        $response = plinio_chat_request($payload);
        $lastResponse = $response;
        if (!is_array($response)) {
            $failedModels[] = $model;
            continue;
        }

        $status = (int) ($response['status'] ?? 0);
        if ($status < 200 || $status >= 300) {
            $failedModels[] = $model;
            continue;
        }

        $json = is_array($response['json'] ?? null) ? $response['json'] : [];
        $candidate = trim((string) ($json['choices'][0]['message']['content'] ?? ''));
        if ($candidate !== '') {
            $message = $candidate;
            break;
        }

        $failedModels[] = $model;
    }

    if (
        $message === ''
        && plinio_openrouter_auto_failover_enabled()
        && !$dynamicModelsTried
    ) {
        $config = plinio_chat_config();
        $baseUrl = (string) ($config['base_url'] ?? '');
        $apiKey = (string) ($config['api_key'] ?? '');
        $status = (int) (($lastResponse['status'] ?? 0));
        $err = strtolower(plinio_response_error_text($lastResponse));
        $likelyRateLimited = $status === 429
            || str_contains($err, 'rate-limit')
            || str_contains($err, 'rate limited')
            || str_contains($err, 'temporarily')
            || str_contains($err, 'provider returned error');

        if ($likelyRateLimited && plinio_is_openrouter_base($baseUrl)) {
            $dynamicModels = plinio_fetch_openrouter_free_models($baseUrl, $apiKey);
            if ($dynamicModels !== []) {
                $dynamicModelsTried = true;
                $maxModels = plinio_openrouter_failover_max_models();
                $attempted = 0;
                foreach ($dynamicModels as $dynamicModel) {
                    if (in_array($dynamicModel, $failedModels, true)) {
                        continue;
                    }
                    $payload = $basePayload;
                    $payload['model'] = $dynamicModel;
                    $response = plinio_chat_request($payload);
                    $lastResponse = $response;
                    $attempted++;
                    if (!is_array($response)) {
                        if ($attempted >= $maxModels) {
                            break;
                        }
                        continue;
                    }
                    $status = (int) ($response['status'] ?? 0);
                    if ($status < 200 || $status >= 300) {
                        if ($attempted >= $maxModels) {
                            break;
                        }
                        continue;
                    }

                    $json = is_array($response['json'] ?? null) ? $response['json'] : [];
                    $candidate = trim((string) ($json['choices'][0]['message']['content'] ?? ''));
                    if ($candidate !== '') {
                        $message = $candidate;
                        break;
                    }

                    if ($attempted >= $maxModels) {
                        break;
                    }
                }
            }
        }
    }

    if ($message === '') {
        plinio_reply_with_learning($messages, plinio_local_fallback($messages, $effectiveScope), 'fallback', $effectiveScope);
    }

    if ($effectiveScope !== null && !plinio_is_topic_switch_request($lastQuestion)) {
        if (plinio_is_reply_off_topic($message, $effectiveScope) || plinio_is_generic_non_answer($message)) {
            $guided = plinio_scope_guided_followup_reply($effectiveScope, $lastQuestion, plinio_last_assistant_message($messages));
            if (is_string($guided) && trim($guided) !== '') {
                $message = $guided;
            } else {
                $message = plinio_scope_sticky_followup_reply($effectiveScope);
            }
        }
    }

    plinio_reply_with_learning($messages, $message, 'model', $effectiveScope);
} catch (Throwable $error) {
    plinio_reply_with_learning($messages, plinio_local_fallback($messages, $effectiveScope), 'fallback', $effectiveScope);
}
