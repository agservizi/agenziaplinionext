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
Di default il progetto gira in modalità server (API Next.js attive).
Per generare un export statico usa la variabile `NEXT_STATIC_EXPORT=true`.

Per il deploy su hosting statico:
1. Esegui `npm install`
2. Esegui `NEXT_STATIC_EXPORT=true npm run export`
3. Carica il contenuto della cartella `out` in `public_html`

Nota: in hosting statico le API server-side (`/api/*`) non sono disponibili. Endpoint come `/api/client-area/visure/openapi` richiedono deploy server (Node/Next runtime).

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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DIGITAL_DELIVERY_BASE_URL=
```

> `NEXT_PUBLIC_GA_ID` è opzionale e serve solo se vuoi attivare Google Analytics dopo consenso.
> `NEXT_PUBLIC_SITE_URL` è l’URL pubblico del sito (usato per canonical, sitemap e Open Graph).
> `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` è opzionale per la verifica Search Console.
> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` abilita il checkout carta nativo in pagina.
> `STRIPE_SECRET_KEY` viene usata dal backend per creare i `PaymentIntent` Stripe.
> `STRIPE_WEBHOOK_SECRET` valida i webhook Stripe (`payment_intent.succeeded`).
> `DIGITAL_DELIVERY_BASE_URL` è la base URL pubblica usata per i link download tokenizzati.
> `STORE_ADMIN_USER` e `STORE_ADMIN_PASSWORD` proteggono gli endpoint admin catalogo (Basic Auth).

## Checkout nativo (senza embed)

Il backend `booking-backend/server.js` espone:

- `GET /api/store/products`
- `GET /api/store/products/admin` (protetto Basic Auth)
- `POST /api/store/products/admin` (protetto Basic Auth)
- `POST /api/store/products/admin/delete` (protetto Basic Auth)
- `POST /api/payments/create-intent`
- `POST /api/payments/webhook`
- `GET /api/digital/download/:token`

Le pagine `/store` e `/checkout` caricano il catalogo runtime dal backend (`/api/store/products`).
I prodotti sono persistiti in MySQL (`store_products`) e validati lato backend prima della creazione del pagamento Stripe.

Esempio salvataggio prodotto (admin):

```bash
curl -u "$STORE_ADMIN_USER:$STORE_ADMIN_PASSWORD" \
	-X POST "https://agenziaplinio.it/api/store/products/admin" \
	-H "Content-Type: application/json" \
	-d '{
		"id":"spid",
		"name":"Attivazione SPID",
		"description":"Attivazione guidata SPID.",
		"priceLabel":"€29",
		"amountCents":2900,
		"currency":"eur",
		"checkoutUrl":"/checkout/?product=spid",
		"assetPath":"/downloads/spid-guida.pdf",
		"isActive":true,
		"sortOrder":10
	}'
```

Esempio eliminazione prodotto (admin):

```bash
curl -u "$STORE_ADMIN_USER:$STORE_ADMIN_PASSWORD" \
	-X POST "https://agenziaplinio.it/api/store/products/admin/delete" \
	-H "Content-Type: application/json" \
	-d '{"productId":"spid"}'
```

Per i prodotti digitali, il backend:

1. registra l'ordine dopo `payment_intent.succeeded`
2. genera un token download con scadenza e limite utilizzi
3. invia email al cliente con link sicuro
4. serve il file tramite endpoint tokenizzato

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
