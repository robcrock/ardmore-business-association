import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter, MapPin } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { NewsletterForm } from '@/components/NewsletterForm'

export async function SiteFooter() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const year = new Date().getFullYear()

  const social = settings.social ?? {}
  const socialLinks = [
    social.facebook && { href: social.facebook, label: 'Facebook', Icon: Facebook },
    social.instagram && { href: social.instagram, label: 'Instagram', Icon: Instagram },
    social.x && { href: social.x, label: 'X', Icon: Twitter },
    social.linkedin && { href: social.linkedin, label: 'LinkedIn', Icon: Linkedin },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Facebook }[]

  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-display text-2xl tracking-tight">
            {settings.siteName ?? 'Ardmore Business Association'}
          </p>
          <p className="mt-3 text-sm text-ink-muted max-w-sm">
            {settings.footerText ??
              'Connecting the merchants, makers, and neighbors of Ardmore, PA since 1951.'}
          </p>
          {socialLinks.length > 0 && (
            <ul role="list" className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex items-center justify-center size-9 rounded-full ring-1 ring-line text-ink-muted hover:text-ink hover:ring-line-strong transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-3">
          <p className="font-mono uppercase tracking-wide text-xs text-ink-muted mb-4">
            Contact
          </p>
          <ul role="list" className="text-sm space-y-2 text-ink-muted">
            {settings.contact?.email && (
              <li>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="hover:text-ink"
                >
                  {settings.contact.email}
                </a>
              </li>
            )}
            {settings.contact?.phone && <li>{settings.contact.phone}</li>}
            {settings.contact?.address && (
              <li className="flex items-start gap-1.5">
                <MapPin className="size-3.5 mt-0.5 shrink-0" />
                <span>{settings.contact.address}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-5">
          <p className="font-mono uppercase tracking-wide text-xs text-ink-muted mb-4">
            Stay in the loop
          </p>
          <p className="text-sm text-ink-muted mb-4 max-w-md">
            Member spotlights, event invites, and the occasional dispatch from
            Lancaster Avenue. No spam, easy unsubscribe.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-5 text-xs text-ink-muted flex flex-wrap items-center justify-between gap-3">
          <span>© {year} Ardmore Business Association · Est. 1951</span>
          <ul role="list" className="flex items-center gap-5">
            <li>
              <Link href="/about" className="hover:text-ink">
                About
              </Link>
            </li>
            <li>
              <Link href="/join" className="hover:text-ink">
                Join
              </Link>
            </li>
            <li>
              <a
                href="mailto:hello@ardmoreshops.com"
                className="hover:text-ink"
              >
                Press inquiries
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
