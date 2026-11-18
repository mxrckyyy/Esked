import { useState, useEffect, useCallback } from 'react'

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [reloadNeeded, setReloadNeeded] = useState(false)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Conservative: do not auto-reload; let the user choose when to reload
    // so unsaved schedule changes are not interrupted.
    const onControllerChange = () => {
      setReloadNeeded(true)
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      setRegistration(reg)
      if (reg.waiting) setUpdateAvailable(true)
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true)
          }
        })
      })
    }).catch(() => {})

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const update = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [registration])

  const reload = useCallback(() => {
    window.location.reload()
  }, [])

  return { updateAvailable, reloadNeeded, update, reload }
}