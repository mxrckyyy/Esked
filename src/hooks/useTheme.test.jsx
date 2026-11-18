import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from './useTheme.js'

function setMatchMedia(matches) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query.includes('dark') ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = ''
  try {
    window.localStorage.clear()
  } catch {}
  vi.restoreAllMocks()
})

describe('useTheme', () => {
  it('defaults to light when no stored pref and OS is light', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(result.current.isManual).toBe(false)
  })

  it('defaults to dark when no stored pref and OS is dark', () => {
    setMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isManual).toBe(false)
  })

  it('stored manual preference overrides OS preference', () => {
    window.localStorage.setItem('esked:theme', 'dark')
    setMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isManual).toBe(true)
  })

  it('toggles theme manually', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
  })

  it('persists manual selection to localStorage', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(window.localStorage.getItem('esked:theme')).toBe('dark')
  })

  it('updates root html class on theme change', () => {
    setMatchMedia(false)
    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    act(() => result.current.setTheme('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('listens to OS changes when no manual preference', () => {
    setMatchMedia(false)
    const listeners = []
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: (ev, cb) => listeners.push(cb),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
    const { result } = renderHook(() => useTheme())
    expect(listeners.length).toBe(1)
    act(() => {
      listeners[0]({ matches: true })
    })
    expect(result.current.theme).toBe('dark')
  })

  it('does not override manual selection on OS change', () => {
    window.localStorage.setItem('esked:theme', 'light')
    setMatchMedia(false)
    const listeners = []
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: (ev, cb) => listeners.push(cb),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.isManual).toBe(true)
    expect(listeners.length).toBe(0)
    // simulate OS change by calling handler if any (none registered)
    expect(result.current.theme).toBe('light')
  })

  it('handles invalid localStorage gracefully', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('unavailable')
    })
    setMatchMedia(true)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.isManual).toBe(false)
    getItem.mockRestore()
  })

  it('handles setTheme storage failure gracefully', () => {
    setMatchMedia(false)
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('dark'))
    expect(result.current.theme).toBe('dark')
    setItem.mockRestore()
  })
})