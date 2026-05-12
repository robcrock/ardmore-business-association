/**
 * Step 2 of migration: read raw Firecrawl scrapes, extract structured records,
 * and download every referenced image into migration-output/assets/.
 *
 * Output: migration-output/manifest.json — the input to scripts/seed.ts.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const OUT = path.resolve('migration-output')
const RAW = path.join(OUT, 'raw')
const ASSETS = path.join(OUT, 'assets')

type RawDoc = {
  url: string
  kind: string
  file: string
}

type Manifest = {
  members: Array<MemberRecord>
  events: Array<EventRecord>
  posts: Array<PostRecord>
  sponsors: Array<SponsorRecord>
  about?: AboutRecord
  assets: Array<AssetRecord>
}

type AboutRecord = { title: string; body: string; heroAsset?: string; sourceUrl: string }

type AssetRecord = { sourceUrl: string; localPath: string; sha1: string }
type MemberRecord = {
  name: string
  slug: string
  sourceUrl: string
  shortDescription?: string
  longDescription?: string
  websiteUrl?: string
  heroAsset?: string
  galleryAssets?: string[]
}
type EventRecord = {
  title: string
  slug: string
  sourceUrl: string
  description?: string
  heroAsset?: string
  registrationUrl?: string
  rawDate?: string
}
type PostRecord = {
  title: string
  slug: string
  sourceUrl: string
  body?: string
  heroAsset?: string
}
type SponsorRecord = { name: string; sourceUrl?: string; logoAsset?: string; website?: string }

const slugFromUrl = (url: string) =>
  (new URL(url).pathname.replace(/^\/|\/$/g, '') || 'home').toLowerCase()

const sha1 = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12)

async function downloadAsset(srcUrl: string, manifestAssets: Map<string, AssetRecord>): Promise<string | undefined> {
  if (!srcUrl || srcUrl.startsWith('data:')) return undefined
  if (manifestAssets.has(srcUrl)) return manifestAssets.get(srcUrl)!.localPath
  try {
    const res = await fetch(srcUrl)
    if (!res.ok) return undefined
    const ext = path.extname(new URL(srcUrl).pathname).split('?')[0] || '.bin'
    const id = sha1(srcUrl)
    const localPath = path.join(ASSETS, `${id}${ext}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(localPath, buf)
    const rec: AssetRecord = { sourceUrl: srcUrl, localPath, sha1: id }
    manifestAssets.set(srcUrl, rec)
    return localPath
  } catch (e) {
    console.warn(`[asset] failed ${srcUrl}:`, (e as Error).message)
    return undefined
  }
}

// Pull all image URLs out of a markdown blob.
const IMG_RE = /!\[[^\]]*\]\((https?:[^)\s]+)\)/g
function extractImages(md: string): string[] {
  const set = new Set<string>()
  for (const m of md.matchAll(IMG_RE)) set.add(m[1])
  return [...set]
}

// First non-empty H1/H2.
function extractTitle(md: string, fallback: string): string {
  const lines = md.split('\n')
  for (const line of lines) {
    const m = /^#{1,3}\s+(.+)$/.exec(line.trim())
    if (m) return m[1].replace(/\*\*/g, '').trim()
  }
  return fallback
}

// Body text minus boilerplate (nav, footer).
function stripChrome(md: string): string {
  // Remove everything before the first H1.
  const h1 = md.indexOf('\n# ')
  let body = h1 > 0 ? md.slice(h1) : md
  // Cut at "Have A Question?" or "CONTACT US:" which is the footer form.
  for (const marker of ['Have A Question?', 'CONTACT US:', 'Blog insights']) {
    const idx = body.indexOf(marker)
    if (idx > 0) body = body.slice(0, idx)
  }
  return body.trim()
}

function extractWebsite(md: string): string | undefined {
  // Look for the "Visit their Website!" pattern.
  const m = /Visit their Website[^\(]*\(([^)]+)\)/.exec(md)
  if (m) return m[1]
  const cta = /\[Click Here\]\(([^)]+)\)/.exec(md)
  return cta?.[1]
}

function extractTicketLeap(md: string): string | undefined {
  const m = /\((https?:\/\/[^)]*ticketleap[^)]*)\)/i.exec(md)
  return m?.[1]
}

async function readRaw(file: string) {
  const raw = JSON.parse(await fs.readFile(path.join(RAW, file), 'utf8'))
  return raw.data as { markdown?: string; html?: string; links?: string[] }
}

async function main() {
  await fs.mkdir(ASSETS, { recursive: true })
  const idx: RawDoc[] = JSON.parse(await fs.readFile(path.join(OUT, 'url-index.json'), 'utf8'))

  // Build the member URL set from the /services/ index, the event URL set from /team/.
  const memberUrls = new Set<string>()
  const servicesEntry = idx.find((e) => e.kind === 'members-index')
  const RESERVED_PATHS = new Set([
    'about',
    'services',
    'team',
    'contact',
    'ardmore-day-sponsors',
    'product',
    'cart',
    'checkout',
    'my-account',
    'wp-content',
    'wp-admin',
    'wp-login.php',
    'feed',
  ])

  if (servicesEntry) {
    const r = await readRaw(servicesEntry.file)
    for (const l of r.links ?? []) {
      let u: URL
      try {
        u = new URL(l)
      } catch {
        continue
      }
      if (!u.hostname.endsWith('ardmoreshops.com')) continue
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length !== 1) continue
      if (RESERVED_PATHS.has(parts[0])) continue
      memberUrls.add(`https://${u.hostname}${u.pathname.endsWith('/') ? u.pathname : u.pathname + '/'}`)
    }
  }

  const manifest: Manifest = { members: [], events: [], posts: [], sponsors: [], assets: [] }
  const assetMap = new Map<string, AssetRecord>()

  for (const entry of idx) {
    const raw = await readRaw(entry.file)
    if (!raw?.markdown) continue
    const md = raw.markdown

    // Match with and without trailing slash.
    const entryAlt = entry.url.endsWith('/') ? entry.url.slice(0, -1) : entry.url + '/'
    if (memberUrls.has(entry.url) || memberUrls.has(entryAlt)) {
      const title = extractTitle(md, slugFromUrl(entry.url))
      const body = stripChrome(md)
      const images = extractImages(body)
      const hero = images[0] ? await downloadAsset(images[0], assetMap) : undefined
      const gallery: string[] = []
      for (const img of images.slice(1, 6)) {
        const p = await downloadAsset(img, assetMap)
        if (p) gallery.push(p)
      }
      // Short description: first non-heading paragraph.
      const para = body.split('\n').find((l) => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('!['))
      manifest.members.push({
        name: title,
        slug: slugFromUrl(entry.url),
        sourceUrl: entry.url,
        shortDescription: para?.trim().slice(0, 280),
        longDescription: body,
        websiteUrl: extractWebsite(md),
        heroAsset: hero,
        galleryAssets: gallery,
      })
    } else if (entry.kind === 'events-index') {
      // Treat each H2 section on the events index as a separate event record.
      // Only keep blocks that have both a hero image and substantial body text — the
      // /team/ page also splits "Date:", "Location:", "Reserve your spot", and footer
      // copyright into H2-ish chunks that aren't actual events.
      const EVENT_JUNK_PATTERNS = [
        /^date[:\s]/i,
        /am-\d/i,
        /^location[:\s]/i,
        /^reserve\b/i,
        /^contact\b/i,
        /^be a part\b/i,
        /^menu\b/i,
        /^\d{4}\b/, // "2026 Legit" copyright
      ]
      const blocks = md.split(/\n##\s+/).slice(1)
      for (const blk of blocks) {
        const lines = blk.split('\n')
        const title = lines[0].replace(/\*\*/g, '').trim()
        if (!title) continue
        if (EVENT_JUNK_PATTERNS.some((re) => re.test(title))) continue
        const body = '\n' + lines.slice(1).join('\n')
        const heroSrc = extractImages(body)[0]
        if (!heroSrc) continue // events without a hero image are usually section fragments
        if (body.replace(/\s+/g, ' ').trim().length < 120) continue
        const hero = await downloadAsset(heroSrc, assetMap)
        manifest.events.push({
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80),
          sourceUrl: entry.url,
          description: body,
          heroAsset: hero,
          registrationUrl: extractTicketLeap(body),
        })
      }
    } else if (entry.kind === 'sponsors') {
      // Each image with an adjacent name becomes a sponsor stub; staff can fill in tier/year.
      for (const img of extractImages(md)) {
        const local = await downloadAsset(img, assetMap)
        if (local) {
          manifest.sponsors.push({
            name: path.basename(img).replace(/[-_]/g, ' ').replace(/\.[^.]+$/, ''),
            sourceUrl: entry.url,
            logoAsset: local,
          })
        }
      }
    } else if (entry.kind === 'about') {
      const title = extractTitle(md, 'About the Ardmore Business Association')
      const body = stripChrome(md)
      const heroSrc = extractImages(body)[0]
      const hero = heroSrc ? await downloadAsset(heroSrc, assetMap) : undefined
      manifest.about = { title, body, heroAsset: hero, sourceUrl: entry.url }
    } else if (
      entry.kind !== 'home' &&
      entry.kind !== 'events-index' &&
      entry.kind !== 'members-index' &&
      entry.kind !== 'contact' &&
      !memberUrls.has(entry.url) &&
      !memberUrls.has(entryAlt)
    ) {
      // Anything left at depth-1 (or 'other') that isn't a member is a news post.
      const title = extractTitle(md, slugFromUrl(entry.url))
      const body = stripChrome(md)
      const heroSrc = extractImages(body)[0]
      const hero = heroSrc ? await downloadAsset(heroSrc, assetMap) : undefined
      manifest.posts.push({
        title,
        slug: slugFromUrl(entry.url),
        sourceUrl: entry.url,
        body,
        heroAsset: hero,
      })
    }
  }

  manifest.assets = [...assetMap.values()]
  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(
    `[normalize] members=${manifest.members.length} events=${manifest.events.length} posts=${manifest.posts.length} sponsors=${manifest.sponsors.length} assets=${manifest.assets.length}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
