# Saarathi Services

Production-ready luxury cleaning and property management website: **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Stripe Checkout**, **Hygraph** blog, **Supabase** (PostgreSQL) for bookings, **Resend** email, **Framer Motion**, **React Hook Form** + **Zod**.

## Prerequisites

- **Node.js** 18+ (20+ recommended for tooling).
- A **Supabase** project (free tier is fine).
- Accounts: [Stripe](https://stripe.com), [Hygraph](https://hygraph.com), [Resend](https://resend.com).

## Quick start

```bash
cp .env.example .env
# Edit .env with Supabase URL, service role key, Stripe, etc.

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Create the bookings table in Supabase

1. In [Supabase](https://supabase.com) → your project → **SQL Editor** → **New query**.
2. Paste the contents of **`supabase/migrations/001_bookings.sql`** and run it.

This creates the `bookings` table with **Row Level Security** enabled and **no** policies for `anon` / `authenticated` users, so only your **service role** key (used in Next.js API routes) can read/write. Do not put the service role key in client-side code.

## Environment variables

See `.env.example`. Minimum for bookings + payments:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — full DB access (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender |
| `NEXT_PUBLIC_HYGRAPH_ENDPOINT` | Hygraph Content API URL |
| `HYGRAPH_API_TOKEN` | Optional if API is public read |
| `ADMIN_SECRET` | Secret query param for `/admin/bookings` |

Optional: `ADMIN_NOTIFICATION_EMAIL` — overrides default admin booking emails.

**Security:** Never commit `.env`. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the browser.

## Database (Supabase)

- Table: **`bookings`** (see SQL migration).
- **Price** is stored in **pence** (integer, for Stripe GBP).
- View or edit rows in Supabase **Table Editor** (easy for non-developers).

## Stripe

1. **Checkout** is created in `/api/bookings` after a row is inserted in Supabase.
2. Webhook: **`/api/webhooks/stripe`**, event **`checkout.session.completed`**.
3. Set `STRIPE_WEBHOOK_SECRET` from the Stripe CLI or Dashboard.

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

On success, the webhook sets `payment_status` to **`paid`** and sends **Resend** emails (if configured).

## Hygraph CMS (blog)

Create model API ID **`BlogPost`** (GraphQL: **`blogPosts`** / **`blogPost`**). See table in the original spec or earlier commits for field list. Adjust `src/lib/hygraph-blog.ts` if your API IDs differ.

## Admin (hidden route)

**`/admin/bookings?secret=YOUR_ADMIN_SECRET`**

## Deploy on Vercel

1. Import the repo and set all env vars (including Supabase + Stripe + Resend).
2. `npm run build` — no Prisma step.
3. Add your production Stripe webhook URL.

## Project layout

| Path | Role |
|------|------|
| `src/app/` | Pages, API routes, `sitemap.ts`, `robots.ts` |
| `src/components/` | UI |
| `src/lib/` | Stripe, Resend, Hygraph, **Supabase server client** |
| `src/types/booking.ts` | Booking enums + row ↔ app mapping |
| `supabase/migrations/` | SQL to run in Supabase |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

**Saarathi Services** — Bangor LL57, UK · +44 7375 575049 · info@saarathiservices.co.uk
