import type { Media } from '@/payload-types'

type MaybeMedia = number | string | Media | null | undefined

export const mediaUrl = (m: MaybeMedia, size?: 'thumbnail' | 'card' | 'hero') => {
  if (!m || typeof m === 'number' || typeof m === 'string') return undefined
  const sized = size && m.sizes?.[size]?.url
  return sized || m.url || undefined
}

export const mediaAlt = (m: MaybeMedia, fallback = '') => {
  if (!m || typeof m === 'number' || typeof m === 'string') return fallback
  return m.alt || fallback
}
