import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'year'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'tier',
      type: 'select',
      options: [
        { label: 'Title', value: 'title' },
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' },
        { label: 'Community', value: 'community' },
      ],
    },
    { name: 'website', type: 'text' },
    {
      name: 'year',
      type: 'number',
      admin: { description: 'Calendar year this sponsorship applies to.' },
    },
    {
      name: 'linkedMember',
      type: 'relationship',
      relationTo: 'members',
    },
  ],
}
