import assert from "node:assert/strict";
import { clientFallbackReply } from "../src/lib/plinio-chat-fallback.mjs";

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("energia follow-up non devia su tracking", () => {
  const history = [
    { role: "assistant", content: "Ciao, sono Plinio Assistant." },
    { role: "user", content: "Fate attivazioni luce e gas?" },
    { role: "assistant", content: "Si, offriamo consulenza luce e gas. In genere servono documento, codice fiscale e ultima bolletta utile." },
  ];
  const reply = clientFallbackReply("quali gestori?", history);

  assert.match(reply.toLowerCase(), /(luce e gas|fornitore|consumi|pod|pdr)/);
  assert.doesNotMatch(reply.toLowerCase(), /(tracking|corriere|traccia|codice tracking)/);
});

run("telefonia follow-up resta in telefonia", () => {
  const history = [
    { role: "assistant", content: "Ciao, sono Plinio Assistant." },
    { role: "user", content: "Mi aiuti a scegliere tra WindTre, Fastweb e Iliad?" },
    { role: "assistant", content: "Certo, possiamo confrontare gli operatori in base a copertura e budget." },
  ];
  const reply = clientFallbackReply("quali gestori?", history);

  assert.match(reply, /(WindTre|Fastweb|Iliad)/);
  assert.doesNotMatch(reply.toLowerCase(), /(tracking|corriere|spedizion)/);
});

run("tracking esplicito produce risposta tracking", () => {
  const reply = clientFallbackReply("Traccia BRT 123456789", []);
  assert.match(reply, /(BRT|tracking|spedizione)/i);
});

run("solo quando richiesto continua il flow tracking", () => {
  const history = [
    { role: "assistant", content: "Per procedere con il tracking, scrivimi direttamente: corriere + codice." },
  ];
  const reply = clientFallbackReply("ok", history);
  assert.match(reply.toLowerCase(), /(tracking|corriere|codice)/);
});

run("beneficiari: follow-up pagabilita resta coerente", () => {
  const history = [
    {
      role: "assistant",
      content:
        'Da verifica elenco beneficiari bollettini, "enel energia" risulta presente. In linea generale il bollettino puo essere pagato in agenzia. Conferma finale operativa al momento del pagamento.',
    },
  ];
  const reply = clientFallbackReply("quindi posso pagarlo da voi?", history);
  assert.match(reply.toLowerCase(), /(pagarlo|pagare|agenzia|conferma finale operativa)/);
  assert.doesNotMatch(reply.toLowerCase(), /(pod|pdr|fornitore|luce e gas)/);
});

run("cambio argomento esplicito resetta il focus", () => {
  const history = [
    { role: "assistant", content: "Si, in linea generale puoi pagarlo in agenzia. Conferma finale operativa al momento del pagamento." },
  ];
  const reply = clientFallbackReply("possiamo parlare di altro?", history);
  assert.match(reply.toLowerCase(), /(cambiamo argomento|quale servizio ti interessa)/);
});

run("richiesta breve ambigua chiede chiarimento servizio", () => {
  const reply = clientFallbackReply("ok", []);
  assert.match(reply.toLowerCase(), /(indica|ambito|servizio|pagamenti|telefonia|spedizioni)/);
});

console.log("All chat coherence checks passed.");
