import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function Modal({ open, title, children, onClose, describedBy, initialFocus }) {
  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement
    const dialog = dialogRef.current
    if (!dialog) return

    const focusables = dialog.querySelectorAll(FOCUSABLE)
    let target = focusables.length ? focusables[0] : dialog
    if (initialFocus) {
      const preferred = dialog.querySelector(initialFocus)
      if (preferred) target = preferred
    }
    target.focus()

    function handleKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const nodes = Array.from(dialog.querySelectorAll(FOCUSABLE))
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus()
      }
    }
  }, [open, onClose, initialFocus])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={describedBy}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        aria-describedby={describedBy}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-overlay outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-ink-3 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-line-strong bg-surface p-8 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-2">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}