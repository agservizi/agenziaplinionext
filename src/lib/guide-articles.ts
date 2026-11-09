/**
 * Callers: /guide pages + sitemap + FaqJsonLd items.
 * User plan: SEO 100% guide hub.
 */
export type GuideFaq = { q: string; a: string };

export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  updatedLabel: string;
  sections: { h2: string; body: string[] }[];
  faqs: GuideFaq[];
};

export const guideArticles: GuideArticle[] = [
  {
    slug: "spid-documenti-tempi",
    title: "SPID: documenti e tempi a Castellammare di Stabia",
    description:
      "Cosa serve per attivare lo SPID in sede da AG SERVIZI, quanto ci vuole e quando conviene prenotare.",
    updatedLabel: "Aggiornato 2026",
    sections: [
      {
        h2: "Cosa serve per lo SPID",
        body: [
          "Porta un documento di identità valido, la tessera sanitaria/codice fiscale e un numero di cellulare e un’email che usi davvero.",
          "Se sei minorenne o servi una pratica particolare, chiedi prima: ti diciamo subito se possiamo procedere in giornata.",
        ],
      },
      {
        h2: "Quanto tempo ci vuole",
        body: [
          "In molti casi l’attivazione in sede si chiude in circa 20 minuti, se i dati sono corretti e l’identity provider risponde.",
          "Nei picchi (scadenze fiscali, inizio mese) può servire un’attesa breve: meglio prenotare su /prenota.",
        ],
      },
      {
        h2: "Dopo l’attivazione",
        body: [
          "Conserva le credenziali e verifica subito l’accesso all’app o al portale del provider.",
          "Se qualcosa non torna, torni in Via Plinio 72 o ci scrivi su WhatsApp: ti aiutiamo a sbloccare il primo accesso.",
        ],
      },
    ],
    faqs: [
      {
        q: "Serve appuntamento per lo SPID?",
        a: "Non sempre, ma prenotare evita attese. Puoi farlo online dalla pagina Prenota.",
      },
      {
        q: "Posso fare lo SPID senza CIE?",
        a: "Dipende dal provider e dai documenti disponibili. In sede verifichiamo subito cosa è accettato.",
      },
    ],
  },
  {
    slug: "pagopa-come-pagare",
    title: "PagoPA: come pagare a Castellammare senza stress",
    description:
      "Come funzionano bollettini PagoPA in agenzia, cosa portare e quando conviene passare da AG SERVIZI.",
    updatedLabel: "Aggiornato 2026",
    sections: [
      {
        h2: "Cosa puoi pagare",
        body: [
          "Avvisi PagoPA, multe, tributi e molti bollettini collegati alla piattaforma nazionale.",
          "Se non sei sicuro che sia PagoPA, porta l’avviso: lo riconosciamo e ti diciamo se possiamo pagarlo qui.",
        ],
      },
      {
        h2: "Cosa portare",
        body: [
          "Il codice avviso / IUV, l’importo e un documento se richiesto dall’ente.",
          "Avere l’email o lo smartphone aiuta per la ricevuta digitale.",
        ],
      },
      {
        h2: "Perché farlo in sede",
        body: [
          "Eviti errori di digitazione e hai qualcuno che controlla i dati con te.",
          "Se l’ente rifiuta o l’avviso è scaduto, te lo diciamo subito invece di lasciarti bloccato online.",
        ],
      },
    ],
    faqs: [
      {
        q: "Posso pagare PagoPA senza SPID?",
        a: "Sì, per molti avvisi basta il codice e il pagamento in sede. Lo SPID serve per altri servizi della PA, non sempre per il pagamento sportello.",
      },
      {
        q: "Ricevo una ricevuta?",
        a: "Sì, rilasciamo la ricevuta del pagamento effettuato.",
      },
    ],
  },
  {
    slug: "spedire-pacco-brt-inpost",
    title: "Spedire un pacco con BRT o InPost a Castellammare",
    description:
      "Come preparare un pacco, cosa dichiarare e come usiamo BRT e InPost da AG SERVIZI in Via Plinio 72.",
    updatedLabel: "Aggiornato 2026",
    sections: [
      {
        h2: "Prima di arrivare",
        body: [
          "Imballa bene il contenuto: il corriere può rifiutare colli aperti o fragili senza protezione.",
          "Tieni a portata destinatario completo (CAP, città, telefono) e un’idea di peso/dimensioni.",
        ],
      },
      {
        h2: "BRT e InPost: come scegliamo",
        body: [
          "In sede valutiamo destinazione, urgenza e tipo di collo. Non esiste un’unica tariffa magica: dipende da zona e servizio.",
          "Per i locker InPost serve un punto disponibile e dati corretti del destinatario.",
        ],
      },
      {
        h2: "Tracking e problemi",
        body: [
          "Dopo la spedizione ti resta il tracking. Se il pacco si ferma, puoi tornarci: verifichiamo lo stato e ti diciamo il passo successivo.",
          "Per fermo deposito o ritiri in sede usa anche i moduli online dedicati.",
        ],
      },
    ],
    faqs: [
      {
        q: "Posso spedire senza account area clienti?",
        a: "Sì, puoi passare in sede. L’area clienti aiuta se spedisci spesso o vuoi storico pratiche.",
      },
      {
        q: "Fate anche deposito bagagli?",
        a: "Sì: puoi prenotare online su /deposito-bagagli e lasciare le valigie in agenzia.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guideArticles.find((a) => a.slug === slug) ?? null;
}
