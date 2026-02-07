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
```

> `NEXT_PUBLIC_GA_ID` è opzionale e serve solo se vuoi attivare Google Analytics dopo consenso.
> `NEXT_PUBLIC_SITE_URL` è l’URL pubblico del sito (usato per canonical, sitemap e Open Graph).
> `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` è opzionale per la verifica Search Console.

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
