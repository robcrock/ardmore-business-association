'use client'

import { useActionState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { submitForm, type FormState } from '@/app/actions/submit-form'

const initial: FormState = { ok: false, message: '' }

export function NewsletterForm() {
  const [state, action, pending] = useActionState(submitForm, initial)

  if (state.ok) {
    return (
      <div
        role="status"
        className="rounded-md ring-1 ring-accent/30 bg-accent-soft px-4 py-3 flex items-start gap-3"
      >
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-accent text-white shrink-0 mt-0.5">
          <Check className="size-3.5" />
        </span>
        <p className="text-sm text-accent-dark">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="type" value="newsletter" />
      <input type="hidden" name="name" value="Newsletter Signup" />
      <div className="flex items-stretch rounded-md ring-1 ring-line-strong bg-surface overflow-hidden focus-within:ring-2 focus-within:ring-accent transition-shadow">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@local.shop"
          className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-sm focus:outline-none placeholder:text-ink-soft"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="px-3.5 bg-ink text-paper hover:bg-ink/90 disabled:opacity-60 inline-flex items-center justify-center motion-safe:active:translate-y-px transition-colors"
        >
          <ArrowRight className="size-4 shrink-0" />
        </button>
      </div>
      {state.message && !state.ok && (
        <p className="text-xs text-danger">{state.message}</p>
      )}
    </form>
  )
}
