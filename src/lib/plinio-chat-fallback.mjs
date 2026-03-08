/**
 * @typedef {{ role: "assistant" | "user", content: string }} ChatMessage
 */

export function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function includesAny(text, keywords) {
  const value = normalize(text);
  return keywords.some((keyword) => value.includes(normalize(keyword)));
}

const IT_STOPWORDS = new Set([
  "il","lo","la","i","gli","le","un","una","uno",
  "di","a","da","in","con","su","per","tra","fra",
  "e","o","ma","che","se","mi","ti","ci","vi",
  "sono","sei","si","sì","ok","ciao","salve","buongiorno",
  "vorrei","sapere","info","informazioni","aiuto","aiutami",
  "posso","potete","fare","fate","avete","dove","quando",
  "quale","quali","come","altro","adesso","ora","quindi",
]);

function tokenizeSemantic(text) {
  const clean = normalize(text).replace(/[^a-z0-9\s]/g, " ");
  return [...new Set(clean.split(/\s+/).map((t) => t.trim()).filter((t) => t && t.length >= 3 && !IT_STOPWORDS.has(t)))];
}

function semanticScopeScores(text) {
  const tokens = tokenizeSemantic(text);
  if (!tokens.length) return {};
  const scopeMap = {
    telefonia: ["telefonia", "operatore", "mobile", "sim", "fibra", "portabilita", "windtre", "fastweb", "iliad"],
    energia: ["energia", "luce", "gas", "bolletta", "pod", "pdr", "fornitore"],
    pagamenti: ["pagamenti", "pagamento", "pagopa", "f24", "bollettino", "mav", "rav", "bonifico", "bollo"],
    spid: ["spid", "identita", "digitale"],
    pec: ["pec", "posta", "certificata"],
    "firma-digitale": ["firma", "digitale", "firma elettronica"],
    spedizioni: ["spedizione", "spedizioni", "tracking", "corriere", "pacco", "nazionale", "internazionale"],
  };

  const scores = {};
  for (const [scope, keywords] of Object.entries(scopeMap)) {
    let score = 0;
    for (const kw of keywords) {
      const kwTokens = tokenizeSemantic(kw);
      for (const t of tokens) {
        for (const k of kwTokens) {
          if (t === k) {
            score += 2;
            continue;
          }
          if (t.length >= 4 && k.length >= 4 && (t.startsWith(k) || k.startsWith(t))) {
            score += 1;
          }
        }
      }
    }
    if (score > 0) scores[scope] = score;
  }
  return scores;
}

function isAmbiguousShortRequest(text) {
  const q = normalize(text);
  if (!q) return false;
  if (includesAny(q, ["cambiamo argomento", "parliamo di altro", "passiamo a", "altro servizio"])) return false;
  if (detectServiceScope(q)) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.length <= 4;
}

function detectCarrier(text) {
  const q = normalize(text);
  if (includesAny(q, ["brt", "bartolini"])) return "brt";
  if (includesAny(q, ["poste", "poste italiane"])) return "poste";
  if (includesAny(q, ["sda"])) return "sda";
  if (includesAny(q, ["fedex", "tnt"])) return "fedex";
  return null;
}

function extractTrackingCode(text) {
  const match = String(text ?? "").match(/\b([A-Z0-9][A-Z0-9-]{7,34})\b/i);
  return match?.[1]?.toUpperCase() ?? "";
}

export function detectServiceScope(text) {
  const q = normalize(text);
  if (includesAny(q, ["windtre", "fastweb", "iliad", "telefonia", "sim", "fibra", "portabilita", "cambio operatore"])) return "telefonia";
  if (includesAny(q, ["luce", "gas", "energia", "bolletta", "pod", "pdr", "cambio fornitore"])) return "energia";
  if (includesAny(q, ["pagopa", "f24", "bollettino", "bollettini", "mav", "rav", "bonifico", "bollo auto"])) return "pagamenti";
  if (includesAny(q, ["biglietti", "biglietto", "biglietteria", "rivendita biglietti", "trenitalia", "treno", "bus", "metro", "abbonamento", "sosta", "parcheggio", "parchi", "musei"])) return "pagamenti";
  if (includesAny(q, ["spid", "identita digitale"])) return "spid";
  if (includesAny(q, ["pec", "posta certificata"])) return "pec";
  if (includesAny(q, ["firma digitale", "firma elettronica"])) return "firma-digitale";
  if (includesAny(q, ["tracking", "traccia", "spedizion", "corriere", "pacco"])) return "spedizioni";
  const sem = semanticScopeScores(q);
  const [bestScope, bestScore] = Object.entries(sem).sort((a, b) => b[1] - a[1])[0] || [];
  if (bestScope && bestScore >= 2) return bestScope;
  return null;
}

export function detectConversationScope(history = [], latestQuestion = "") {
  const direct = detectServiceScope(latestQuestion);
  if (direct) return direct;

  const userMessages = history.filter((message) => message.role === "user").map((message) => message.content);
  const scores = {};
  userMessages.slice(-8).forEach((message, index, arr) => {
    const scope = detectServiceScope(message);
    if (!scope) return;
    const weight = index === arr.length - 1 ? 3 : 1;
    scores[scope] = (scores[scope] ?? 0) + weight;
  });
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
}

export function scopeStickyReply(scope) {
  if (scope === "telefonia") {
    return "Restiamo sulla telefonia: posso aiutarti a confrontare WindTre, Fastweb e Iliad, verificare portabilita e documenti necessari. Dimmi se ti interessa mobile o internet casa.";
  }
  if (scope === "energia") {
    return "Restiamo su luce e gas: posso aiutarti su attivazione, cambio fornitore e documenti utili (POD/PDR e bolletta).";
  }
  if (scope === "pagamenti") {
    return "Restiamo sui pagamenti: posso guidarti su pagoPA, F24, bollettini, MAV/RAV e bollo auto.";
  }
  if (scope === "spid") {
    return "Restiamo sullo SPID: posso indicarti i documenti necessari e i prossimi passi per l'attivazione.";
  }
  if (scope === "pec") {
    return "Restiamo sulla PEC: posso spiegarti subito i documenti necessari per PEC personale o aziendale.";
  }
  if (scope === "firma-digitale") {
    return "Restiamo sulla firma digitale: posso guidarti su documenti necessari e avvio pratica.";
  }
  if (scope === "spedizioni") {
    return "Restiamo sulle spedizioni: posso aiutarti su nazionale/internazionale o tracking in chat.";
  }
  return "Restiamo su questo servizio: dimmi il dettaglio che vuoi chiarire e ti rispondo in modo mirato.";
}

function scopeCapabilitiesReply(scope) {
  if (scope === "pagamenti") {
    return "Sui pagamenti posso aiutarti con PagoPA, F24, bollettini, MAV/RAV, bonifici e bollo auto. Dimmi quale pratica devi fare e ti dico subito cosa portare.";
  }
  if (scope === "telefonia") {
    return "Sulla telefonia posso aiutarti a confrontare WindTre, Fastweb e Iliad, valutare portabilita e scegliere tra mobile o internet casa.";
  }
  if (scope === "energia") {
    return "Su luce e gas posso guidarti su cambio fornitore, verifica documenti (POD/PDR) e stima indicativa della bolletta.";
  }
  if (scope === "spedizioni") {
    return "Sulle spedizioni posso aiutarti con preventivo indicativo nazionale/internazionale, tracking e documenti utili per spedire.";
  }
  if (scope === "spid") {
    return "Per SPID posso spiegarti requisiti, documenti necessari, livello di accesso e costi indicativi.";
  }
  if (scope === "pec") {
    return "Per PEC posso indicarti documenti richiesti, differenze tra piano annuale e triennale e prossimi passi.";
  }
  if (scope === "firma-digitale") {
    return "Per firma digitale posso indicarti documenti, requisiti tecnici e passaggi per attivazione.";
  }
  return null;
}

function docsReplyByScope(scope) {
  if (scope === "spid") {
    return "Per lo SPID in genere servono documento valido, tessera sanitaria/codice fiscale, cellulare personale ed email personale attiva.";
  }
  if (scope === "pec") {
    return "Per la PEC in genere servono documento valido, codice fiscale, email e cellulare attivi; per PEC aziendale anche partita IVA e dati del legale rappresentante.";
  }
  if (scope === "firma-digitale") {
    return "Per la firma digitale in genere servono documento valido, tessera sanitaria/codice fiscale, email attiva e cellulare personale.";
  }
  if (scope === "telefonia") {
    return "Per la telefonia in genere servono documento, codice fiscale e numero da migrare (se presente); in alcuni casi anche ICCID SIM e indirizzo di attivazione.";
  }
  if (scope === "energia") {
    return "Per luce e gas in genere servono documento, codice fiscale, POD/PDR e ultima bolletta; in alcuni casi anche IBAN.";
  }
  if (scope === "spedizioni") {
    return "Per una spedizione in genere servono dati mittente/destinatario, peso del collo e contenuto dichiarato.";
  }
  if (scope === "pagamenti") {
    return "Per i pagamenti in genere servono l'avviso/modello da pagare (PagoPA, F24, bollettino, MAV/RAV) e i dati anagrafici corretti.";
  }
  return null;
}

function paymentsOverviewReply() {
  return "Certo. Possiamo aiutarti con i principali pagamenti: bollettini postali (bianchi e premarcati), pagoPA, deleghe F24, MAV/RAV, bollettini bancari con prenotazione e bollo auto. Possiamo supportarti anche su ricariche telefoniche e servizi digitali. Se vuoi, dimmi quale pagamento devi fare e ti indico subito cosa portare.";
}

function rechargeOverviewReply() {
  return "Certo. In agenzia possiamo supportarti su ricariche telefoniche dei principali operatori (TIM, Vodafone, WindTre, Iliad, Fastweb e ho.), ricariche per contenuti digitali e gift card, Pay TV/streaming (es. DAZN, Netflix, SKY), console gaming e conti gioco. Dimmi quale ricarica ti serve e ti confermo subito cosa possiamo gestire operativamente.";
}

function ticketingOverviewReply() {
  return "Certo. In agenzia possiamo supportarti anche sulla rivendita biglietti: titoli di viaggio e abbonamenti (treno, trasporto pubblico locale ed extraurbano), servizi di sosta/parcheggio e biglietti per parchi divertimento e musei. Dimmi pure cosa devi acquistare e ti guido subito sui passaggi.";
}

/**
 * @param {string} question
 * @param {ChatMessage[]} history
 * @returns {string}
 */
export function clientFallbackReply(question, history = []) {
  const q = normalize(question);
  const scope = detectConversationScope(history, question);
  const asksPrice = includesAny(q, ["prezzo", "costo", "quanto costa", "quanto viene", "tariffa"]);
  const asksDocs = includesAny(q, [
    "documenti",
    "documento",
    "cosa serve",
    "che serve",
    "necessari",
    "necessario",
    "cosa occorre",
    "che occorre",
    "occorre",
  ]);
  const confirms = includesAny(q, ["si", "sì", "ok", "va bene", "procedi"]);
  const denies = includesAny(q, ["no", "no grazie"]);
  const lastAssistant = [...history].reverse().find((message) => message.role === "assistant")?.content ?? "";
  const assistantAskedDocs = includesAny(lastAssistant, ["documenti necessari", "cosa serve", "cosa occorre"]);
  const assistantAskedPortabilityQuestion = includesAny(lastAssistant, ["vuoi mantenere il tuo numero attuale"]);
  const assistantAskedHomeMigrationQuestion = includesAny(lastAssistant, ["hai gia una linea attiva da migrare"]);
  const assistantAskedBeneficiaryName = includesAny(lastAssistant, [
    "denominazione esatta del beneficiario",
    "denominazione beneficiario",
    "beneficiario bollettino",
    "elenco beneficiari bollettini",
    "verifica di pagabilita in agenzia",
  ]);
  const assistantAskedContactDetails = includesAny(lastAssistant, [
    "farti richiamare",
    "raccogliere qui nome e telefono/email",
    "scrivimi: nome, telefono",
    "dati di contatto",
  ]);
  const assistantIsGenericWelcome = includesAny(lastAssistant, [
    "posso aiutarti su pagamenti, spid/pec",
    "altri servizi ag servizi",
  ]);
  const inferredScopeFromAssistant = assistantIsGenericWelcome
    ? null
    : includesAny(lastAssistant, ["spid"])
    ? "spid"
    : includesAny(lastAssistant, ["pec", "posta certificata"])
      ? "pec"
      : includesAny(lastAssistant, ["firma digitale", "firma elettronica"])
        ? "firma-digitale"
        : includesAny(lastAssistant, ["telefonia", "windtre", "fastweb", "iliad", "portabilita"])
          ? "telefonia"
          : includesAny(lastAssistant, ["luce e gas", "energia", "pod", "pdr", "fornitore"])
            ? "energia"
            : includesAny(lastAssistant, ["pagamenti", "pagopa", "f24", "bollettini", "mav", "rav"])
              ? "pagamenti"
              : includesAny(lastAssistant, ["spedizioni", "spedizione", "corriere", "tracking"])
                ? "spedizioni"
        : null;
  const effectiveScope = scope || inferredScopeFromAssistant;
  const hasTrackingIntent = includesAny(q, ["tracking", "traccia", "tracci", "stato spedizione", "pacco"]);
  const isGreeting = includesAny(q, ["ciao", "salve", "buongiorno", "buonasera", "hey", "hello"]);
  const isPresenceReply = includesAny(q, [
    "si",
    "sì",
    "ok",
    "va bene",
    "procedi",
    "certo",
    "ci sono",
    "sono qui",
    "eccomi",
    "presente",
  ]);
  const assistantWasIdleNudge =
    normalize(lastAssistant) === normalize("Ci sei ancora?") ||
    normalize(lastAssistant) === normalize("Sei ancora qui?");
  const topicSwitchIntent = includesAny(q, [
    "cambiamo argomento",
    "cambiamo servizio",
    "parliamo di altro",
    "parlare di altro",
    "possiamo parlare di altro",
    "altro servizio",
    "passiamo a",
  ]);
  const humanOperatorIntent = includesAny(q, [
    "parlare con un operatore",
    "parlare con operatore",
    "operatore umano",
    "assistenza umana",
    "persona reale",
    "persona vera",
  ]) || (includesAny(q, ["operatore"]) && includesAny(q, ["parlare", "contatto", "contattare", "richiam"]));
  const asksHowCanYouHelp = includesAny(q, [
    "come puoi aiutarmi",
    "come mi puoi aiutare",
    "in cosa puoi aiutarmi",
    "in cosa mi puoi aiutare",
  ]);
  const hasPhoneOrEmail = /(?:\+?\d[\d\s\-]{6,}\d)/.test(question) || /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i.test(question);

  if (assistantWasIdleNudge && isPresenceReply) {
    return "Perfetto, eccomi. Dimmi pure quale servizio ti serve e ti guido subito (es. telefonia, SPID, PEC, pagamenti, spedizioni).";
  }

  if (assistantAskedContactDetails && hasPhoneOrEmail) {
    return "Perfetto, ho ricevuto i recapiti. Se la connessione al server è attiva li registro subito per il ricontatto operatore.";
  }

  if (humanOperatorIntent) {
    return "Certo. Ti metto in contatto con un operatore umano. Puoi contattarci via email (info@agenziaplinio.it) o telefono (081 0584542). Se preferisci, posso anche raccogliere qui nome e telefono/email per farti richiamare.";
  }

  if (asksHowCanYouHelp) {
    if (effectiveScope) {
      const scoped = scopeCapabilitiesReply(effectiveScope);
      if (scoped) return scoped;
    }
    return "Posso aiutarti su pagamenti, SPID/PEC/firma digitale, telefonia, luce e gas, spedizioni, orari e contatti. Dimmi cosa ti serve e ti guido passo passo.";
  }

  if (topicSwitchIntent) {
    return "Certo, cambiamo argomento. Dimmi pure quale servizio ti interessa adesso (pagamenti, SPID/PEC, telefonia, luce/gas o spedizioni).";
  }

  if (isAmbiguousShortRequest(question) && !effectiveScope) {
    return "Per risponderti in modo preciso, indicami l'ambito: pagamenti, SPID/PEC/firma digitale, telefonia, luce e gas oppure spedizioni.";
  }

  const asksPayabilityFollowup = includesAny(q, [
    "posso pagarlo",
    "posso pagare",
    "quindi posso",
    "da voi",
    "in agenzia",
    "si puo pagare",
    "si può pagare",
    "pagabile",
  ]);
  if (assistantAskedBeneficiaryName && asksPayabilityFollowup && includesAny(lastAssistant, ["risulta presente"])) {
    return "Si, in linea generale puoi pagarlo in agenzia. Conferma finale operativa al momento del pagamento.";
  }
  if (
    assistantAskedBeneficiaryName &&
    asksPayabilityFollowup &&
    includesAny(lastAssistant, ["non trovo una corrispondenza", "non risulta"])
  ) {
    return "Al momento non ho una conferma certa di pagabilita. Inviami la denominazione completa del beneficiario (come da bollettino) e ricontrollo subito.";
  }

  if (assistantAskedBeneficiaryName && String(question).trim() !== "" && String(question).trim().split(/\s+/).length <= 6) {
    return `Ricevuto: "${String(question).trim()}". Lo considero come denominazione beneficiario per la verifica di pagabilita in agenzia. Se vuoi maggiore precisione, invialo esattamente come riportato sul bollettino.`;
  }

  if (isGreeting) {
    return "Ciao! Ti aiuto volentieri. Dimmi pure il servizio che ti interessa e ti guido passo passo.";
  }

  if (asksPrice && effectiveScope && includesAny(effectiveScope, ["spid", "pec", "firma-digitale"])) {
    if (effectiveScope === "spid") return "Prezzo SPID: 22 EUR.";
    if (effectiveScope === "pec") return "Prezzo PEC: 15 EUR annuale oppure 30 EUR triennale.";
    if (effectiveScope === "firma-digitale") return "Prezzo firma digitale: 55 EUR.";
  }

  if (asksPrice && includesAny(q, ["spid"])) return "Prezzo SPID: 22 EUR.";
  if (asksPrice && includesAny(q, ["pec"])) return "Prezzo PEC: 15 EUR annuale oppure 30 EUR triennale.";
  if (asksPrice && includesAny(q, ["firma digitale", "firma elettronica"])) return "Prezzo firma digitale: 55 EUR.";

  if (effectiveScope === "spid" && includesAny(q, ["livello 2", "livello due", "livello"])) {
    return "Di norma lo SPID usato per i servizi online e di livello 2 (password + codice temporaneo OTP). In alcuni casi specifici puo essere richiesto il livello 3.";
  }

  if (effectiveScope && asksDocs) {
    const docsReply = docsReplyByScope(effectiveScope);
    if (docsReply) return docsReply;
  }

  if (effectiveScope === "telefonia" && includesAny(q, ["mobile", "sim", "solo mobile"])) {
    return "Perfetto, andiamo sul mobile. Possiamo confrontare WindTre, Fastweb e Iliad su copertura nella tua zona, giga/minuti che usi e budget mensile. In genere servono documento, codice fiscale e numero da migrare (se vuoi portabilita). Vuoi mantenere il tuo numero attuale?";
  }

  if (effectiveScope === "telefonia" && includesAny(q, ["casa", "internet casa", "fibra", "fisso", "solo casa"])) {
    return "Perfetto, parliamo di internet casa. Possiamo confrontare WindTre, Fastweb e Iliad su copertura fibra/FWA, velocita disponibile e budget. In genere servono documento, codice fiscale e indirizzo di attivazione. Hai gia una linea attiva da migrare?";
  }

  if (effectiveScope === "telefonia" && assistantAskedPortabilityQuestion && confirms) {
    return "Perfetto, procediamo con portabilita mobile. Per avviare la pratica in genere servono: documento, codice fiscale, numero da migrare e ICCID della SIM attuale. Se vuoi, nel prossimo passo ti preparo una checklist rapida per confronto WindTre/Fastweb/Iliad in base al tuo uso (giga/minuti) e budget.";
  }

  if (effectiveScope === "telefonia" && assistantAskedPortabilityQuestion && denies) {
    return "Perfetto, allora valutiamo una nuova numerazione mobile. Per procedere in genere servono documento e codice fiscale. Se vuoi, ti aiuto a scegliere tra WindTre, Fastweb e Iliad partendo da giga/minuti e budget mensile.";
  }

  if (effectiveScope === "telefonia" && assistantAskedHomeMigrationQuestion && confirms) {
    return "Perfetto, procediamo con migrazione internet casa. In genere servono documento, codice fiscale, codice migrazione della linea attuale e indirizzo di attivazione. Se vuoi, ti aiuto a confrontare WindTre/Fastweb/Iliad su copertura e velocita disponibile nel tuo indirizzo.";
  }

  if (effectiveScope === "telefonia" && assistantAskedHomeMigrationQuestion && denies) {
    return "Perfetto, allora valutiamo una nuova attivazione internet casa. In genere servono documento, codice fiscale e indirizzo completo di attivazione. Se vuoi, partiamo da copertura e budget per confrontare WindTre, Fastweb e Iliad.";
  }

  if (effectiveScope && confirms && assistantAskedDocs) {
    const docsReply = docsReplyByScope(effectiveScope);
    if (docsReply) return docsReply;
  }

  const adviceIntent = includesAny(q, [
    "consigli",
    "consiglio",
    "mi consigli",
    "che consigli mi puoi dare",
    "cosa mi consigli",
    "consigliami",
    "non so cosa scegliere",
    "cosa conviene",
  ]);
  if (adviceIntent && !scope) {
    return "Certo, ti aiuto volentieri. Per consigliarti in modo coerente, quali servizi ti occorrono tra pagamenti, SPID/PEC, telefonia, luce e gas o spedizioni?";
  }

  if (
    effectiveScope === "pagamenti" &&
    (includesAny(q, ["pagamenti", "pagamento"]) ||
      includesAny(q, ["che effettuate", "quali fate", "cosa posso pagare", "di piu", "di più"]))
  ) {
    return paymentsOverviewReply();
  }

  if (
    (effectiveScope === "pagamenti" || effectiveScope === null) &&
    (includesAny(q, ["biglietti", "biglietto", "biglietteria", "rivendita biglietti"]) ||
      includesAny(q, ["trenitalia", "treno", "bus", "metro", "abbonamento", "sosta", "parcheggio", "parchi", "musei"]))
  ) {
    return ticketingOverviewReply();
  }

  if (
    effectiveScope === "pagamenti" &&
    (includesAny(q, ["ricariche", "ricarica"]) ||
      includesAny(q, ["telefonia", "pay tv", "streaming", "console", "conti gioco", "gift card"]))
  ) {
    return rechargeOverviewReply();
  }

  if (
    includesAny(q, ["beneficiario", "beneficiari"]) &&
    includesAny(q, ["quali", "elenco", "lista", "ci sono", "disponibili"])
  ) {
    return "L'elenco beneficiari bollettini e molto ampio e aggiornato periodicamente. Posso verificare subito per nome: scrivimi la denominazione esatta del beneficiario (esempio: Comune di ..., A2A Energia) e ti confermo se risulta pagabile in agenzia.";
  }

  if (
    includesAny(q, ["beneficiario", "beneficiari"]) &&
    includesAny(q, ["pagare", "pagabile", "pagato", "ricerca", "verifica", "agenzia"])
  ) {
    return "Posso verificare se il beneficiario bollettino risulta pagabile in agenzia. Scrivimi la denominazione esatta del beneficiario (esempio: Comune di ..., A2A Energia, ecc.).";
  }

  if (
    includesAny(q, ["beneficiario", "beneficiari"]) &&
    includesAny(q, ["chi", "quale"]) &&
    includesAny(q, ["pagare", "pagamento", "bollettino", "bollettini"])
  ) {
    return "Posso verificarlo subito: scrivimi la denominazione esatta del beneficiario e ti confermo se risulta pagabile in agenzia.";
  }

  if (hasTrackingIntent) {
    const carrier = detectCarrier(question);
    const code = extractTrackingCode(question);
    if (carrier && code) {
      const labels = {
        brt: "BRT",
        poste: "Poste Italiane",
        sda: "SDA",
        fedex: "TNT/FedEx",
      };
      return `Ho rilevato ${labels[carrier]} con codice ${code}. Sto elaborando il tracking in chat: se non vedi subito lo stato, riscrivi il codice oppure chiedimi di aprire assistenza spedizione.`;
    }

    if (!carrier || !code) {
      return "Certo. Posso tracciare in chat spedizioni Poste Italiane, BRT, SDA e TNT/FedEx. Inserisci corriere e codice nel pannello tracking qui sotto.";
    }
  }

  if (includesAny(q, ["spid"])) {
    return "Possiamo aiutarti ad attivare lo SPID in agenzia. In genere servono documento valido, tessera sanitaria/codice fiscale, cellulare ed email personali attivi.";
  }
  if (includesAny(q, ["pec"])) {
    return "Per la PEC in genere servono documento valido, codice fiscale, email e cellulare attivi; per PEC aziendale anche partita IVA e dati del legale rappresentante.";
  }
  if (includesAny(q, ["firma digitale", "firma elettronica"])) {
    return "Per la firma digitale in genere servono documento valido, tessera sanitaria/codice fiscale, email e cellulare attivi, con smartphone per OTP e riconoscimento.";
  }
  if (includesAny(q, ["windtre", "fastweb", "iliad", "cambio operatore", "migrazione", "confront", "quale operatore", "scegliere"])) {
    return "Certo. Possiamo aiutarti a confrontare WindTre, Fastweb e Iliad in base a copertura, uso (voce/dati/fibra) e budget. In genere servono documento, codice fiscale e numero da migrare (se presente). Se vuoi, dimmi se ti interessa mobile o casa.";
  }
  if (scope === "telefonia" && includesAny(q, ["quali gestori", "gestori", "operatori"])) {
    return "Per telefonia possiamo supportarti su WindTre, Fastweb e Iliad. Possiamo confrontarli in base a copertura, budget e tipo di utilizzo.";
  }
  if (includesAny(q, ["luce", "gas", "energia", "bolletta"])) {
    return "Si, offriamo consulenza luce e gas. In genere servono documento, codice fiscale e ultima bolletta utile.";
  }
  if (scope === "energia" && includesAny(q, ["quali gestori", "gestori", "operatori", "fornitori"])) {
    return "Per luce e gas ti aiutiamo a valutare la soluzione migliore in base ai tuoi consumi. In genere servono POD/PDR e ultima bolletta.";
  }
  if (includesAny(q, ["bolletta", "luce", "gas", "consumi", "pod", "pdr"]) && includesAny(q, ["stima", "preventivo", "analisi", "consiglio"])) {
    return "Certo. Posso fare una stima indicativa luce/gas: compila il pannello stima bolletta con spesa mensile e consumi annui (se disponibili).";
  }
  if (includesAny(q, ["telefonia", "mobile", "sim", "fibra", "windtre", "fastweb", "iliad", "portabilita"]) && includesAny(q, ["audit", "analisi", "confronto", "consiglio", "ottimizzare"])) {
    return "Perfetto. Posso fare un controllo rapido della tua offerta telefonica: compila il pannello con spesa mensile, GB, minuti e portabilita.";
  }
  if (includesAny(q, ["pagopa", "f24", "bollettini", "bollettino", "mav", "rav", "bonifico"])) {
    return "Si, gestiamo pagamenti PagoPA, F24, bollettini, MAV/RAV e bonifici con assistenza in sede.";
  }
  if (includesAny(q, ["pagamenti", "pagamento"])) {
    return paymentsOverviewReply();
  }
  if (includesAny(q, ["ricariche", "ricarica"])) {
    return rechargeOverviewReply();
  }
  if (includesAny(q, ["biglietti", "biglietto", "biglietteria", "rivendita biglietti", "trenitalia", "treno", "bus", "metro", "abbonamento", "sosta", "parcheggio", "parchi", "musei"])) {
    return ticketingOverviewReply();
  }
  if (includesAny(q, ["spedizion", "corriere"])) {
    if (includesAny(q, ["preventivo", "stima", "quanto costa", "prezzo", "costo"])) {
      return "Certo. Posso fare un preventivo indicativo rapido: inserisci nel pannello preventivo servizio (nazionale/internazionale), paese di destinazione, peso e misure del pacco.";
    }
    return "Gestiamo spedizioni nazionali e internazionali. In genere servono dati mittente/destinatario, peso del collo e contenuto dichiarato.";
  }
  if (includesAny(q, ["dove", "sede", "indirizzo"])) {
    return "Ci trovi in Via Plinio il Vecchio 72, 80053 Castellammare di Stabia (NA).";
  }
  if (includesAny(q, ["orari", "orario", "apertura"])) {
    return "Orari indicativi: Lunedi - Venerdi 08:45 - 13:20 / 16:20 - 19:00. Sabato 09:20 - 12:30. Domenica: Chiuso. Per conferma aggiornata contatta direttamente l'agenzia.";
  }
  if (includesAny(q, ["operatore", "contatto", "contattare", "telefono", "whatsapp"])) {
    return "Puoi contattare AG Servizi via email (info@agenziaplinio.it) o telefono (081 0584542). Se vuoi posso anche guidarti sul servizio giusto.";
  }

  const lastAssistantNormalized = normalize(lastAssistant);
  const assistantAskedTrackingCode = includesAny(lastAssistantNormalized, [
    "codice tracking",
    "traccia spedizione",
    "corriere + codice",
    "verifica tracking",
    "inviami anche il codice tracking",
    "scrivimi il corriere e il codice",
  ]);
  if (assistantAskedTrackingCode) {
    return "Per procedere con il tracking, scrivimi direttamente: corriere + codice (esempio: Traccia BRT 123456789).";
  }

  if (scope) {
    return scopeStickyReply(scope);
  }

  return "Posso aiutarti su pagamenti, SPID, PEC, firma digitale, telefonia, luce/gas e spedizioni. Scrivimi pure il servizio che ti interessa.";
}
