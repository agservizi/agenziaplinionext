# Saleor self-host sul NAS (Docker)

Stack ufficiale adattato per AG SERVIZI. File: [`docker/saleor/docker-compose.yml`](../docker/saleor/docker-compose.yml).

## Prerequisiti

- NAS **oppure** PC con **Docker Desktop** (su questa macchina Windows Docker non risultava installato)
- Dominio/sottodominio HTTPS in produzione (es. `saleor.agenziaplinio.it`) via reverse proxy (NPM / Traefik / Caddy)
- Porte interne non esposte in chiaro su Internet (solo proxy HTTPS)

## Bootstrap secrets (PC di sviluppo)

Dal root del repo:

```bash
npm run saleor:bootstrap
```

Genera/aggiorna:

- `.env.local` — URL Saleor locale + session secrets portali
- `storefront/.env.local` — API/channel Paper
- `docker/saleor/.env` — password Postgres + `SECRET_KEY` (non committare)

## Deploy NAS AG (TerraMaster `192.168.1.50`)

Stack già installato in:

`/home/Carmine/apps/saleor`

Porte LAN (8000 era occupata da Supabase Kong):

| Servizio | URL |
|----------|-----|
| GraphQL API | http://192.168.1.50:8100/graphql/ |
| Dashboard | http://192.168.1.50:9100/ |

Comandi sul NAS:

```bash
ssh coresuite-server
cd /home/Carmine/apps/saleor
docker compose ps
docker compose logs -f api
```

Dopo `populatedb --createsuperuser` il superuser demo tipico è:

- email: `admin@example.com`
- password: `admin` (cambiala subito)

Poi in Dashboard → Apps → crea App token → metti `SALEOR_APP_TOKEN` in `.env.local` / Vercel.

Webhook (quando il sito pubblico è raggiungibile):

`https://agenziaplinio.it/api/webhooks/saleor`

## Deploy locale (Docker Desktop)

```bash
npm run saleor:bootstrap
cd docker/saleor
docker compose up -d
```

Attendi ~1–2 minuti (migrate), poi:

```bash
npm run test:smoke-saleor
```

Dashboard: http://localhost:9000 — API GraphQL: http://localhost:8000/graphql/

## Deploy NAS (produzione)

1. Copia cartella `docker/saleor` sul NAS (o `git pull` del repo).
2. Su NAS: `cp .env.example .env` e imposta password/`SECRET_KEY`/`PUBLIC_URL` HTTPS.
3. `docker compose up -d`
4. Reverse proxy:
   - `https://saleor.agenziaplinio.it` → `:8000`
   - `https://saleor-dashboard.agenziaplinio.it` → `:9000` (meglio VPN/IP allowlist)
5. Smoke:

```bash
curl -sS https://saleor.agenziaplinio.it/graphql/ \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ shop { name } }"}'
```

## Setup iniziale Saleor (obbligatorio una volta)

1. Dashboard → crea staff / first-run.
2. Channel **IT** slug `default-channel`, valuta **EUR**.
3. Product types: `PHYSICAL`, `DIGITAL`, `SERVICE`.
4. Installa Stripe payment app e configura chiavi live/test.
5. **Apps → Create App** con permessi catalogo/ordini/fulfillment → copia token.
6. Nel sito (Vercel + `.env.local`):

```
NEXT_PUBLIC_SALEOR_API_URL=https://saleor.agenziaplinio.it/graphql/
SALEOR_API_URL=https://saleor.agenziaplinio.it/graphql/
NEXT_PUBLIC_SALEOR_CHANNEL=default-channel
SALEOR_APP_TOKEN=...
SALEOR_WEBHOOK_SECRET=...   # stesso valore usato in webhook Saleor
```

7. Webhook Saleor → `https://agenziaplinio.it/api/webhooks/saleor`  
   Eventi: `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_FULLY_PAID` (signature HMAC).

## Smoke end-to-end

1. `/area-admin/prodotti` → crea prodotto → Pubblica  
2. Home: sezione Shop visibile se `totalCount >= 1`  
3. `/shop` → checkout  
4. Area Clienti → Ordini / Download (dopo webhook)

## Storefront Paper

```bash
npm run storefront:install
npm run storefront:dev
```

`basePath` default `/shop`. Finché Paper non è deployato sullo stesso dominio, il root app espone già PLP/PDP bridge su `/shop`.

## Sicurezza NAS

- Postgres/Redis **non** pubblicati su Internet
- Dashboard dietro auth forte / VPN / IP allowlist
- CORS allowlist solo domini AG + localhost
- Backup volume `saleor-db` schedulato
- Webhook fail-closed senza secret
