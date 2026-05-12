import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Monogram } from '@/components/ui/monogram'
import { Button } from '@/components/ui/button'

export const revalidate = 300
export const metadata = { title: 'Member Directory' }

type SearchParams = Promise<{ q?: string; category?: string; page?: string }>

const PAGE_SIZE = 24

export default async function MembersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const q = sp.q?.trim() || undefined
  const category = sp.category || undefined
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const payload = await getPayloadClient()
  const categories = await payload.find({
    collection: 'categories',
    limit: 200,
    sort: 'name',
  })

  const where: Where = {}
  if (q) where.name = { like: q }
  if (category) where.category = { in: [category] }

  const members = await payload.find({
    collection: 'members',
    where,
    limit: PAGE_SIZE,
    page,
    sort: ['order', 'name'],
  })

  const hasFilters = Boolean(q || category)
  const start = members.totalDocs === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, members.totalDocs)

  return (
    <>
      {/* Page header */}
      <Container className="pt-14 md:pt-20 pb-8">
        <Eyebrow tone="accent">Shop Ardmore</Eyebrow>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          Member directory
        </h1>
        <p className="mt-4 text-lg text-ink-muted max-w-2xl text-pretty">
          {members.totalDocs} independent businesses that make Ardmore worth a
          stop — search, filter, and find your next favorite.
        </p>
      </Container>

      {/* Sticky filter bar */}
      <div className="sticky top-16 md:top-20 z-20 border-y border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
        <Container className="py-4 flex flex-wrap items-center gap-3">
          <form
            action="/members"
            method="get"
            className="flex flex-wrap items-center gap-2 flex-1 min-w-0"
          >
            <label className="relative flex-1 min-w-0 max-w-md">
              <span className="sr-only">Search members</span>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-soft pointer-events-none"
                aria-hidden="true"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search members…"
                className="w-full h-10 rounded-md ring-1 ring-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="flex items-center">
              <span className="sr-only">Filter by category</span>
              <select
                name="category"
                defaultValue={category ?? ''}
                className="h-10 rounded-md ring-1 ring-line bg-surface px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All categories</option>
                {categories.docs.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" size="sm" variant="secondary">
              Apply
            </Button>
            {hasFilters && (
              <Link
                href="/members"
                className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
              >
                <X className="size-4" /> Clear
              </Link>
            )}
          </form>
          <p className="text-sm text-ink-muted tabular-nums whitespace-nowrap">
            {members.totalDocs === 0
              ? 'No matches'
              : `Showing ${start}–${end} of ${members.totalDocs}`}
          </p>
        </Container>
      </div>

      {/* Results */}
      <Container className="py-12 md:py-16">
        {members.docs.length === 0 ? (
          <EmptyState
            title="No members match those filters"
            description={
              hasFilters
                ? 'Try a different search or clear filters to see everyone.'
                : 'The directory is empty for now — check back soon.'
            }
            action={
              hasFilters ? (
                <Button href="/members" variant="secondary" size="sm">
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul
            role="list"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {members.docs.map((m) => {
              const url = mediaUrl(m.logo, 'card')
              const cats = Array.isArray(m.category) ? m.category : []
              const firstCategory = cats[0]
              const categoryName =
                typeof firstCategory === 'object' && firstCategory && 'name' in firstCategory
                  ? (firstCategory as { name: string }).name
                  : undefined
              return (
                <Card key={m.id} as="li" hover>
                  <Link href={`/members/${m.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] bg-paper border-b border-line">
                      {url ? (
                        <Image
                          src={url}
                          alt={m.name}
                          fill
                          className="object-contain p-6"
                          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <Monogram name={m.name} className="w-full h-full" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      {categoryName && (
                        <Badge tone="neutral">{categoryName}</Badge>
                      )}
                      <h2 className="font-display text-2xl tracking-tight">{m.name}</h2>
                      {m.shortDescription && (
                        <p className="text-sm text-ink-muted line-clamp-2">
                          {m.shortDescription}
                        </p>
                      )}
                      {m.contact?.address && (
                        <p className="mt-auto text-xs text-ink-soft">
                          {m.contact.address}
                        </p>
                      )}
                    </div>
                  </Link>
                </Card>
              )
            })}
          </ul>
        )}

        <Pagination
          basePath="/members"
          page={page}
          totalPages={members.totalPages}
          searchParams={{ q, category }}
        />
      </Container>
    </>
  )
}
