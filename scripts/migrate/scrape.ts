/**
 * Step 1 of migration: scrape ardmoreshops.com.
 *
 * - Discovers URLs by mapping the site AND parsing the /services (members)
 *   and /team (events) index pages directly (the WP sitemap returns empty).
 * - For each URL, hits Firecrawl /scrape (markdown + links + screenshot)
 *   and writes the raw response to migration-output/raw/<safeSlug>.json.
 * - Builds a master url-index.json for the normalize step.
 *
 * Usage: pnpm migrate:scrape
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { scrape, map } from './firecrawl'

const SITE = 'https://www.ardmoreshops.com'
const OUT = path.resolve('migration-output')
const RAW = path.join(OUT, 'raw')

const KNOWN_TOP_LEVEL = [
  '/',
  '/about/',
  '/services/',
  '/team/',
  '/contact/',
  '/ardmore-day-sponsors/',
]

function classify(url: string): 'home' | 'about' | 'members-index' | 'events-index' | 'sponsors' | 'contact' | 'member' | 'post' | 'other' {
  const p = new URL(url).pathname.replace(/\/$/, '')
  if (p === '' || p === '/') return 'home'
  if (p === '/about') return 'about'
  if (p === '/services') return 'members-index'
  if (p === '/team') return 'events-index'
  if (p === '/ardmore-day-sponsors') return 'sponsors'
  if (p === '/contact') return 'contact'
  // Heuristic: anything else at root depth 1 with a slug is a member or post.
  // The legacy site puts member profiles at /<slug>/ (e.g. /action-karate/).
  // Posts share the same pattern, so we'll disambiguate during normalize using
  // the index pages' link sets.
  if (p.split('/').filter(Boolean).length === 1) return 'member'
  return 'other'
}

const safeName = (url: string) =>
  new URL(url).pathname.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'home'

async function ensureDirs() {
  await fs.mkdir(RAW, { recursive: true })
  await fs.mkdir(path.join(OUT, 'assets'), { recursive: true })
}

async function discover(): Promise<string[]> {
  const found = new Set<string>(KNOWN_TOP_LEVEL.map((p) => SITE + p))

  // Try Firecrawl map (returns empty on this WP host but doesn't hurt).
  try {
    const m = await map(SITE, { limit: 1000 })
    for (const l of m.data.links ?? []) {
      const url = typeof l === 'string' ? l : l.url
      if (url?.startsWith(SITE)) found.add(url)
    }
  } catch (e) {
    console.warn('[discover] map failed (continuing):', (e as Error).message)
  }

  // Pull links from index pages.
  for (const indexPath of ['/services/', '/team/']) {
    const r = await scrape(SITE + indexPath, { formats: ['links'] })
    for (const l of r.data.links ?? []) {
      if (l.startsWith(SITE)) found.add(l)
    }
  }

  return [...found]
}

async function main() {
  await ensureDirs()
  const urls = await discover()
  console.log(`[scrape] discovered ${urls.length} URLs`)

  const index: Array<{ url: string; kind: string; file: string }> = []

  let i = 0
  for (const url of urls) {
    i++
    const kind = classify(url)
    const file = `${safeName(url)}.json`
    const outPath = path.join(RAW, file)
    try {
      const exists = await fs.stat(outPath).catch(() => null)
      if (exists) {
        console.log(`[${i}/${urls.length}] skip cached ${url}`)
      } else {
        console.log(`[${i}/${urls.length}] ${kind} ${url}`)
        const r = await scrape(url, {
          formats: ['markdown', 'links', 'html'],
          onlyMainContent: false,
        })
        await fs.writeFile(outPath, JSON.stringify(r, null, 2))
      }
      index.push({ url, kind, file })
    } catch (e) {
      console.warn(`[scrape] failed ${url}:`, (e as Error).message)
    }
  }

  await fs.writeFile(path.join(OUT, 'url-index.json'), JSON.stringify(index, null, 2))
  console.log(`[scrape] wrote ${index.length} entries to url-index.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
