import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { EmptyState } from '@/components/ui/empty-state'

export const revalidate = 300
export const metadata = { title: 'Sponsors' }

const TIERS = [
  {
    key: 'title',
    label: 'Title sponsors',
    description:
      'Our headline partners — the businesses whose generosity makes Ardmore Day, the Easter Egg Hunt, and our biggest community events possible.',
    size: 'xl',
    cols: 'sm:grid-cols-2',
  },
  {
    key: 'gold',
    label: 'Gold',
    description: 'Marquee supporters of seasonal events and member programs.',
    size: 'lg',
    cols: 'sm:grid-cols-2 lg:grid-cols-3',
  },
  {
    key: 'silver',
    label: 'Silver',
    description: 'Loyal sustaining partners across the year.',
    size: 'md',
    cols: 'sm:grid-cols-3 lg:grid-cols-4',
  },
  {
    key: 'bronze',
    label: 'Bronze',
    description: 'Friends of the Association.',
    size: 'sm',
    cols: 'sm:grid-cols-3 lg:grid-cols-5',
  },
  {
    key: 'community',
    label: 'Community',
    description: 'Neighbors, vendors, and individuals who chipped in.',
    size: 'sm',
    cols: 'sm:grid-cols-3 lg:grid-cols-5',
  },
] as const

const SIZE_TO_RATIO: Record<'xl' | 'lg' | 'md' | 'sm', string> = {
  xl: 'aspect-[16/9]',
  lg: 'aspect-[4/3]',
  md: 'aspect-[4/3]',
  sm: 'aspect-[3/2]',
}

export default async function SponsorsPage() {
  const payload = await getPayloadClient()
  const sponsors = await payload.find({
    collection: 'sponsors',
    limit: 500,
    sort: 'name',
  })

  const byTier: Record<string, typeof sponsors.docs> = {}
  for (const s of sponsors.docs) {
    const k = (s.tier as string) ?? 'community'
    byTier[k] = byTier[k] ?? []
    byTier[k].push(s)
  }

  const hasAny = sponsors.docs.length > 0

  return (
    <Container className="py-14 md:py-20">
      <header className="mb-14 max-w-3xl">
        <Eyebrow tone="accent">With gratitude</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          The businesses that keep Ardmore moving
        </h1>
        <p className="mt-4 text-lg text-ink-muted text-pretty">
          Our events, programs, and community initiatives are made possible by
          the sponsors below. If you’d like to join them,{' '}
          <a href="mailto:hello@ardmoreshops.com" className="text-accent underline underline-offset-4">
            get in touch
          </a>
          .
        </p>
      </header>

      {!hasAny ? (
        <EmptyState
          title="Sponsor list coming soon"
          description="We’re confirming this year’s partners — check back shortly."
        />
      ) : (
        <div className="space-y-20">
          {TIERS.map((tier) => {
            const list = byTier[tier.key]
            if (!list?.length) return null
            return (
              <section key={tier.key}>
                <div className="mb-8 max-w-2xl">
                  <Eyebrow>{tier.label}</Eyebrow>
                  <p className="mt-2 text-base text-ink-muted">{tier.description}</p>
                </div>
                <ul
                  role="list"
                  className={`grid gap-5 grid-cols-2 ${tier.cols}`}
                >
                  {list.map((s) => {
                    const url = mediaUrl(s.logo, 'card')
                    const tile = (
                      <div
                        className={`${SIZE_TO_RATIO[tier.size]} bg-surface ring-1 ring-line rounded-md grid place-items-center p-6 transition-colors hover:ring-line-strong`}
                      >
                        {url ? (
                          <Image
                            src={url}
                            alt={s.name}
                            width={240}
                            height={120}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-center text-sm font-display tracking-tight">
                            {s.name}
                          </span>
                        )}
                      </div>
                    )
                    return (
                      <li key={s.id}>
                        {s.website ? (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={s.name}
                          >
                            {tile}
                          </a>
                        ) : (
                          tile
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </Container>
  )
}
