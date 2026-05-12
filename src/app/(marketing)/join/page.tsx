import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { MEMBERSHIP_BENEFITS } from '@/lib/constants'

export const metadata = { title: 'Join the Association' }

export default function JoinPage() {
  return (
    <Container className="py-14 md:py-20">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <Eyebrow tone="accent">Membership</Eyebrow>
          <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-balance">
            Join the Ardmore Business Association
          </h1>
          <p className="mt-5 text-lg text-ink-muted max-w-2xl text-pretty">
            Membership in the ABA connects your business to the community, gets
            you featured in our directory, and puts you in the room with the
            owners who keep downtown moving.
          </p>

          <div className="mt-12">
            <Eyebrow>What you get</Eyebrow>
            <ul role="list" className="mt-4 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {MEMBERSHIP_BENEFITS.map((b) => (
                <li key={b.title}>
                  <p className="font-display text-xl tracking-tight">{b.title}</p>
                  <p className="mt-1.5 text-sm text-ink-muted text-pretty">
                    {b.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <Eyebrow>Dues</Eyebrow>
            <p className="mt-3 text-base text-ink-muted max-w-xl">
              Annual dues are kept intentionally modest — every business that calls
              Ardmore home should be able to be part of this. We’ll share specifics
              when we follow up on your application.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <ContactForm type="join" />
        </div>
      </div>
    </Container>
  )
}
