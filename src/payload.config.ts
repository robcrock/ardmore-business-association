import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Members } from './collections/Members'
import { Events } from './collections/Events'
import { Posts } from './collections/Posts'
import { Sponsors } from './collections/Sponsors'
import { Pages } from './collections/Pages'
import { Submissions } from './collections/Submissions'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Ardmore Business Association',
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Members,
    Events,
    Posts,
    Sponsors,
    Pages,
    Submissions,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress:
          process.env.RESEND_FROM_EMAIL || 'no-reply@ardmoreshops.com',
        defaultFromName: 'Ardmore Business Association',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
  plugins: [
    seoPlugin({
      collections: ['members', 'events', 'posts', 'pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) =>
        `${(doc as { title?: string; name?: string }).title ?? (doc as { name?: string }).name ?? 'Ardmore Business Association'}`,
    }),
    ...(useS3
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET!,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'auto',
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
  sharp: (await import('sharp')).default,
})
