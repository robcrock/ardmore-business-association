import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import type { Event } from '@/payload-types'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Card } from '@/components/ui/card'
import { LinkTabs } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/empty-state'

export const revalidate = 300
export const metadata = { title: 'Events' }

const UPCOMING_PAGE_SIZE = 12
const PAST_PAGE_SIZE = 24

type SearchParams = Promise<{ view?: string; page?: string }>

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const view = sp.view === 'past' ? 'past' : 'upcoming'
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const now = new Date().toISOString()

  const payload = await getPayloadClient()

  const [upcomingCount, pastCount] = await Promise.all([
    payload.count({
      collection: 'events',
      where: { startDateTime: { greater_than_equal: now } },
    }),
    payload.count({
      collection: 'events',
      where: { startDateTime: { less_than: now } },
    }),
  ])

  const result =
    view === 'past'
      ? await payload.find({
          collection: 'events',
          where: { startDateTime: { less_than: now } },
          sort: '-startDateTime',
          page,
          limit: PAST_PAGE_SIZE,
        })
      : await payload.find({
          collection: 'events',
          where: { startDateTime: { greater_than_equal: now } },
          sort: 'startDateTime',
          page,
          limit: UPCOMING_PAGE_SIZE,
        })

  return (
    <Container className="py-14 md:py-20">
      <header className="mb-10">
        <Eyebrow tone="accent">Events & happenings</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          What’s happening in Ardmore
        </h1>
        <p className="mt-4 text-lg text-ink-muted max-w-2xl text-pretty">
          Seasonal events, member open houses, and the monthly Coffee & Conversation
          that keeps downtown moving.
        </p>
      </header>

      <div className="mb-10">
        <LinkTabs
          basePath="/events"
          param="view"
          active={view}
          items={[
            { label: 'Upcoming', value: 'upcoming', count: upcomingCount.totalDocs },
            { label: 'Past', value: 'past', count: pastCount.totalDocs },
          ]}
        />
      </div>

      {result.docs.length === 0 ? (
        <EmptyState
          title={view === 'upcoming' ? 'No upcoming events yet' : 'No past events on record'}
          description={
            view === 'upcoming'
              ? "The calendar is being shaped — check back soon, or subscribe in the footer to be the first to hear."
              : 'Once events have come and gone, they will live here.'
          }
        />
      ) : view === 'upcoming' ? (
        <ul role="list" className="grid gap-6 md:grid-cols-2">
          {result.docs.map((e) => (
            <UpcomingEventCard key={e.id} event={e} />
          ))}
        </ul>
      ) : (
        <ul
          role="list"
          className="divide-y divide-line border-y border-line"
        >
          {result.docs.map((e) => (
            <li key={e.id} className="py-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <Link
                href={`/events/${e.slug}`}
                className="font-display text-xl tracking-tight hover:text-accent transition-colors"
              >
                {e.title}
              </Link>
              <div className="flex items-center gap-3 text-sm text-ink-muted tabular-nums">
                {e.location?.name && (
                  <span className="hidden sm:inline">{e.location.name}</span>
                )}
                <span>
                  {new Date(e.startDateTime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        basePath="/events"
        page={page}
        totalPages={result.totalPages}
        searchParams={{ view: view === 'upcoming' ? undefined : 'past' }}
      />
    </Container>
  )
}

function UpcomingEventCard({ event }: { event: Event }) {
  const url = mediaUrl(event.heroImage, 'card')
  const dt = new Date(event.startDateTime)
  const month = dt.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()
  const day = dt.getDate()

  return (
    <Card as="li" hover>
      <Link href={`/events/${event.slug}`} className="flex h-full">
        <div className="flex flex-col items-center justify-center w-24 shrink-0 bg-ink text-paper py-6 px-4">
          <span className="font-mono uppercase tracking-wide text-xs text-paper/70">
            {month}
          </span>
          <span className="font-display text-4xl tracking-tight tabular-nums">
            {day}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {url && (
            <div className="relative aspect-[16/9] hidden sm:block">
              <Image src={url} alt={event.title} fill className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <h3 className="font-display text-2xl tracking-tight">{event.title}</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              {dt.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              {event.location?.name ? ` · ${event.location.name}` : ''}
            </p>
          </div>
        </div>
      </Link>
    </Card>
  )
}
