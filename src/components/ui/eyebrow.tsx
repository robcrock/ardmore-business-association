import { cn } from '@/lib/cn'

export function Eyebrow({
  children,
  className,
  tone = 'muted',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'muted' | 'accent'
}) {
  return (
    <p
      className={cn(
        'font-mono uppercase tracking-wide text-xs',
        tone === 'accent' ? 'text-accent' : 'text-ink-muted',
        className,
      )}
    >
      {children}
    </p>
  )
}
