import { cn } from '@/lib/cn'
import { Eyebrow } from './eyebrow'

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg ring-1 ring-line bg-surface px-8 py-16 text-center flex flex-col items-center gap-4',
        className,
      )}
    >
      {eyebrow && <Eyebrow tone="accent">{eyebrow}</Eyebrow>}
      <h3 className="font-display text-2xl md:text-3xl tracking-tight text-balance max-w-md">
        {title}
      </h3>
      {description && (
        <p className="text-ink-muted max-w-md text-pretty">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
