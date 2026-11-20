export function Card({ children, className = '', elevated = false, ...props }) {
  return (
    <div
      className={`rounded-[var(--radius-container)] border border-line bg-surface p-4 ${
        elevated ? 'shadow-[var(--shadow-card)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
