import { useId } from 'react'

/**
 * Checkbox — styled checkbox with label.
 *
 * Props:
 *   label     – visible label text
 *   checked   – boolean
 *   onChange  – (checked: boolean) => void
 *   disabled  – boolean
 *   className – extra classes on outer wrapper
 */
export function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const id = useId()

  return (
    <div className={`flex min-h-[44px] items-center gap-3 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded-[var(--radius-control)] border-line-strong accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label
        htmlFor={id}
        className="select-none text-sm text-ink"
      >
        {label}
      </label>
    </div>
  )
}
