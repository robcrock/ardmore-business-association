import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { SITE_NAV_EXCLUDE_FROM_HEADER } from '@/lib/constants'
import { MobileNav } from '@/components/ui/mobile-nav'
import { HeaderNav, HeaderCta } from '@/components/HeaderNav'

type NavItem = { id?: string | null; label: string; href: string }

function filterPrimary(items: NavItem[] | undefined | null): NavItem[] {
  return (items ?? []).filter((it) => {
    const slug = it.href.replace(/^\/+|\/+$/g, '').toLowerCase()
    if (SITE_NAV_EXCLUDE_FROM_HEADER.has(slug)) return false
    if (it.label.toLowerCase().includes('join')) return false
    if (it.label.toLowerCase().includes('become a member')) return false
    return true
  })
}

export async function SiteHeader() {
  const payload = await getPayloadClient()
  const [nav, settings] = await Promise.all([
    payload.findGlobal({ slug: 'navigation' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const logoUrl = mediaUrl(settings.logo, 'card')
  const primary = filterPrimary(nav.primary as NavItem[] | null | undefined)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto max-w-7xl px-6 md:px-8 h-16 md:h-20 flex items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Homepage"
          className="flex items-center gap-3 min-w-0"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              className="size-9 md:size-10 rounded-full ring-1 ring-line bg-surface"
            />
          ) : null}
          <span className="font-display text-lg md:text-xl tracking-tight truncate">
            {settings.siteName ?? 'Ardmore Business Association'}
          </span>
        </Link>

        <HeaderNav items={primary} />

        <div className="flex items-center gap-2">
          <HeaderCta />
          <MobileNav items={primary} />
        </div>
      </div>
    </header>
  )
}
