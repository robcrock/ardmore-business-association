# Ardmore Business Association

Rebuild of [ardmoreshops.com](https://www.ardmoreshops.com) as a Next.js 15 + Payload CMS 3 application.

## Quick start

```bash
cp .env.example .env
# edit DATABASE_URI, PAYLOAD_SECRET, optional FIRECRAWL_API_KEY / RESEND_API_KEY / S3_*

pnpm install
pnpm dev                # http://localhost:3000  + http://localhost:3000/admin
```

On first boot, Payload prompts you to create an admin user at `/admin`.

## Content migration

The legacy WordPress site is migrated in three steps:

```bash
pnpm migrate:scrape     # Firecrawl → migration-output/raw/*.json
pnpm migrate:normalize  # raw scrapes → manifest.json + downloaded assets
pnpm migrate:seed       # manifest → Payload (idempotent on slug)
```

After seeding, log into `/admin` and:

- review imported member profiles, fix any short descriptions or categories
- set event dates (legacy dates were freeform text)
- categorize sponsors by tier (gold/silver/bronze)
- mark featured members for the home page

## Stack

- **Next.js 15** App Router on Node 20+
- **Payload CMS 3** mounted at `/admin` and `/api` in the same app
- **Postgres** via `@payloadcms/db-postgres` (Neon / Supabase / Vercel Postgres)
- **S3-compatible storage** for media (Cloudflare R2 recommended); local disk in dev
- **Resend** for transactional email on form submissions
- **Tailwind v4** for styling

## Project layout

```
src/
  app/
    (marketing)/      Public site (home, members, events, news, sponsors, join)
    (payload)/        Admin UI + REST/GraphQL API
    actions/          Server actions (form submission)
  collections/        Payload collections
  globals/            Payload globals (site settings, navigation)
  components/         Shared React components
  lib/                payload client, helpers
  fields/             Reusable Payload field configs
scripts/
  migrate/            Firecrawl scraper + normalizer
  seed.ts             Payload seeder
```

## Adding content

ABA staff add events / posts / members at `/admin`. Pages cached for 5 minutes
via Next.js ISR; cache can be busted with a manual revalidate later if needed.
