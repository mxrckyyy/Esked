import { forwardRef } from 'react'

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

const variants = {
  primary:
    'bg-accent text-accent-ink hover:bg-accent/90',
  outline:
    'border border-line-strong bg-transparent text-ink-2 hover:bg-surface-raised',
  'danger-outline':
    'border border-danger/40 bg-transparent text-danger hover:bg-danger/10',
  icon: 'border border-line bg-transparent text-ink-2 hover:bg-surface-raised',
}

const sizes = {
  sm: 'min-h-9 px-3 text-sm rounded-[var(--radius-button)]',
  md: 'min-h-[44px] px-4 text-sm rounded-[var(--radius-button)]',
  lg: 'min-h-12 px-5 text-sm font-bold rounded-[var(--radius-button)]',
}

const iconSizes = {
  sm: 'min-h-9 min-w-9 rounded-[var(--radius-button)]',
  md: 'min-h-[44px] min-w-[44px] rounded-[var(--radius-button)]',
  lg: 'min-h-12 min-w-12 rounded-[var(--radius-button)]',
}

const Spinner = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
  </svg>
)

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    ...props
  },
  ref,
) {
  const isIcon = variant === 'icon'
  const sizeClass = isIcon ? iconSizes[size] || iconSizes.md : sizes[size] || sizes.md
  const variantClass = variants[variant] || variants.primary

  return (
    <button
      ref={ref}
      type="button"
      disabled={loading || props.disabled}
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
})
