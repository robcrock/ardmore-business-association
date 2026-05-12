import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = {
  basePath: string
  page: number
  totalPages: number
  searchParams?: Record<string, string | undefined>
  className?: string
}

function buildHref(basePath: string, page: number, sp?: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  if (sp) {
    for (const [k, v] of Object.entries(sp)) {
      if (v) params.set(k, v)
    }
  }
  if (page > 1) params.set('page', String(page))
  else params.delete('page')
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function pageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push('ellipsis')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('ellipsis')
  out.push(total)
  return out
}

export function Pagination({ basePath, page, totalPages, searchParams, className }: Props) {
  if (totalPages <= 1) return null
  const prev = Math.max(1, page - 1)
  const next = Math.min(totalPages, page + 1)
  const pages = pageList(page, totalPages)

  const linkBase =
    'inline-flex items-center justify-center h-11 min-w-11 px-3 rounded-md text-sm tabular-nums ring-1 ring-line bg-surface text-ink hover:ring-line-strong hover:bg-paper transition-[background-color,box-shadow]'
  const active = 'bg-ink text-paper ring-ink hover:bg-ink hover:ring-ink pointer-events-none'
  const disabled = 'opacity-40 pointer-events-none'

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-2 pt-12', className)}
    >
      <Link
        href={buildHref(basePath, prev, searchParams)}
        aria-label="Previous page"
        className={cn(linkBase, page === 1 && disabled)}
      >
        <ChevronLeft className="size-4 shrink-0" />
        <span className="ml-1 max-sm:hidden">Prev</span>
      </Link>
      <ul role="list" className="flex items-center gap-2 max-sm:hidden">
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e-${i}`} className="px-2 text-ink-muted text-sm">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={buildHref(basePath, p, searchParams)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(linkBase, p === page && active)}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>
      <span className="sm:hidden text-sm text-ink-muted tabular-nums">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(basePath, next, searchParams)}
        aria-label="Next page"
        className={cn(linkBase, page === totalPages && disabled)}
      >
        <span className="mr-1 max-sm:hidden">Next</span>
        <ChevronRight className="size-4 shrink-0" />
      </Link>
    </nav>
  )
}
