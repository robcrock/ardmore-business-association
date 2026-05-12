import Link from 'next/link'
import { cn } from '@/lib/cn'

export type TabItem = { label: string; value: string; count?: number }

export function LinkTabs({
  items,
  param,
  basePath,
  active,
  className,
}: {
  items: TabItem[]
  param: string
  basePath: string
  active: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-paper ring-1 ring-line p-1',
        className,
      )}
    >
      {items.map((it) => {
        const isActive = it.value === active
        const href =
          it.value === items[0]?.value
            ? basePath
            : `${basePath}?${param}=${encodeURIComponent(it.value)}`
        return (
          <Link
            key={it.value}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'inline-flex items-center gap-2 px-4 h-10 rounded-sm text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-surface text-ink ring-1 ring-line-strong shadow-[0_1px_0_rgb(17_20_24_/_0.04)]'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {it.label}
            {typeof it.count === 'number' && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  isActive ? 'text-ink-muted' : 'text-ink-soft',
                )}
              >
                {it.count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
