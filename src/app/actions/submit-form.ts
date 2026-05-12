'use server'
import { headers } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export type FormState = { ok: boolean; message: string }
export type SubmissionType = 'contact' | 'join' | 'newsletter'

export async function submitForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const type = String(formData.get('type') ?? 'contact') as SubmissionType
  const name = String(formData.get('name') ?? '').trim() || (type === 'newsletter' ? 'Newsletter Signup' : '')
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || undefined
  const businessName = String(formData.get('businessName') ?? '').trim() || undefined
  const message = String(formData.get('message') ?? '').trim() || undefined

  if (type === 'newsletter') {
    if (!email) return { ok: false, message: 'Please enter your email.' }
  } else if (!name || !email) {
    return { ok: false, message: 'Name and email are required.' }
  }

  const h = await headers()
  const meta = {
    ip: h.get('x-forwarded-for') ?? '',
    userAgent: h.get('user-agent') ?? '',
    referer: h.get('referer') ?? '',
  }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'submissions',
    data: { type, name, email, phone, businessName, message, meta },
  })

  if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL && type !== 'newsletter') {
    try {
      await payload.sendEmail({
        to: process.env.CONTACT_EMAIL,
        subject: `New ${type === 'join' ? 'membership' : 'contact'} submission from ${name}`,
        text:
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          (phone ? `Phone: ${phone}\n` : '') +
          (businessName ? `Business: ${businessName}\n` : '') +
          (message ? `\n${message}\n` : ''),
      })
    } catch (err) {
      console.error('[submit-form] email failed', err)
    }
  }

  return {
    ok: true,
    message:
      type === 'join'
        ? "Thanks! We’ll be in touch about membership soon."
        : type === 'newsletter'
        ? "You’re on the list. Thanks for joining."
        : "Thanks for reaching out — we’ll get back to you shortly.",
  }
}
