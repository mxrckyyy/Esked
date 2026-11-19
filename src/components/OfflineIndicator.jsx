export function OfflineIndicator({ online, enabled = true }) {
  if (!enabled || online) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
        You are offline. Your schedule is saved on this device.
      </div>
    </div>
  )
}