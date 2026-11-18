import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'esked:theme'

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
    return null
  } catch {
    return null
  }
}

function getSystemTheme() {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
  } catch {
    /* ignore */
  }
  return 'light'
}

function applyThemeClass(theme) {
  try {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    root.style.colorScheme = theme
  } catch {
    /* ignore */
  }
}

export function useTheme() {
  const [manual, setManual] = useState(() => readStoredTheme() !== null)
  const [theme, setThemeState] = useState(() => {
    const stored = readStoredTheme()
    return stored || getSystemTheme()
  })

  // Keep the root element in sync with React state.
  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light'
    setManual(true)
    setThemeState(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* storage unavailable; keep in-memory */
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Clear manual override is not exposed; manual stays true once set.
  // Listen to OS changes only when there is no manual override.
  useEffect(() => {
    if (manual) return
    let mq
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    if (!mq) return
    const handler = (event) => {
      setThemeState(event.matches ? 'dark' : 'light')
    }
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    // Safari < 14 fallback
    if (typeof mq.addListener === 'function') {
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }
    return undefined
  }, [manual])

  return { theme, toggle, setTheme, isManual: manual }
}