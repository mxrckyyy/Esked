export function UpdatePrompt({ available, reloadNeeded, onUpdate, onReload, enabled = true }) {
  if (!enabled || (!available && !reloadNeeded)) return null
  return (
    <div className="mx-auto max-w-2xl px-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink-2">
        {reloadNeeded ? (
          <span>Update installed. Reload to apply.</span>
        ) : (
          <span>A new version of Esked is available.</span>
        )}
        {reloadNeeded ? (
          <button
            type="button"
            onClick={onReload}
            className="min-h-[44px] rounded-md bg-accent px-3 text-sm font-medium text-accent-ink hover:bg-accent/90"
          >
            Reload
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpdate}
            className="min-h-[44px] rounded-md bg-accent px-3 text-sm font-medium text-accent-ink hover:bg-accent/90"
          >
            Update
          </button>
        )}
      </div>
    </div>
  )
}