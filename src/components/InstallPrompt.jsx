export function InstallPrompt({ canInstall, onInstall, enabled = true }) {
  if (!enabled || !canInstall) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
        <span>Install Esked for quick access.</span>
        <button
          type="button"
          onClick={onInstall}
          className="min-h-[44px] rounded-md bg-accent px-3 text-sm font-medium text-accent-ink hover:bg-accent/90"
        >
          Install app
        </button>
      </div>
    </div>
  )
}