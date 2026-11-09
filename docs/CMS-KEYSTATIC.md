# CMS Keystatic (editor sito)

Il sito pubblico legge i contenuti da `content/*.json` (schema in `keystatic.config.ts`).

## Editor

- UI Brutal: `/area-admin` (panoramica, home, impostazioni, servizi, FAQ, recensioni)
- Motore Keystatic: `/keystatic` (form avanzati / Markdoc)
- In locale i salvataggi da `/area-admin` scrivono su disco via `POST /api/cms/save`
- In produzione (GitHub mode) i salvataggi passano da Keystatic autenticato con write sul repo

## Dev

```bash
npm run dev
# apri http://localhost:3000/area-admin
# oppure http://localhost:3000/keystatic
```

Seed iniziale (da cataloghi TS):

```bash
npx tsx scripts/seed-keystatic-content.ts
```

## Produzione (GitHub storage)

1. Crea una GitHub App tramite il wizard Keystatic su `/keystatic` (storage github)
2. Imposta su Vercel:

```
KEYSTATIC_GITHUB_CLIENT_ID=
KEYSTATIC_GITHUB_CLIENT_SECRET=
KEYSTATIC_SECRET=
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=
KEYSTATIC_GITHUB_REPO=owner/repo
```

3. Gli editor devono avere **write** sul repository
4. Ogni salvataggio Keystatic crea un commit → Vercel ridistribuisce

## Cosa non è nel CMS

- Area clienti / Gestiio
- Listini MySQL (solo GET pubblici; CRUD admin rimosso)
- Shop Saleor (rimosso dal monorepo)
