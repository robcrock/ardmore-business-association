import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://www.ardmoreshops.com'
  const payload = await getPayloadClient()

  const [members, events, posts] = await Promise.all([
    payload.find({ collection: 'members', limit: 1000, depth: 0 }),
    payload.find({ collection: 'events', limit: 1000, depth: 0 }),
    payload.find({ collection: 'posts', limit: 1000, depth: 0 }),
  ])

  const staticUrls = ['', 'about', 'members', 'events', 'news', 'sponsors', 'join'].map(
    (path) => ({ url: `${base}/${path}`.replace(/\/$/, ''), changeFrequency: 'weekly' as const }),
  )

  return [
    ...staticUrls,
    ...members.docs.map((m) => ({ url: `${base}/members/${m.slug}`, changeFrequency: 'monthly' as const })),
    ...events.docs.map((e) => ({ url: `${base}/events/${e.slug}`, changeFrequency: 'weekly' as const })),
    ...posts.docs.map((p) => ({ url: `${base}/news/${p.slug}`, changeFrequency: 'monthly' as const })),
  ]
}
