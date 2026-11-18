export function InstallPrompt({ canInstall, onInstall }) {
  if (!canInstall) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <span>Install Esked for quick access.</span>
        <button
          type="button"
          onClick={onInstall}
          className="min-h-[44px] rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Install app
        </button>
      </div>
    </div>
  )
}