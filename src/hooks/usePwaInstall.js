import { useState, useEffect, useCallback } from 'react'

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const installedHandler = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return null
    deferred.prompt()
    const choice = await deferred.userChoice
    if (choice && choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferred(null)
    return choice
  }, [deferred])

  return {
    canInstall: !!deferred && !installed,
    installed,
    promptInstall,
  }
}