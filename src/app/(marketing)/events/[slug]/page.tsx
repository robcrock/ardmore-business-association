import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { RichText } from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { BackLink } from '@/components/ui/back-link'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'events', where: { slug: { equals: slug } }, limit: 1 })
  const e = r.docs[0]
  if (!e) return {}
  return { title: e.title }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const r = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const event = r.docs[0]
  if (!event) return notFound()

  const heroUrl = mediaUrl(event.heroImage, 'hero')
  const dt = new Date(event.startDateTime)

  return (
    <Container className="py-10 md:py-14">
      <BackLink href="/events" label="All events" />

      <header className="mt-6 max-w-4xl">
        <Eyebrow tone="accent">
          {dt.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          {event.title}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          {dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          {event.location?.name ? ` · ${event.location.name}` : ''}
        </p>
      </header>

      {heroUrl && (
        <div className="mt-10 relative aspect-[16/9] rounded-lg overflow-hidden ring-1 ring-line">
          <Image src={heroUrl} alt={event.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="prose">
            <RichText data={event.description} />
          </div>
        </div>

        {event.registrationUrl && (
          <aside className="lg:col-span-4 self-start lg:sticky lg:top-28">
            <div className="rounded-lg bg-accent-soft ring-1 ring-accent/20 p-6">
              <p className="font-display text-2xl tracking-tight">Reserve your spot</p>
              <p className="mt-2 text-sm text-ink-muted">
                Registration opens at the link below — space tends to go quickly.
              </p>
              <Button
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full"
              >
                Register
              </Button>
            </div>
          </aside>
        )}
      </div>
    </Container>
  )
}
