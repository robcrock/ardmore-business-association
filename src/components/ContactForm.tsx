'use client'
import { useActionState } from 'react'
import { submitForm, type FormState } from '@/app/actions/submit-form'

const initial: FormState = { ok: false, message: '' }

export function ContactForm({ type = 'contact' as 'contact' | 'join' }) {
  const [state, action, pending] = useActionState(submitForm, initial)

  if (state.ok) {
    return (
      <div className="rounded-lg bg-accent-soft ring-1 ring-accent/20 p-8">
        <h2 className="font-display text-2xl tracking-tight mb-2">Thank you</h2>
        <p className="text-ink-muted">{state.message}</p>
      </div>
    )
  }

  return (
    <form
      action={action}
      className="rounded-lg bg-surface ring-1 ring-line p-6 md:p-8 space-y-5"
    >
      <input type="hidden" name="type" value={type} />
      <Field name="name" label="Full name" required />
      <Field name="email" type="email" label="Email" required />
      <Field name="phone" type="tel" label="Phone" />
      {type === 'join' && <Field name="businessName" label="Business name" />}
      <Field
        name="message"
        label={type === 'join' ? 'Tell us about your business' : 'Message'}
        multiline
      />
      {state.message && !state.ok && (
        <p className="text-sm text-danger">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center h-11 px-6 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {pending ? 'Sending…' : type === 'join' ? 'Apply for membership' : 'Send message'}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  multiline,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  multiline?: boolean
}) {
  const base =
    'w-full rounded-md ring-1 ring-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-ink-soft'
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      {multiline ? (
        <textarea name={name} required={required} rows={5} className={base} />
      ) : (
        <input name={name} type={type} required={required} className={base} />
      )}
    </label>
  )
}
