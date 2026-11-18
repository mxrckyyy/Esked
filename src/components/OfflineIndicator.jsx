export function OfflineIndicator({ online }) {
  if (online) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        You are offline. Your schedule is saved on this device.
      </div>
    </div>
  )
}