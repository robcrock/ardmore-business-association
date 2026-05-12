import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: anyone, update: authenticated },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Ardmore Business Association' },
    { name: 'tagline', type: 'text', defaultValue: 'Ardmore is Our Business.' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    {
      type: 'group',
      name: 'contact',
      fields: [
        { name: 'email', type: 'email', defaultValue: 'info@ardmoreshops.com' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'text', defaultValue: 'Ardmore, PA 19003' },
      ],
    },
    {
      type: 'group',
      name: 'social',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'x', type: 'text' },
        { name: 'linkedin', type: 'text' },
      ],
    },
    { name: 'footerText', type: 'textarea', defaultValue: 'Established in 1951' },
  ],
}
