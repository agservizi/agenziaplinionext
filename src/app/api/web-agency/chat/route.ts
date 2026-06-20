import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Gap 5: Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function buildSystemPrompt(plan: string) {
  return `Sei il consulente commerciale di AG SERVIZI Web Agency a Castellammare di Stabia (NA). Il cliente è interessato al piano "${plan}". Devi guidare una conversazione professionale per raccogliere tutte le informazioni necessarie a preparare un preventivo personalizzato.

## I NOSTRI PIANI (dettagli esatti)

### Landing — "Parti veloce" | Prezzo: Su misura
Una pagina ad alto impatto per acquisire contatti o vendere un servizio specifico.
Features incluse:
- Design custom
- SEO on-page
- Form di contatto
- Mobile-first
- Consegna in 10 gg

### Sito Web — "Il più scelto" (più richiesto) | Prezzo: Su misura
Sito completo con più pagine, design system, CMS e ottimizzazione SEO avanzata.
Features incluse:
- Fino a 8 pagine
- Design system
- CMS integrato
- SEO avanzato
- Analytics
- Consegna in 21 gg

### Piattaforma — "Progetto avanzato" | Prezzo: Preventivo
E-commerce, gestionale su misura o piattaforma complessa con funzionalità custom.
Features incluse:
- Architettura custom
- Integrazioni API
- Dashboard admin
- Performance 90+
- Supporto dedicato

## STACK TECNOLOGICO
Next.js, React, TypeScript, TailwindCSS, PostgreSQL, MUI, Vercel, Node.js

## COSA RACCOGLIERE (una domanda alla volta)
1. Descrizione del progetto — cosa fa l'azienda/attività del cliente, cosa vuole ottenere col sito
2. Funzionalità specifiche — oltre a quelle incluse nel piano, ne servono altre? (es. e-commerce, prenotazioni, area riservata, blog, multilingua)
3. Contenuti — il cliente ha già testi, foto, logo oppure serve supporto creativo?
4. Budget indicativo — 1-3k / 3-7k / 7-15k / 15k+
5. Tempistiche — urgente, 1-2 mesi, da pianificare
6. Nome completo del cliente
7. Email di contatto
8. Telefono (facoltativo)

## REGOLE IMPORTANTI
- Rispondi SEMPRE in italiano
- Massimo 2-3 frasi per messaggio, tono professionale ma caloroso
- Fai UNA domanda alla volta — non sommergere il cliente
- Quando il cliente descrive il progetto, suggerisci funzionalità pertinenti (es. per un ristorante suggerisci menù digitale e prenotazione tavoli)
- Menziona le features incluse nel piano scelto quando pertinente
- NON dare prezzi esatti — di' sempre "su misura" o "lo definiremo nel preventivo"
- Se il cliente chiede tempi, riferisci quelli del piano (10gg Landing, 21gg Sito Web, da concordare Piattaforma)
- Quando hai raccolto ALMENO: nome + email + descrizione progetto + budget → rispondi con lead_ready: true

## FORMATO RISPOSTA (JSON obbligatorio)
Senza lead:
{"message":"testo risposta","lead_ready":false,"lead_data":null}

Con lead completo:
{"message":"Perfetto! Ho tutte le informazioni. Riceverai a breve un riepilogo personalizzato via email con i prossimi passi. Grazie per aver scelto AG SERVIZI!","lead_ready":true,"lead_data":{"name":"nome","email":"email","phone":"telefono o null","plan":"${plan}","project":"descrizione progetto","budget":"budget","timeline":"tempistiche"}}`;
}

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

async function callGroq(plan: string, messages: IncomingMessage[], groqKey: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      temperature: 0.7,
      messages: [
        { role: "system", content: buildSystemPrompt(plan) },
        ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Groq ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function parseResponse(rawText: string) {
  let parsed: { message?: string; lead_ready?: boolean; lead_data?: Record<string, string> | null } = {};
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { message: rawText };
  }
  return {
    message: parsed.message?.trim() || rawText,
    lead_ready: parsed.lead_ready ?? false,
    lead_data: parsed.lead_data ?? null,
  };
}

// Gap 7: Save conversation to DB
async function saveConversation(
  plan: string,
  messages: IncomingMessage[],
  leadData: Record<string, string> | null,
) {
  try {
    const pool = getPool();
    const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const name = leadData?.name || "Anonimo";
    const email = leadData?.email || "";

    await pool.execute(
      "INSERT INTO contact_requests (name, email, service, message) VALUES (?, ?, ?, ?)",
      [
        name,
        email,
        `Web Agency Chat - ${plan}`,
        `Lead data: ${JSON.stringify(leadData || {})}\n\nConversazione:\n${conversationText}`,
      ],
    );
  } catch (err) {
    console.error("[web-agency-chat] DB save error:", err);
  }
}

// Gap 6: Send quote email when lead is ready
async function sendQuoteEmail(
  leadData: Record<string, string>,
  conversation: string,
  origin: string,
) {
  try {
    await fetch(`${origin}/api/web-agency/send-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        plan: leadData.plan,
        project: leadData.project,
        budget: leadData.budget,
        timeline: leadData.timeline,
        conversation,
      }),
    });
  } catch (err) {
    console.error("[web-agency-chat] Quote email error:", err);
  }
}

export async function POST(request: NextRequest) {
  // Gap 5: Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Troppe richieste. Riprova tra un minuto." },
      { status: 429 },
    );
  }

  const n8nWebhookUrl = process.env.N8N_WEB_AGENCY_WEBHOOK_URL;
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey && !n8nWebhookUrl) {
    return NextResponse.json(
      { message: "Servizio temporaneamente non disponibile. Contattaci su WhatsApp al +39 377 379 8570." },
      { status: 503 },
    );
  }

  let body: { plan?: string; messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Richiesta non valida." }, { status: 400 });
  }

  const plan = body.plan || "Sito Web";
  const messages: IncomingMessage[] = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ message: "Nessun messaggio ricevuto." }, { status: 400 });
  }

  let rawText = "";

  // Try n8n first, fallback to direct Groq
  if (n8nWebhookUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, messages: messages.slice(-12) }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const result = {
          message: data.message || "",
          lead_ready: data.lead_ready || false,
          lead_data: data.lead_data || null,
        };

        // Gap 6+7: Save and send quote on lead ready
        if (result.lead_ready && result.lead_data) {
          const conversation = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
          await saveConversation(plan, messages, result.lead_data);
          const origin = request.headers.get("origin") || request.nextUrl.origin;
          sendQuoteEmail(result.lead_data, conversation, origin);
        }

        return NextResponse.json(result);
      }
    } catch {
      // fallback to direct Groq
    }
  }

  // Direct Groq path
  if (!groqKey) {
    return NextResponse.json(
      { message: "Non riesco a rispondere. Scrivici su WhatsApp al +39 377 379 8570." },
      { status: 500 },
    );
  }

  try {
    rawText = await callGroq(plan, messages, groqKey);
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        message: isTimeout
          ? "La risposta sta impiegando troppo. Riprova."
          : "Non riesco a rispondere. Scrivici su WhatsApp al +39 377 379 8570.",
      },
      { status: 500 },
    );
  }

  const result = parseResponse(rawText);

  // Gap 6+7: Save and send quote on lead ready
  if (result.lead_ready && result.lead_data) {
    const conversation = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    await saveConversation(plan, messages, result.lead_data);
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    sendQuoteEmail(result.lead_data, conversation, origin);
  }

  return NextResponse.json(result);
}
