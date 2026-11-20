const ITEMS = [
  {
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'customize',
    label: 'Customize',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: (
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export function BottomNav({ tab, onTabChange }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 pt-1.5 pb-1">
        {ITEMS.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-md px-3 py-1 text-xs font-medium transition-colors duration-[var(--dur-micro)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                active
                  ? 'text-accent'
                  : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {/* Green pill indicator behind icon */}
              <span
                className={`flex h-7 items-center justify-center rounded-full px-5 transition-colors duration-[var(--dur-standard)] ${
                  active ? 'bg-accent-tint text-accent' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className={active ? 'font-bold' : 'font-medium'}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
