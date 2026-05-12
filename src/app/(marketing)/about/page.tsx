import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { RichText } from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'

export const revalidate = 300
export const metadata = { title: 'About' }

export default async function AboutPage() {
  const payload = await getPayloadClient()
  const r = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    depth: 2,
    limit: 1,
  })
  const page = r.docs[0]

  return (
    <Container className="py-14 md:py-20">
      <header className="max-w-3xl">
        <Eyebrow tone="accent">Established 1951</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          {page?.title ?? 'About the Ardmore Business Association'}
        </h1>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {!page ? (
            <div className="prose">
              <p>
                The Ardmore Business Association is a community of merchants,
                makers, and service providers committed to keeping our downtown
                one of the Main Line’s most distinctive places to live, work,
                and shop.
              </p>
              <p>
                Since 1951 we’ve organized seasonal events — from the Easter Egg
                Scavenger Hunt and Ardmore Day to monthly Coffee &amp;
                Conversation networking — and championed the small businesses
                that give Ardmore its character.
              </p>
              <p>
                Whether you’re a longtime neighbor or just discovering us —
                welcome. There’s always something happening in Ardmore.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {(page.blocks ?? []).map((rawBlock, i: number) => {
                const b = rawBlock as {
                  blockType: string
                  id?: string | null
                  content?: unknown
                  images?: Array<{ image: unknown }> | null
                }
                if (b.blockType === 'richText') {
                  return (
                    <div key={b.id ?? i} className="prose">
                      <RichText data={b.content} />
                    </div>
                  )
                }
                if (b.blockType === 'imageGrid') {
                  const first = b.images?.[0]?.image
                  const url = mediaUrl(
                    first as Parameters<typeof mediaUrl>[0],
                    'hero',
                  )
                  if (!url) return null
                  return (
                    <div
                      key={b.id ?? i}
                      className="relative aspect-[16/9] rounded-lg overflow-hidden ring-1 ring-line"
                    >
                      <Image src={url} alt={page.title} fill className="object-cover" />
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-28 self-start">
          <Fact label="Founded" value="1951" />
          <Fact label="Members" value="100+ local businesses" />
          <Fact label="Signature events" value="Ardmore Day · Easter Egg Hunt · Coffee & Conversation" />
          <Fact
            label="Get in touch"
            value={
              <a
                href="mailto:hello@ardmoreshops.com"
                className="text-accent underline underline-offset-4"
              >
                hello@ardmoreshops.com
              </a>
            }
          />
        </aside>
      </div>
    </Container>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono uppercase tracking-wide text-xs text-ink-muted">{label}</p>
      <p className="mt-1.5 text-base">{value}</p>
    </div>
  )
}
