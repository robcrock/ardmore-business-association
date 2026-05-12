import { cn } from '@/lib/cn'

export function Card({
  as: Component = 'div',
  className,
  hover = false,
  children,
}: {
  as?: 'div' | 'article' | 'li'
  className?: string
  hover?: boolean
  children: React.ReactNode
}) {
  return (
    <Component
      className={cn(
        'bg-surface ring-1 ring-line rounded-lg overflow-hidden',
        hover &&
          'motion-safe:transition-[box-shadow,transform,outline-color] motion-safe:duration-200 ease-out hover:shadow-lift hover:ring-line-strong motion-safe:hover:-translate-y-px',
        className,
      )}
    >
      {children}
    </Component>
  )
}
