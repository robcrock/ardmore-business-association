import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap motion-safe:active:translate-y-px',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-dark',
        secondary:
          'bg-surface text-ink ring-1 ring-line-strong hover:ring-ink hover:bg-paper font-medium',
        invert: 'bg-paper text-ink hover:bg-white',
        ghost: 'text-ink hover:bg-line/40 font-medium',
        link: 'text-accent underline underline-offset-4 hover:text-accent-dark font-medium',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-11 px-5 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-md',
      },
    },
    compoundVariants: [
      { variant: 'link', size: 'sm', className: 'h-auto px-0' },
      { variant: 'link', size: 'md', className: 'h-auto px-0' },
      { variant: 'link', size: 'lg', className: 'h-auto px-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type StyleProps = VariantProps<typeof buttonStyles>

type ButtonProps = StyleProps & {
  className?: string
  children: React.ReactNode
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  target?: React.HTMLAttributeAnchorTarget
  rel?: string
  'aria-label'?: string
}

export function Button({
  variant,
  size,
  className,
  children,
  href,
  type = 'button',
  disabled,
  onClick,
  target,
  rel,
  ...rest
}: ButtonProps) {
  const classes = cn(buttonStyles({ variant, size }), className)
  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...rest}
    >
      {children}
    </button>
  )
}

export { buttonStyles }
