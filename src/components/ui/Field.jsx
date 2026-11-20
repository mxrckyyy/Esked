import { useId } from 'react'

/**
 * Field — labeled input or select with optional leading icon.
 *
 * Props:
 *   label        – visible label text (required)
 *   icon         – optional ReactNode (16px SVG) shown before the label
 *   hint         – optional helper text below the input
 *   error        – optional error text (replaces hint, marks input invalid)
 *   children     – the <input>, <select>, or <textarea> to render
 *   className    – extra classes on the outer wrapper
 */
export function Field({ label, icon, hint, error, children, className = '' }) {
  const id = useId()
  const hintId = hint || error ? `${id}-hint` : undefined

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-3"
        htmlFor={id}
      >
        {icon ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-ink-3">
            {icon}
          </span>
        ) : null}
        {label}
      </label>

      {/* Clone child to inject id and aria attributes */}
      <FieldInput id={id} hintId={hintId} error={error}>
        {children}
      </FieldInput>

      {error ? (
        <p id={hintId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Wraps the child input/select/textarea, forwarding id and aria props.
 * Falls back to rendering children as-is if cloning isn't possible.
 */
function FieldInput({ id, hintId, error, children }) {
  if (!children) return null

  // If the child is a plain React element, inject props
  if (children.type && typeof children.type === 'string') {
    const extraProps = { id }
    if (hintId) extraProps['aria-describedby'] = hintId
    if (error) extraProps['aria-invalid'] = 'true'
    // Merge className
    const childClass = children.props.className || ''
    const inputClass = `w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-focus ${childClass}`
    return (
      <children.type {...children.props} {...extraProps} className={inputClass} />
    )
  }

  // Otherwise render as-is (custom component children handle their own props)
  return children
}
