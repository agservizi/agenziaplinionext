# Google Business Profile — checklist post-deploy

Callers: ops after SEO deploy. API: none (manual GBP dashboard). Schema: NAP from site-data.
User plan: “Docs operativi GBP: docs/GBP-CHECKLIST.md … esecuzione dashboard a carico tuo post-deploy”.

## NAP canonico

- **Nome:** AG SERVIZI (legal: AG SERVIZI VIA PLINIO 72 DI CAVALIERE CARMINE)
- **Indirizzo:** Via Plinio il Vecchio 72, 80053 Castellammare di Stabia (NA)
- **Telefono:** +39 377 379 8570
- **Email:** info@agenziaplinio.it
- **Sito:** https://agenziaplinio.it
- **Orari:** Lun–Ven 08:45–13:20 / 16:20–19:00 · Sab 09:20–12:30 · Dom chiuso

## Categorie

- Primaria: Agenzia di servizi / Multiservizi (o equivalente più vicino in GBP)
- Secondarie utili: Spedizioni / Point corriere, Consulenza telefonia/energia, Servizi digitali (se disponibili)

## Azioni

1. Verifica NAP identico a `src/lib/site-data.ts` e JSON-LD LocalBusiness.
2. Aggiorna orari se diversi dalla scheda.
3. Aggiungi link sito a `/recensioni` e `/lascia-un-feedback` nei link/menu GBP se supportato.
4. Piano update: foto sede, servizi top (SPID, spedizioni, deposito), post settimanali senza incentive stelle.
5. QR stampa: `public/qr-google-recensione.svg` → scheda Maps.

## Policy

Nessun incentivo a stelle o sconti legati alle recensioni Google.
