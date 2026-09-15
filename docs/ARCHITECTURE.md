# Architecture — AG SERVIZI Dashboard + Commerce

## Overview

One product surface:

| Surface | Stack |
|---------|--------|
| Marketing site | Next.js App Router (this repo root) |
| `/shop` | Saleor **Paper** storefront in `storefront/` (`basePath: /shop`) + bridge PLP in root app |
| `/area-clienti` | Kiranism-style shell + httpOnly customer session |
| `/area-admin` | Kiranism-style shell + httpOnly staff session + Saleor BFF |

## Commerce

- **Source of truth:** Saleor Commerce **self-host on NAS** (Docker Compose in `docker/saleor/`)
- Docs: [`docs/saleor-nas.md`](saleor-nas.md)
- Payments shop: Stripe via Saleor payment apps
- Legacy servizi (spedizioni, visure, CAF…): existing Stripe Checkout

## Identity

- Single customer identity: `client_portal_users`
- Bridge table: `saleor_customer_links`
- Cookies: `ag_customer_session`, `ag_staff_session` (httpOnly, Secure in prod)
- Cutover: `/auth/bridge` syncs legacy localStorage tokens → cookies
- Middleware (`src/proxy.ts`) protects `/area-clienti/*` and `/area-admin/*`

## Security (max)

See plan §17. Highlights:

- Server-side RBAC (`CUSTOMER` / `OPERATOR` / `ADMIN` / `SUPERADMIN`)
- Anti-IDOR on customer resources
- Saleor `SALEOR_APP_TOKEN` server-only
- Webhooks fail closed without signature (`/api/webhooks/saleor`)
- Digital downloads: signed entitlements (`shop_digital_entitlements`)

## Home shop widget

`ShopHomeSection` renders only if Saleor returns `totalCount >= 1`. Uses shared `ShopProductCard` (same UI language as `/shop`).

## Area Admin inventory

Shop modules under `/area-admin/*` with BFF mutations (`/api/admin/shop/**`): prodotti create/publish/archive, categorie, inventario, coupon, ordini cancel/refund, entitlement revoke/reissue, plus gap legacy (clienti enable/disable/reset, registrazioni approve/reject, staff CRUD, impostazioni write).

## Area Clienti inventory

Shop post-acquisto + account actions: addresses CRUD, notification prefs write, signed downloads, forgot/reset password end-to-end. Orders mirrored from Saleor webhooks.

## Env (site)

```
NEXT_PUBLIC_SALEOR_API_URL=https://saleor.example/graphql/
NEXT_PUBLIC_SALEOR_CHANNEL=default-channel
SALEOR_APP_TOKEN=
SALEOR_WEBHOOK_SECRET=
CLIENT_PORTAL_SESSION_SECRET=
ADMIN_PORTAL_SESSION_SECRET=
NEXT_PUBLIC_SHOP_HOME_WIDGET=1
```

## Rollback

- Feature branch `feature/dashboard-commerce-integration`
- Disable shop widget: `NEXT_PUBLIC_SHOP_HOME_WIDGET=0`
- Auth dual-read via `/auth/bridge` until localStorage retired
