export function Chip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-chip px-3 py-1 text-xs font-medium text-ink-2 ${className}`}
    >
      {children}
    </span>
  )
}
