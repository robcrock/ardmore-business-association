import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDateTime', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      type: 'row',
      fields: [
        { name: 'startDateTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endDateTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'recurringRule',
      type: 'text',
      admin: {
        description:
          'Optional human-readable recurrence (e.g. "Second Tuesday of every month"). Leave blank for one-time events.',
      },
    },
    {
      type: 'group',
      name: 'location',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'address', type: 'text' },
      ],
    },
    { name: 'description', type: 'richText' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'registrationUrl',
      type: 'text',
      admin: { description: 'TicketLeap or other external registration URL.' },
    },
    {
      name: 'sponsoredBy',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
    },
    {
      name: 'eventState',
      type: 'select',
      defaultValue: 'upcoming',
      options: [
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
