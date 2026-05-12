'use client'

import * as React from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'

type Item = { id?: string | null; label: string; href: string }

export function MobileNav({
  items,
  ctaHref = '/join',
  ctaLabel = 'Become a Member',
}: {
  items: Item[]
  ctaHref?: string
  ctaLabel?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden relative inline-flex items-center justify-center size-10 -mr-2 rounded-md text-ink hover:bg-paper"
        >
          <Menu className="size-5" />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-50 bg-paper border-b border-line shadow-xl p-6 pb-10 max-h-dvh overflow-y-auto">
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg">Menu</span>
            <Dialog.Close
              aria-label="Close menu"
              className="relative inline-flex items-center justify-center size-10 -mr-2 rounded-md text-ink hover:bg-line/40"
            >
              <X className="size-5" />
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
              />
            </Dialog.Close>
          </div>
          <nav className="mt-8">
            <ul role="list" className="flex flex-col">
              {items.map((it) => (
                <li key={it.id ?? `${it.href}-${it.label}`}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 border-b border-line font-display text-2xl"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex items-center justify-center w-full h-12 rounded-md bg-accent text-white font-medium"
            >
              {ctaLabel}
            </Link>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
