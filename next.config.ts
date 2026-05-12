import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.ardmoreshops.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/services', destination: '/members', permanent: true },
      { source: '/services/:slug', destination: '/members/:slug', permanent: true },
      { source: '/team', destination: '/events', permanent: true },
      { source: '/team/:slug', destination: '/events/:slug', permanent: true },
      { source: '/ardmore-day-sponsors', destination: '/sponsors', permanent: true },
      { source: '/contact', destination: '/join', permanent: true },
    ]
  },
}

export default withPayload(nextConfig)
