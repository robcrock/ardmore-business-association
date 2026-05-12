import type { Block, CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero blocks' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'array',
      name: 'ctas',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
        },
      ],
    },
  ],
}

const RichTextBlock: Block = {
  slug: 'richText',
  fields: [{ name: 'content', type: 'richText', required: true }],
}

const ImageGridBlock: Block = {
  slug: 'imageGrid',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}

const CTABlock: Block = {
  slug: 'cta',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text' },
    { name: 'buttonHref', type: 'text' },
  ],
}

const MemberSpotlightBlock: Block = {
  slug: 'memberSpotlight',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Explore Our Members' },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
    },
    {
      name: 'showFeaturedOnly',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

const EventListBlock: Block = {
  slug: 'eventList',
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Upcoming Events' },
    { name: 'limit', type: 'number', defaultValue: 3 },
  ],
}

const SponsorStripBlock: Block = {
  slug: 'sponsorStrip',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'sponsors',
      type: 'relationship',
      relationTo: 'sponsors',
      hasMany: true,
    },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
      name: 'blocks',
      type: 'blocks',
      blocks: [
        HeroBlock,
        RichTextBlock,
        ImageGridBlock,
        CTABlock,
        MemberSpotlightBlock,
        EventListBlock,
        SponsorStripBlock,
      ],
    },
  ],
}
