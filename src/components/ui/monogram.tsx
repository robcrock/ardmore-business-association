import { cn } from '@/lib/cn'

export function Monogram({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'

  return (
    <div
      className={cn(
        'grid place-items-center bg-paper text-ink-muted font-display text-2xl select-none',
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
