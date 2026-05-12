import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'

export const revalidate = 300
export const metadata = { title: 'News' }

const PAGE_SIZE = 12

type SearchParams = Promise<{ page?: string }>

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const payload = await getPayloadClient()
  const posts = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    page,
    limit: PAGE_SIZE,
  })

  return (
    <Container className="py-14 md:py-20">
      <header className="mb-12">
        <Eyebrow tone="accent">Dispatches</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          News from Lancaster Avenue
        </h1>
      </header>

      {posts.docs.length === 0 ? (
        <EmptyState
          eyebrow="Coming soon"
          title="The newsroom is just getting started"
          description="Member spotlights, event recaps, and small-town reporting are on the way. Have a story to share? We’d love to hear it."
          action={
            <Button href="/join" size="sm" variant="secondary">
              Tell us your story
            </Button>
          }
        />
      ) : (
        <>
          <ul role="list" className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((p) => {
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
                    <h2 className="mt-2 font-display text-2xl tracking-tight group-hover:text-accent transition-colors">
                      {p.title}
                    </h2>
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

          <Pagination
            basePath="/news"
            page={page}
            totalPages={posts.totalPages}
          />
        </>
      )}
    </Container>
  )
}
