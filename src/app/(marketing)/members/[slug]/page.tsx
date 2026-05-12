import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Globe, Phone, Mail, MapPin } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'
import { RichText } from '@/components/RichText'
import { Container } from '@/components/ui/container'
import { BackLink } from '@/components/ui/back-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Monogram } from '@/components/ui/monogram'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'members',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const member = res.docs[0]
  if (!member) return {}
  return {
    title: member.name,
    description: member.shortDescription ?? undefined,
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'members',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const member = res.docs[0]
  if (!member) return notFound()

  const heroUrl = mediaUrl(member.logo, 'hero')
  const categories = Array.isArray(member.category) ? member.category : []

  return (
    <Container className="py-10 md:py-14">
      <BackLink href="/members" label="All members" />

      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => {
            const name = typeof c === 'object' && c && 'name' in c ? (c as { name: string }).name : undefined
            if (!name) return null
            return (
              <Badge key={i} tone="neutral">
                {name}
              </Badge>
            )
          })}
        </div>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
          {member.name}
        </h1>
        {member.shortDescription && (
          <p className="mt-5 text-xl text-ink-muted max-w-2xl text-pretty">
            {member.shortDescription}
          </p>
        )}
      </header>

      <div className="mt-12 relative aspect-[16/9] rounded-lg overflow-hidden ring-1 ring-line bg-paper">
        {heroUrl ? (
          <Image src={heroUrl} alt={member.name} fill className="object-contain p-10" />
        ) : (
          <Monogram name={member.name} className="w-full h-full text-6xl" />
        )}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {member.longDescription ? (
            <div className="prose">
              <RichText data={member.longDescription} />
            </div>
          ) : (
            <p className="text-ink-muted">More details coming soon.</p>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-5">
          {member.contact?.website && (
            <Button
              href={
                member.contact.website.startsWith('http')
                  ? member.contact.website
                  : `https://${member.contact.website}`
              }
              variant="primary"
              size="md"
              className="w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="size-4" /> Visit website
            </Button>
          )}
          <ContactBlock icon={<MapPin className="size-4" />} label="Address" value={member.contact?.address} />
          <ContactBlock
            icon={<Phone className="size-4" />}
            label="Phone"
            value={
              member.contact?.phone ? (
                <a href={`tel:${member.contact.phone}`}>{member.contact.phone}</a>
              ) : null
            }
          />
          <ContactBlock
            icon={<Mail className="size-4" />}
            label="Email"
            value={
              member.contact?.email ? (
                <a href={`mailto:${member.contact.email}`}>{member.contact.email}</a>
              ) : null
            }
          />
          {member.location?.mapEmbedUrl && (
            <iframe
              src={member.location.mapEmbedUrl}
              className="w-full aspect-square rounded-md ring-1 ring-line"
              loading="lazy"
              title={`Map of ${member.name}`}
            />
          )}
        </aside>
      </div>
    </Container>
  )
}

function ContactBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  if (!value) return null
  return (
    <div>
      <p className="font-mono uppercase tracking-wide text-xs text-ink-muted flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}
