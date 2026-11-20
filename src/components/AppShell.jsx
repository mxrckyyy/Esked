import { BottomNav } from './BottomNav.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

const TABS = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'customize', label: 'Customize' },
  { id: 'preview', label: 'Preview' },
]

export function AppShell({
  tab,
  onTabChange,
  theme,
  onToggleTheme,
  saving,
  storageMode,
  children,
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* ── Header (56px) ── */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="app-container flex h-14 items-center justify-between gap-3 md:grid md:grid-cols-[1fr_auto_1fr]">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              Esked
            </h1>
            <span className="hidden text-sm text-ink-3 md:inline">
              Offline-first schedule wallpapers
            </span>
          </div>

          {/* Desktop centered navigation (≥768px) */}
          <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="Primary">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`min-h-[44px] rounded-[var(--radius-button)] px-4 text-sm font-medium transition-colors duration-[var(--dur-micro)] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                  tab === t.id
                    ? 'bg-accent text-accent-ink'
                    : 'border border-line text-ink-2 hover:bg-surface-raised'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Theme toggle */}
          <div className="flex justify-end shrink-0">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        id="main"
        tabIndex="-1"
        className="min-h-[calc(100dvh-3.5rem)] bg-canvas text-ink"
      >
        <div className="content-with-bottom-nav app-container py-6">
          {children}
        </div>
      </main>

      {/* ── Footer (≥1024px) ── */}
      <footer
        className="hidden app-container pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] text-xs text-ink-3 lg:block"
        aria-live="polite"
      >
        {saving
          ? 'Saving…'
          : storageMode === 'persistent'
            ? 'Saved locally'
            : 'Memory only'}
      </footer>

      {/* ── Bottom tab bar (mobile <768px) ── */}
      <BottomNav tab={tab} onTabChange={onTabChange} />
    </>
  )
}
