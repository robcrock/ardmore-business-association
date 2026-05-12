import { cn } from '@/lib/cn'
import { Container } from './container'
import { Eyebrow } from './eyebrow'

type SectionProps = {
  className?: string
  innerClassName?: string
  size?: 'sm' | 'md' | 'lg'
  bleed?: boolean
  tone?: 'paper' | 'surface' | 'accent-soft'
  children: React.ReactNode
}

const sizeMap = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-28',
}

const toneMap: Record<NonNullable<SectionProps['tone']>, string> = {
  paper: '',
  surface: 'bg-surface',
  'accent-soft': 'bg-accent-soft',
}

export function Section({
  className,
  innerClassName,
  size = 'md',
  bleed = false,
  tone = 'paper',
  children,
}: SectionProps) {
  return (
    <section className={cn(sizeMap[size], toneMap[tone], className)}>
      {bleed ? children : <Container className={innerClassName}>{children}</Container>}
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start'
  return (
    <div
      className={cn(
        'mb-10 md:mb-14 flex flex-col gap-5',
        alignment,
        action && align === 'left' && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center')}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          className={cn(
            'font-display text-4xl md:text-5xl tracking-tight text-balance',
            align === 'center' ? 'max-w-2xl' : 'max-w-3xl',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'text-lg text-ink-muted text-pretty',
              align === 'center' ? 'max-w-2xl' : 'max-w-2xl',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
