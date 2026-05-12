import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

const navItemFields = [
  { name: 'label', type: 'text' as const, required: true },
  { name: 'href', type: 'text' as const, required: true },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: { read: anyone, update: authenticated },
  fields: [
    {
      name: 'primary',
      type: 'array',
      labels: { singular: 'Primary nav item', plural: 'Primary nav items' },
      fields: navItemFields,
      defaultValue: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Members', href: '/members' },
        { label: 'Events', href: '/events' },
        { label: 'News', href: '/news' },
        { label: 'Sponsors', href: '/sponsors' },
        { label: 'Join', href: '/join' },
      ],
    },
    {
      name: 'footer',
      type: 'array',
      labels: { singular: 'Footer link', plural: 'Footer links' },
      fields: navItemFields,
    },
  ],
}
