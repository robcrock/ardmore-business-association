import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'featured', 'updatedAt'],
    group: 'Members',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: {
        description: 'One- or two-sentence blurb shown in the directory listing.',
      },
    },
    {
      name: 'longDescription',
      type: 'richText',
      admin: { description: 'Full member profile body.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Logo or hero image used on the listing card.' },
    },
    {
      name: 'photos',
      type: 'array',
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      type: 'group',
      name: 'contact',
      fields: [
        { name: 'address', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'website', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'location',
      admin: { description: 'Used to render a map on the member page.' },
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
        { name: 'mapEmbedUrl', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'hours',
      fields: [
        { name: 'monday', type: 'text' },
        { name: 'tuesday', type: 'text' },
        { name: 'wednesday', type: 'text' },
        { name: 'thursday', type: 'text' },
        { name: 'friday', type: 'text' },
        { name: 'saturday', type: 'text' },
        { name: 'sunday', type: 'text' },
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
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this member on the home page.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers sort first.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
