import { useId } from 'react'

/**
 * Switch — accessible toggle with label.
 *
 * Props:
 *   label     – visible label text
 *   checked   – boolean
 *   onChange  – (checked: boolean) => void
 *   disabled  – boolean
 *   className – extra classes on outer wrapper
 */
export function Switch({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const id = useId()

  return (
    <div
      className={`flex min-h-[44px] items-center justify-between gap-3 ${className}`}
    >
      <label htmlFor={id} className="text-sm text-ink select-none">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-[var(--dur-standard)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-accent' : 'bg-line-strong'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-standard)] ease-[var(--ease-out)] ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
