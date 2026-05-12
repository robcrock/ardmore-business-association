'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'

type NavItem = { id?: string | null; label: string; href: string }

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav
      className="hidden md:flex items-center gap-7 text-sm"
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.id ?? `${item.href}-${item.label}`}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative py-2 transition-colors duration-150',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 -bottom-px h-0.5 bg-accent rounded-full motion-safe:transition-[opacity,transform] motion-safe:duration-200 origin-center',
                active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50',
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}

export function HeaderCta({
  href = '/join',
  label = 'Become a Member',
}: {
  href?: string
  label?: string
}) {
  const pathname = usePathname()
  if (pathname === href) return null
  return (
    <Button href={href} variant="primary" size="sm" className="hidden md:inline-flex">
      {label}
    </Button>
  )
}
