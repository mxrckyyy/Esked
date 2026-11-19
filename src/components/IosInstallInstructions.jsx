import { useState } from 'react'

function isIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOS = /iPad|iPhone|iPod/.test(ua)
  const webkit = /WebKit/.test(ua)
  const standalone = window.navigator.standalone === true
  return iOS && webkit && !standalone
}

export function IosInstallInstructions({ enabled = true }) {
  const [dismissed, setDismissed] = useState(false)
  if (!enabled || dismissed || !isIos()) return null
  return (
    <div className="mx-auto max-w-2xl px-4 pt-2">
      <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">Install Esked on iOS</p>
            <p className="mt-1">Tap the Share button in Safari, then choose "Add to Home Screen" and confirm.</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="min-h-[44px] min-w-[44px] text-ink-3 hover:text-ink-2"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}