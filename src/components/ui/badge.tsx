import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeStyles = cva(
  'inline-flex items-center gap-1 rounded-full font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-paper text-ink-muted ring-1 ring-line',
        accent: 'bg-accent-soft text-accent-dark',
        highlight: 'bg-highlight/15 text-highlight',
        ink: 'bg-ink text-paper',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
)

export function Badge({
  tone,
  size,
  className,
  children,
}: VariantProps<typeof badgeStyles> & {
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn(badgeStyles({ tone, size }), className)}>{children}</span>
}
