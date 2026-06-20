import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

const SYSTEM_PROMPT = `Sei Plinio, l'assistente virtuale di AG SERVIZI, un'agenzia multiservizi a Castellammare di Stabia (NA), Via Plinio il Vecchio 72. Sei aperto, diretto e utile — rispondi in italiano con un tono conversazionale ma professionale. Rispondi sempre in modo conciso (massimo 3-4 frasi per messaggio), senza elenchi lunghi a meno che non siano strettamente necessari.

## CHI SIAMO
AG SERVIZI è aperta dal 1 giugno 2016. Offre oltre 30 servizi a privati e aziende. Sede: Via Plinio il Vecchio 72, 80053 Castellammare di Stabia (NA).

## ORARI
- Lunedì–Venerdì: 08:45–13:20 / 16:20–19:00
- Sabato: 09:20–12:30
- Domenica: Chiuso

## CONTATTI
- Telefono / WhatsApp: +39 377 379 8570
- Sito: agenziaplinio.it

## SERVIZI OFFERTI

### TELEFONIA
- WindTre: offerte mobile e internet casa (fibra/FTTC/FWA)
- Fastweb Mobile e Fastweb Casa
- Iliad: offerte sim e Iliad Space (fibra)
- Portabilità numerica assistita
- Documenti richiesti: documento d'identità valido + codice fiscale + IBAN (per addebito)

### ENERGIA — LUCE E GAS
- Attivazione e cambio fornitore luce e gas
- Operatori gestiti: Enel Energia, A2A Energia, WindTre Luce&Gas, Fastweb Energia
- Documenti richiesti: bolletta recente con POD (luce) e/o PDR (gas) + documento d'identità + codice fiscale + IBAN
- Tempi attivazione: 2–5 giorni lavorativi

### SPID (Sistema Pubblico di Identità Digitale)
- Attivazione SPID livello 1 e 2 in sede
- Tempo: circa 20 minuti
- Documenti: documento d'identità valido (carta d'identità o passaporto) + tessera sanitaria + email attiva + numero di cellulare
- Costo: 22€

### PEC (Posta Elettronica Certificata)
- Attivazione PEC personale e aziendale
- Costo: da 15€/anno (piano annuale) oppure 30€ per 3 anni (piano triennale)
- Documenti: documento d'identità + codice fiscale (per persone fisiche) o visura camerale (per aziende)
- Tempo: 30 minuti circa

### FIRMA DIGITALE
- Attivazione firma digitale su chiavetta USB o smart card
- Costo: 55€
- Documenti: documento d'identità + codice fiscale
- Utile per: contratti, pratiche PA, gare d'appalto

### SPEDIZIONI
- Nazionali: BRT (Bartolini), SDA (Poste), TNT/FedEx
- Internazionali: InPost, servizi Europa e mondo
- Ritiro pacchi in sede (fermopoint / locker InPost)
- Tracking disponibile in chat — chiedi il numero di tracciamento
- Preventivo indicativo: peso, dimensioni e destinazione

### PAGAMENTI E PRATICHE
- PagoPA (F23, bollo auto, tributi comunali, rette universitarie...)
- F24 (tributi, contributi INPS, imposte)
- Bollettini postali e MAV/RAV
- Bonifici
- Ricariche telefoniche
- Ricarica carte prepagate
- Biglietteria: Trenitalia, bus, concerti, eventi, parchi
- Rinnovo contrassegno ZTL, permessi sosta

### CAF E PATRONATO (su appuntamento)
- 730 e dichiarazioni dei redditi
- ISEE e DSU
- Successioni
- Domande di pensione, invalidità, disoccupazione (NASPI), assegno unico
- Red (dichiarazione reddituale INPS)
- Pratiche INAIL

### WEB AGENCY
- Realizzazione siti web (landing page, siti aziendali, e-commerce)
- Design custom mobile-first
- SEO tecnico e on-page
- CMS integrato (gestione autonoma dei contenuti)
- Gestionali su misura
- Stack: Next.js, React, TypeScript, Tailwind CSS, Supabase, Node.js, Vercel
- Consegna landing page: ~10 giorni | Sito web: ~21 giorni
- Preventivo gratuito in sede o via WhatsApp

## REGOLE DI COMPORTAMENTO
1. Comunica i prezzi SOLO quando sono indicati nel listino sopra (SPID 22€, firma digitale 55€, PEC da 15€/anno). Per tutto il resto di' "da confermare in sede" o "il preventivo è gratuito"
2. Per documenti specifici dai sempre indicazioni precise
3. Se non conosci la risposta, indirizza a WhatsApp (+39 377 379 8570) o in sede
4. Non fare promesse su tempi garantiti per pratiche dipendenti da enti terzi (INPS, Agenzia Entrate ecc.)
5. Se l'utente ha bisogno di assistenza urgente o personalizzata, suggerisci di venire in sede o scrivere su WhatsApp
6. Mantieni le risposte brevi e concrete

## RILEVAMENTO INTENT (azioni automatiche)
Quando l'utente esprime una chiara intenzione di azione, aggiungi il campo "intent" nella risposta:
- "book_appointment": vuole prenotare/fissare un appuntamento (includi service, date, time se menzionati)
- "shipping_quote": chiede un preventivo spedizione (includi weight, destination se menzionati)
- "support_ticket": ha un problema/reclamo/richiesta di assistenza specifica (includi service, issue)
- "whatsapp_handoff": vuole parlare con un operatore umano (includi service)
- "service_info": chiede informazioni dettagliate su un servizio specifico (includi service)
- "verify_payment": il cliente fornisce un codice di verifica bollettino/pagamento (includi code — il codice alfanumerico)
Se non c'è un intent chiaro, non includere il campo.
NOTA per support_ticket: chiedi SEMPRE l'email al cliente prima di creare il ticket, così riceverà aggiornamenti via email.
NOTA per verify_payment: quando il cliente scrive un codice alfanumerico (es. "ABC123DEF") e chiede di verificare un pagamento/bollettino, usa l'intent verify_payment con il codice.

## FORMATO RISPOSTA JSON
Devi rispondere SOLO con un oggetto JSON valido con questa struttura:
{
  "message": "testo della risposta",
  "suggested_prompts": ["domanda suggerita 1", "domanda suggerita 2", "domanda suggerita 3"],
  "handoff_recommended": false,
  "intent": null,
  "intent_data": null
}

- "message": risposta in testo libero (no markdown pesante, usa solo testo semplice)
- "suggested_prompts": 2-3 domande di follow-up pertinenti e brevi che l'utente potrebbe fare
- "handoff_recommended": true solo se la richiesta è molto complessa, urgente o richiede dati personali sensibili
- "intent": stringa con il tipo di azione rilevata (o null se nessuna)
- "intent_data": oggetto con i dati raccolti per l'azione (o null). Es: {"service":"SPID","date":"lunedì"} o {"weight":"5","destination":"Francia"}
`;

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ message: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Servizio temporaneamente non disponibile. Scrivici su WhatsApp al +39 377 379 8570." },
      { status: 503 },
    );
  }

  let body: { pathname?: string; messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Richiesta non valida." }, { status: 400 });
  }

  const messages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ message: "Nessun messaggio ricevuto." }, { status: 400 });
  }

  const pageContext = body.pathname ? `\n\n[L'utente si trova sulla pagina: ${body.pathname}]` : "";

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 512,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + pageContext },
          ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("[plinio-assistant] Groq API error:", response.status, errText);
      return NextResponse.json(
        { message: "Non riesco a rispondere in questo momento. Scrivici su WhatsApp al +39 377 379 8570." },
        { status: 500 },
      );
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() || "";

    let parsed: {
      message?: string;
      suggested_prompts?: string[];
      handoff_recommended?: boolean;
      intent?: string | null;
      intent_data?: Record<string, string> | null;
    } = {};
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      parsed = { message: rawText };
    }

    let finalMessage = parsed.message?.trim() || rawText;
    let actionResult = null;

    // Don't re-trigger the same intent if it was already in the previous assistant message
    const lastAssistantMsg = messages.filter((m) => m.role === "assistant").at(-1)?.content || "";
    const intentAlreadyHandled =
      parsed.intent === "verify_payment" && lastAssistantMsg.includes("dettagli del pagamento") ||
      parsed.intent === "support_ticket" && lastAssistantMsg.includes("Ticket TK-") ||
      parsed.intent === "shipping_quote" && lastAssistantMsg.includes("Preventivo");

    // Handle verify_payment directly (no n8n needed)
    if (parsed.intent === "verify_payment" && !intentAlreadyHandled && parsed.intent_data?.code) {
      try {
        const code = parsed.intent_data.code.trim();
        const vpRes = await fetch("https://www.drop-point.store/api/verifica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bulletinId: code }),
        });
        const vpData = await vpRes.json();
        if (vpData.result === "ERROR" || (vpData.statusCode && vpData.statusCode !== 200)) {
          finalMessage = `Non ho trovato risultati per il codice "${code.toUpperCase()}". Controlla che sia corretto (lo trovi sulla ricevuta).`;
        } else {
          const p = vpData.data || vpData;
          const stato = p.status === "PAID" ? "✅ Pagato" : p.status === "SCHEDULED" ? "🕐 Programmato" : "⏳ Preso in carico";
          finalMessage = `Ecco i dettagli del pagamento ${code.toUpperCase()}:\n\nStato: ${stato}\n\nImporto: €${p.amount || "n/d"}\nCommissioni: €${p.fee || "n/d"}\nTotale: €${p.totalamount || "n/d"}\n\nBeneficiario: ${p.payee?.name || "n/d"}\nCausale: ${p.reason || p.causale || "n/d"}\n\nPagatore: ${p.payer?.name || "n/d"}\nData: ${p.operationInstant?.data || "n/d"} ${p.operationInstant?.ora || ""}${p.transactionInstant?.data ? "\nPagamento previsto: " + p.transactionInstant.data : ""}\n\nHai bisogno di altro?`;
        }
        actionResult = { action: "verify_payment", success: true };
      } catch {
        finalMessage = `Non sono riuscito a verificare il codice. Riprova o verifica su https://www.drop-point.store/verifica`;
      }
    }

    // Call n8n workflow for other intents
    const n8nActionUrl = process.env.N8N_PLINIO_ACTION_WEBHOOK_URL;
    if (parsed.intent && parsed.intent !== "verify_payment" && n8nActionUrl && !intentAlreadyHandled) {
      try {
        const lastUserMsg = messages.at(-1)?.content || "";
        const actionRes = await fetch(n8nActionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: parsed.intent,
            data: parsed.intent_data || {},
            user_message: lastUserMsg,
          }),
        });
        if (actionRes.ok) {
          actionResult = await actionRes.json();
          if (actionResult.message) {
            // For verify_payment and support_ticket with data, use ONLY n8n response
            if (parsed.intent === "verify_payment" || parsed.intent === "shipping_quote" || (parsed.intent === "support_ticket" && actionResult.success)) {
              finalMessage = actionResult.message;
            } else {
              finalMessage = `${finalMessage}\n\n${actionResult.message}`;
            }
          }
          // Send support ticket email to client
          if (actionResult.data?.sendEmail && actionResult.data?.email && actionResult.data?.ticketId) {
            const origin = request.headers.get("origin") || request.nextUrl.origin;
            fetch(`${origin}/api/contatti`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "Ticket " + actionResult.data.ticketId,
                email: actionResult.data.email,
                service: "Supporto - " + actionResult.data.ticketId,
                message: `Ticket: ${actionResult.data.ticketId}\nProblema: ${actionResult.data.issue}\nEmail cliente: ${actionResult.data.email}\n\nIl team risponderà entro 24 ore.`,
              }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("[plinio-assistant] n8n action error:", err);
      }
    }

    return NextResponse.json({
      message: finalMessage,
      suggested_prompts: Array.isArray(parsed.suggested_prompts) ? parsed.suggested_prompts : [],
      handoff_recommended: parsed.handoff_recommended ?? false,
      action: actionResult,
    });
  } catch (error) {
    console.error("[plinio-assistant] Errore Groq:", error);
    return NextResponse.json(
      { message: "Non riesco a rispondere in questo momento. Scrivici direttamente su WhatsApp al +39 377 379 8570." },
      { status: 500 },
    );
  }
}
