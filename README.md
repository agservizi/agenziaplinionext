# AG SERVIZI – Sito istituzionale

Sito istituzionale professionale per AG SERVIZI, sviluppato con Next.js (App Router), UI moderna e palette dark con accento professionale.

## Stack
- Next.js (App Router)
- Tailwind CSS
- API routes (Next.js)
- MySQL (mysql2)

## Comandi principali

Avvio in sviluppo:

```
npm run dev
```

Build produzione:

```
npm run build
```

Export statico:

```
npm run export
```

## Export statico (Hostinger)
Il progetto è configurato con `output: "export"`, quindi la build genera la cartella `out`.

Per il deploy su hosting statico:
1. Esegui `npm install`
2. Esegui `npm run export`
3. Carica il contenuto della cartella `out` in `public_html`

Nota: le API server-side non sono disponibili in hosting statico. Il form contatti richiede un backend serverless o un endpoint esterno.

## Variabili d’ambiente
Crea un file `.env` con:

```
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
MYSQL_PORT=3306
RESEND_API_KEY=
RESEND_FROM=
RESEND_TO=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_PAYHIP_STORE_URL=
NEXT_PUBLIC_PAYHIP_CHECKOUT_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
PAYHIP_PRODUCTS_API_URL=
PAYHIP_WEBHOOK_SECRET=
```

> `NEXT_PUBLIC_GA_ID` è opzionale e serve solo se vuoi attivare Google Analytics dopo consenso.
> `NEXT_PUBLIC_SITE_URL` è l’URL pubblico del sito (usato per canonical, sitemap e Open Graph).
> `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` è opzionale per la verifica Search Console.
> `NEXT_PUBLIC_PAYHIP_STORE_URL` è l’URL pubblico del tuo store Payhip (apertura in nuova scheda).
> `NEXT_PUBLIC_PAYHIP_CHECKOUT_URL` è l’URL usato dalla pagina interna `/checkout` (raggiunta dall’icona carrello nella header).
> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` abilita il checkout carta nativo in pagina.
> `STRIPE_SECRET_KEY` viene usata dal backend per creare i `PaymentIntent` Stripe.
> `PAYHIP_PRODUCTS_API_URL` è opzionale (default `https://payhip.com/api/products`) e viene usato per sincronizzare il catalogo frontend dai prodotti Payhip.
> `PAYHIP_WEBHOOK_SECRET` protegge l’endpoint backend `/api/payhip/webhook` (consigliato).

## Checkout nativo (senza embed)

Il backend `booking-backend/server.js` espone:

- `POST /api/payments/create-intent`

La pagina `/checkout` usa Stripe Elements per il pagamento carta direttamente sul sito, mentre Payhip resta fonte catalogo prodotti.

## Webhook Payhip (ordini)

Il backend in `booking-backend/server.js` espone:

- `POST /api/payhip/webhook`
- `GET /api/payhip/health`

Configurazione consigliata su Payhip:

1. URL webhook: `https://TUO_BACKEND/api/payhip/webhook?secret=PAYHIP_WEBHOOK_SECRET`
2. Imposta lo stesso valore anche in `.env` alla voce `PAYHIP_WEBHOOK_SECRET`

Il backend salva i webhook in MySQL nella tabella `payhip_orders` (creata automaticamente al primo evento), con idempotenza su `external_id`.

## Database (log consensi cookie)
Per salvare i consensi cookie nel database MySQL, crea la tabella `consent_logs`:

```
CREATE TABLE consent_logs (
	id INT AUTO_INCREMENT PRIMARY KEY,
	consent_version VARCHAR(10) NOT NULL,
	consent_payload JSON NOT NULL,
	consent_date DATETIME NOT NULL,
	ip_address VARCHAR(64),
	user_agent VARCHAR(255)
);
```
