import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { MEMBERSHIP_BENEFITS } from '@/lib/constants'
import { Section, SectionHeader } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Monogram } from '@/components/ui/monogram'

export const revalidate = 300

export default async function HomePage() {
  const payload = await getPayloadClient()
  const now = new Date().toISOString()

  const [featured, upcoming, recent, allMembers, sponsorRes, eventCount] =
    await Promise.all([
      payload.find({
        collection: 'members',
        where: { featured: { equals: true } },
        limit: 6,
        sort: 'order',
      }),
      payload.find({
        collection: 'events',
        where: { startDateTime: { greater_than_equal: now } },
        sort: 'startDateTime',
        limit: 3,
      }),
      payload.find({ collection: 'posts', limit: 3, sort: '-publishedAt' }),
      payload.find({ collection: 'members', limit: 0 }),
      payload.find({
        collection: 'sponsors',
        where: { tier: { in: ['title', 'gold'] } },
        limit: 12,
        sort: 'name',
      }),
      payload.count({ collection: 'events' }),
    ])

  const memberTotal = allMembers.totalDocs
  const featuredDocs = featured.docs.length ? featured.docs : null

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <Container className="pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <Eyebrow tone="accent">Established 1951 · Ardmore, PA</Eyebrow>
            <h1 className="mt-5 font-display text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.02] text-balance">
              The merchants, makers, and neighbors{' '}
              <em className="not-italic text-accent">of Ardmore.</em>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-muted max-w-xl text-pretty">
              A community of independent shops, restaurants, and service providers
              keeping downtown one of the Main Line’s most distinctive places to
              live, work, and shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/join" size="lg">
                Become a member
              </Button>
              <Button href="/members" size="lg" variant="secondary">
                Browse the directory
              </Button>
            </div>
          </div>

          {featuredDocs && featuredDocs.length >= 2 && (
            <div className="lg:col-span-5">
              <HeroCollage members={featuredDocs.slice(0, 4)} />
            </div>
          )}
        </Container>

        {/* Stats strip */}
        <div className="border-t border-line bg-surface/60">
          <Container className="py-6 md:py-8">
            <ul
              role="list"
              className="mx-auto max-w-3xl grid grid-cols-3 divide-x divide-line text-center"
            >
              <Stat label="Members" value={memberTotal} />
              <Stat label="Years in service" value={new Date().getFullYear() - 1951} />
              <Stat label="Events on the calendar" value={eventCount.totalDocs} />
            </ul>
          </Container>
        </div>
      </section>

      {/* Featured members */}
      {featuredDocs && (
        <Section size="lg">
          <SectionHeader
            eyebrow="Featured this season"
            title="Worth a visit"
            description="A handful of members our neighbors keep coming back to."
            action={
              <Button href="/members" variant="link">
                See all members <ArrowRight className="size-4" />
              </Button>
            }
          />
          <ul
            role="list"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredDocs.slice(0, 6).map((m) => {
              const url = mediaUrl(m.logo, 'card')
              const categories = Array.isArray(m.category) ? m.category : []
              const firstCategory = categories[0]
              const categoryName =
                typeof firstCategory === 'object' && firstCategory && 'name' in firstCategory
                  ? (firstCategory as { name: string }).name
                  : undefined
              return (
                <Card key={m.id} as="li" hover>
                  <Link href={`/members/${m.slug}`} className="block">
                    <div className="relative aspect-[16/10] bg-paper">
                      {url ? (
                        <Image src={url} alt={m.name} fill className="object-cover" />
                      ) : (
                        <Monogram name={m.name} className="w-full h-full" />
                      )}
                    </div>
                    <div className="p-6">
                      {categoryName && (
                        <Badge tone="neutral" className="mb-3">
                          {categoryName}
                        </Badge>
                      )}
                      <h3 className="font-display text-2xl tracking-tight">{m.name}</h3>
                      {m.shortDescription && (
                        <p className="mt-2 text-sm text-ink-muted line-clamp-2">
                          {m.shortDescription}
                        </p>
                      )}
                    </div>
                  </Link>
                </Card>
              )
            })}
          </ul>
        </Section>
      )}

      {/* Upcoming events */}
      {upcoming.docs.length > 0 && (
        <Section size="lg" className="border-y border-line bg-surface/60">
          <SectionHeader
            eyebrow="On the calendar"
            title="What’s happening in Ardmore"
            action={
              <Button href="/events" variant="link">
                All events <ArrowRight className="size-4" />
              </Button>
            }
          />
          <ul role="list" className="grid gap-6 md:grid-cols-3">
            {upcoming.docs.map((e) => {
              const url = mediaUrl(e.heroImage, 'card')
              const dt = new Date(e.startDateTime)
              return (
                <Card key={e.id} as="li" hover>
                  <Link href={`/events/${e.slug}`} className="block">
                    {url && (
                      <div className="relative aspect-[16/10]">
                        <Image src={url} alt={e.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <Eyebrow tone="accent">
                        {dt.toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Eyebrow>
                      <h3 className="mt-2 font-display text-2xl tracking-tight">
                        {e.title}
                      </h3>
                      {e.location?.name && (
                        <p className="mt-1.5 text-sm text-ink-muted">
                          {e.location.name}
                        </p>
                      )}
                    </div>
                  </Link>
                </Card>
              )
            })}
          </ul>
        </Section>
      )}

      {/* News */}
      <Section size="lg">
        <SectionHeader
          eyebrow="Dispatches"
          title="From Lancaster Avenue"
          action={
            recent.docs.length > 0 ? (
              <Button href="/news" variant="link">
                All news <ArrowRight className="size-4" />
              </Button>
            ) : undefined
          }
        />
        {recent.docs.length === 0 ? (
          <EmptyState
            eyebrow="Coming soon"
            title="News from Main Street is on the way"
            description="We’re collecting stories from the businesses, neighbors, and events that make Ardmore worth a stop."
          />
        ) : (
          <ul role="list" className="grid gap-8 md:grid-cols-3">
            {recent.docs.map((p) => {
              const url = mediaUrl(p.heroImage, 'card')
              return (
                <li key={p.id}>
                  <Link href={`/news/${p.slug}`} className="group block">
                    {url && (
                      <div className="relative aspect-[16/10] rounded-md overflow-hidden ring-1 ring-line mb-4">
                        <Image
                          src={url}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                    {p.publishedAt && (
                      <Eyebrow>
                        {new Date(p.publishedAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Eyebrow>
                    )}
                    <h3 className="mt-2 font-display text-2xl tracking-tight group-hover:text-accent transition-colors">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-ink-muted line-clamp-3">
                        {p.excerpt}
                      </p>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {/* For business owners */}
      <Section size="lg" className="bg-ink text-paper">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <Eyebrow className="text-paper/60">For business owners</Eyebrow>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight text-balance">
              The shop next door is also your best ally.
            </h2>
            <p className="mt-5 text-paper/70 text-lg max-w-md text-pretty">
              ABA membership puts you in front of the customers already looking
              for what you do — and in the room with the owners who keep
              downtown moving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/join" variant="invert" size="lg">
                Apply for membership
              </Button>
              <Button
                href="/about"
                variant="link"
                className="text-paper hover:text-paper/80"
              >
                What we do <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
          <ul role="list" className="lg:col-span-7 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {MEMBERSHIP_BENEFITS.map((b) => (
              <li key={b.title}>
                <p className="font-display text-xl tracking-tight">{b.title}</p>
                <p className="mt-2 text-sm text-paper/70 text-pretty">
                  {b.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Sponsors strip */}
      {sponsorRes.docs.length > 0 && (
        <Section size="sm" className="border-t border-line">
          <div className="flex flex-col items-center gap-8">
            <Eyebrow>With thanks to our sponsors</Eyebrow>
            <ul role="list" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {sponsorRes.docs.slice(0, 8).map((s) => {
                const url = mediaUrl(s.logo, 'card')
                const inner = url ? (
                  <Image
                    src={url}
                    alt={s.name}
                    width={140}
                    height={56}
                    className="h-7 md:h-8 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="text-sm text-ink-muted">{s.name}</span>
                )
                return (
                  <li key={s.id}>
                    {s.website ? (
                      <a href={s.website} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </li>
                )
              })}
            </ul>
            <Button href="/sponsors" variant="link">
              All sponsors <ArrowRight className="size-4" />
            </Button>
          </div>
        </Section>
      )}
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="px-4 first:pl-0 last:pr-0">
      <p className="font-display text-3xl md:text-4xl tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 font-mono uppercase tracking-wide text-xs text-ink-muted">
        {label}
      </p>
    </li>
  )
}

function HeroCollage({
  members,
}: {
  members: { id: number | string; name: string; logo?: unknown }[]
}) {
  const tiles = members.slice(0, 4)
  if (tiles.length < 2) return null

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {tiles.map((m, idx) => {
          const url = mediaUrl(m.logo as Parameters<typeof mediaUrl>[0], 'card')
          return (
            <div
              key={m.id}
              className={`relative aspect-square rounded-md overflow-hidden ring-1 ring-line bg-surface ${
                idx === 0 ? 'translate-y-4' : idx === 3 ? '-translate-y-4' : ''
              }`}
            >
              {url ? (
                <Image src={url} alt={m.name} fill className="object-cover" />
              ) : (
                <Monogram name={m.name} className="w-full h-full" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
