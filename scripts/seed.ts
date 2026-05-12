/**
 * Step 3 of migration: seed Payload from migration-output/manifest.json.
 *
 * Idempotent on slug — running twice is safe and will update existing records.
 *
 * Usage: pnpm migrate:seed
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const MANIFEST_PATH = path.resolve('migration-output/manifest.json')

type Manifest = {
  members: Array<{
    name: string
    slug: string
    sourceUrl: string
    shortDescription?: string
    longDescription?: string
    websiteUrl?: string
    heroAsset?: string
    galleryAssets?: string[]
  }>
  events: Array<{
    title: string
    slug: string
    sourceUrl: string
    description?: string
    heroAsset?: string
    registrationUrl?: string
  }>
  posts: Array<{ title: string; slug: string; sourceUrl: string; body?: string; heroAsset?: string }>
  sponsors: Array<{ name: string; sourceUrl?: string; logoAsset?: string; website?: string }>
  about?: { title: string; body: string; heroAsset?: string; sourceUrl: string }
  assets: Array<{ sourceUrl: string; localPath: string; sha1: string }>
}

// Parse plain text (with light markdown — headings, bullet lists) into Lexical state.
function textToLexical(text: string) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  const textNode = (t: string) => ({
    type: 'text', version: 1, text: t, format: 0, detail: 0, mode: 'normal', style: '',
  })
  const children = blocks.map((block) => {
    const heading = /^(#{1,6})\s+(.*)$/.exec(block)
    if (heading) {
      const level = Math.min(heading[1].length, 6)
      return {
        type: 'heading',
        tag: `h${level}`,
        version: 1, format: '', indent: 0, direction: null,
        children: [textNode(heading[2])],
      }
    }
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length > 0 && lines.every((l) => /^([-*])\s+/.test(l))) {
      return {
        type: 'list',
        tag: 'ul',
        listType: 'bullet',
        start: 1,
        version: 1, format: '', indent: 0, direction: null,
        children: lines.map((l) => ({
          type: 'listitem',
          version: 1, format: '', indent: 0, direction: null,
          value: 1,
          children: [textNode(l.replace(/^([-*])\s+/, ''))],
        })),
      }
    }
    return {
      type: 'paragraph',
      version: 1, format: '', indent: 0, direction: null,
      children: [textNode(block)],
    }
  })
  return {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: null,
      children,
    },
  }
}

async function upsertMedia(payload: Awaited<ReturnType<typeof getPayload>>, localPath: string, sourceUrl: string, alt: string) {
  // Use sourceUrl as a stable lookup key.
  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: sourceUrl } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]
  const filename = path.basename(localPath)
  const mimetype = guessMime(filename)
  if (!mimetype) {
    console.warn(`[seed] skip media (unknown type) ${localPath}`)
    return null
  }
  const data = await fs.readFile(localPath)
  try {
    return await payload.create({
      collection: 'media',
      data: { alt, sourceUrl },
      file: { data, mimetype, name: filename, size: data.length },
    })
  } catch (e) {
    console.warn(`[seed] media upload failed ${localPath}:`, (e as Error).message)
    return null
  }
}

function guessMime(name: string): string | null {
  const ext = name.toLowerCase().split('.').pop()
  return (
    { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', pdf: 'application/pdf' }[ext ?? ''] ??
    null
  )
}

async function upsertBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'members' | 'events' | 'posts',
  slug: string,
  data: Record<string, unknown>,
) {
  const r = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 })
  if (r.docs[0]) {
    return payload.update({ collection, id: r.docs[0].id, data } as never)
  }
  return payload.create({ collection, data: { ...data, slug } } as never)
}

async function main() {
  const manifest: Manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'))
  const payload = await getPayload({ config })

  for (const m of manifest.members) {
    const logo = m.heroAsset ? await upsertMedia(payload, m.heroAsset, m.sourceUrl + '#logo', m.name) : null
    const photos: { image: number | string }[] = []
    for (const a of m.galleryAssets ?? []) {
      const media = await upsertMedia(payload, a, `${m.sourceUrl}#${path.basename(a)}`, m.name)
      if (media) photos.push({ image: media.id })
    }
    await upsertBySlug(payload, 'members', m.slug, {
      name: m.name,
      shortDescription: m.shortDescription,
      longDescription: m.longDescription ? textToLexical(m.longDescription) : undefined,
      logo: logo?.id,
      photos,
      contact: { website: m.websiteUrl },
      sourceUrl: m.sourceUrl,
    })
    console.log(`[seed] member ${m.slug}`)
  }

  for (const e of manifest.events) {
    const hero = e.heroAsset ? await upsertMedia(payload, e.heroAsset, e.sourceUrl + '#' + e.slug, e.title) : null
    await upsertBySlug(payload, 'events', e.slug, {
      title: e.title,
      description: e.description ? textToLexical(e.description) : undefined,
      heroImage: hero?.id,
      registrationUrl: e.registrationUrl,
      // Date is left to staff to set in admin; legacy event pages used freeform dates.
      startDateTime: new Date().toISOString(),
      eventState: 'upcoming',
      sourceUrl: e.sourceUrl,
    })
    console.log(`[seed] event ${e.slug}`)
  }

  for (const p of manifest.posts) {
    const hero = p.heroAsset ? await upsertMedia(payload, p.heroAsset, p.sourceUrl + '#' + p.slug, p.title) : null
    await upsertBySlug(payload, 'posts', p.slug, {
      title: p.title,
      body: p.body ? textToLexical(p.body) : undefined,
      heroImage: hero?.id,
      sourceUrl: p.sourceUrl,
    })
    console.log(`[seed] post ${p.slug}`)
  }

  for (const s of manifest.sponsors) {
    const logo = s.logoAsset ? await upsertMedia(payload, s.logoAsset, s.logoAsset, s.name) : null
    const existing = await payload.find({ collection: 'sponsors', where: { name: { equals: s.name } }, limit: 1 })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'sponsors',
        id: existing.docs[0].id,
        data: { logo: logo?.id, website: s.website },
      })
    } else {
      await payload.create({
        collection: 'sponsors',
        data: { name: s.name, logo: logo?.id, website: s.website, tier: 'community' },
      })
    }
    console.log(`[seed] sponsor ${s.name}`)
  }

  if (manifest.about) {
    const a = manifest.about
    const hero = a.heroAsset ? await upsertMedia(payload, a.heroAsset, a.sourceUrl + '#hero', a.title) : null
    const blocks: Array<Record<string, unknown>> = []
    if (hero) {
      blocks.push({
        blockType: 'imageGrid',
        heading: a.title,
        images: [{ image: hero.id }],
      })
    }
    blocks.push({ blockType: 'richText', content: textToLexical(a.body) })
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'about' } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: { title: a.title, blocks } as never,
      })
    } else {
      await payload.create({
        collection: 'pages',
        data: { title: a.title, slug: 'about', blocks } as never,
      })
    }
    console.log('[seed] page about')
  }

  console.log('[seed] done')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
