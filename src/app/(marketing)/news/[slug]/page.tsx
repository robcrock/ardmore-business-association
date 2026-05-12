import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { RichText } from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { BackLink } from '@/components/ui/back-link'
import { Eyebrow } from '@/components/ui/eyebrow'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1 })
  const p = r.docs[0]
  if (!p) return {}
  return { title: p.title, description: p.excerpt ?? undefined }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1 })
  const post = r.docs[0]
  if (!post) return notFound()

  const url = mediaUrl(post.heroImage, 'hero')

  return (
    <Container className="py-10 md:py-14">
      <BackLink href="/news" label="All news" />

      <header className="mt-6 max-w-3xl">
        {post.publishedAt && (
          <Eyebrow>
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Eyebrow>
        )}
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-5 text-xl text-ink-muted text-pretty">{post.excerpt}</p>
        )}
      </header>

      {url && (
        <div className="mt-10 relative aspect-[16/9] rounded-lg overflow-hidden ring-1 ring-line">
          <Image src={url} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-12 max-w-3xl">
        <div className="prose">
          <RichText data={post.body} />
        </div>
      </div>
    </Container>
  )
}
