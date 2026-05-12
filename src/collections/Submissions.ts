import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['type', 'name', 'email', 'createdAt'],
    group: 'Forms',
  },
  access: {
    read: authenticated,
    create: anyone,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Join / Membership', value: 'join' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'businessName', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'meta',
      type: 'json',
      admin: { readOnly: true, description: 'Referrer / IP / user-agent at submission time.' },
    },
  ],
}
