# AG SERVIZI — Saleor Paper storefront

Vendored from [saleor/storefront](https://github.com/saleor/storefront) (Paper).

## Integration

- `basePath` default: `/shop` (see `next.config.js`)
- Brand: align tokens in `src/styles` with AG `#5E0ED7` / `#22d3ee`
- API: `NEXT_PUBLIC_SALEOR_API_URL` → NAS GraphQL
- Channel: `NEXT_PUBLIC_DEFAULT_CHANNEL` / `NEXT_PUBLIC_SALEOR_CHANNEL`

## Local

```bash
cd storefront
pnpm install
cp .env.example .env.local
# set SALEOR API URL + channel
pnpm dev
```

Deploy as separate Vercel project **or** monorepo app with path `/shop`.
The main marketing site also exposes a Saleor-powered PLP at `/shop` using shared `ShopProductCard` until the Paper app is wired on the same domain.
