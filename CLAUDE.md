# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Production website for AG SERVIZI, a multi-service agency in Castellammare di Stabia (NA), Italy. Handles payments, telecom/energy consulting, shipping (BRT/InPost), digital identity (SPID, PEC, firma digitale), visure, CAF/patronato, and a web agency division.

## Commands

```bash
npm run dev           # Next.js dev server (port 3000)
npm run dev:backend   # Express booking backend (port 3001)
npm run dev:full      # Both frontend + backend + PHP (port 8089) concurrently
npm run build         # Production build (uses Webpack, not Turbopack)
npm run lint          # ESLint
npx tsc --noEmit      # Type check without emitting
npm run export        # Static HTML export for Hostinger (NEXT_STATIC_EXPORT=true)
npm run test:chat-coherence  # Test Plinio AI chat responses
```

## Architecture

**Dual-backend system:**
- **Next.js 16 App Router** (frontend + API routes) deployed on Vercel
- **Express.js server** (`booking-backend/server.js`, port 3001) handles Google Calendar booking, MySQL operations, Stripe/PayHip webhooks, and auth token generation
- **PHP API layer** (legacy, port 8089) proxied via 50+ rewrites in `next.config.ts`

**Authentication has two separate portals:**
- Client portal (`/area-clienti`): JWT tokens in localStorage (`ag:client-portal-token`), backed by `client_portal_users` MySQL table. Auth logic in `src/lib/client-portal-auth.ts`. Route protection via `ClientPortalGuard` component.
- Admin portal (`/area-admin`): environment-only credentials (`STORE_ADMIN_USER`/`STORE_ADMIN_PASSWORD`), token in localStorage (`ag:admin-portal-token`). Auth logic in `src/lib/admin-portal-auth.ts`. Route protection via `AdminPortalGuard` component.
- Neither portal uses NextAuth for actual session management; NextAuth (`src/auth.ts`) is configured but secondary.

**Service catalog pattern:** Each service category (phone, energy, digital, payment, logistics, web-agency) has a catalog file in `src/lib/` exporting typed arrays with slugs, descriptions, benefits, and required docs. These feed into dynamic route pages at `src/app/servizi/[category]/[slug]/page.tsx`.

**Pricing engine:** Shipping, visure, and CAF/patronato have dynamic pricing stored in MySQL tables (`shipping_pricing_rules`, `visure_pricing_rules`, `caf_patronato_pricing_rules`) with admin CRUD via the admin portal. Public pricing is fetched client-side from the Express backend.

**Payment flow:** Client selects service -> Stripe Checkout session created server-side (`src/lib/stripe-checkout.ts`) -> redirect to Stripe -> webhook/verify confirms payment -> request stored in `client_area_requests` with linked `client_area_payments` record.

## Key conventions

- All user-facing text is in Italian. Copy should sound natural and conversational, not corporate or AI-generated.
- Path alias `@/*` maps to `./src/*`.
- TailwindCSS v4 with PostCSS plugin (no tailwind.config file, configured via `@tailwindcss/postcss`).
- Framer Motion for all animations. Components using motion must have `"use client"` directive. Always support `useReducedMotion()` for accessibility.
- Brand colors: primary purple `#5E0ED7`, accent cyan `#22d3ee`.
- API routes that proxy to the Express backend use `NEXT_PUBLIC_BOOKING_API_BASE` (production) or `BOOKING_BACKEND_URL` (local, defaults to `http://localhost:3001`).
- The `booking-backend/server.js` auto-creates MySQL tables on first query; no migration files exist.
- Static export mode (`NEXT_STATIC_EXPORT=true`) disables all API routes and rewrites.

## Database

MySQL at remote host. Connection pool in `src/lib/db.ts` (limit 10). Key tables: `client_portal_users`, `client_area_requests`, `client_area_shipments`, `client_area_payments`, `client_area_invoices`, `booking_requests`, `shipping_pricing_rules`, `visure_pricing_rules`, `consent_logs`.

## External integrations

Stripe (payments), Resend (email), Google Calendar (booking), Groq/Anthropic (AI chat), BRT (shipping), InPost (lockers), OpenAPI Visure (document retrieval), n8n (workflow webhooks), PayHip (digital products).
