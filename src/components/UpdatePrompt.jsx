export function UpdatePrompt({ available, reloadNeeded, onUpdate, onReload }) {
  if (!available && !reloadNeeded) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        {reloadNeeded ? (
          <span>Update installed. Reload to apply.</span>
        ) : (
          <span>A new version of Esked is available.</span>
        )}
        {reloadNeeded ? (
          <button
            type="button"
            onClick={onReload}
            className="min-h-[44px] rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reload
          </button>
        ) : (
          <button
            type="button"
            onClick={onUpdate}
            className="min-h-[44px] rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Update
          </button>
        )}
      </div>
    </div>
  )
}