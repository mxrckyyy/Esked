import { useState } from 'react'

function isIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOS = /iPad|iPhone|iPod/.test(ua)
  const webkit = /WebKit/.test(ua)
  const standalone = window.navigator.standalone === true
  return iOS && webkit && !standalone
}

export function IosInstallInstructions() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || !isIos()) return null
  return (
    <div className="mx-auto max-w-4xl px-4 pt-2">
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">Install Esked on iOS</p>
            <p className="mt-1">Tap the Share button in Safari, then choose "Add to Home Screen" and confirm.</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="min-h-[44px] min-w-[44px] text-slate-500 hover:text-slate-700"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}