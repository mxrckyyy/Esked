import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'

vi.mock('../hooks/useSchedule.js', () => ({ useSchedule: vi.fn() }))
vi.mock('../hooks/useOnlineStatus.js', () => ({ useOnlineStatus: vi.fn() }))
vi.mock('../hooks/usePwaInstall.js', () => ({ usePwaInstall: vi.fn() }))
vi.mock('../hooks/useServiceWorkerUpdate.js', () => ({ useServiceWorkerUpdate: vi.fn() }))

import { useSchedule } from '../hooks/useSchedule.js'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'
import { usePwaInstall } from '../hooks/usePwaInstall.js'
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate.js'

const baseSchedule = { subjects: [], title: 't', semester: '', settings: { theme: 'light', wallpaperPreset: 'android-common' } }

function setup(overrides = {}) {
  useSchedule.mockReturnValue({
    schedule: baseSchedule, dispatch: vi.fn(), loading: false, saving: false, error: null,
    storageMode: 'persistent', storageWarning: null, isPersistent: true, flush: vi.fn(),
    ...overrides.schedule,
  })
  useOnlineStatus.mockReturnValue(overrides.online ?? true)
  usePwaInstall.mockReturnValue({ canInstall: overrides.canInstall ?? false, installed: false, promptInstall: vi.fn(), ...overrides.install })
  useServiceWorkerUpdate.mockReturnValue({ updateAvailable: overrides.updateAvailable ?? false, reloadNeeded: overrides.reloadNeeded ?? false, update: vi.fn(), reload: vi.fn(), ...overrides.sw })
  Object.defineProperty(navigator, 'userAgent', { value: overrides.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', configurable: true })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App notice priority integration', () => {
  it('shows only offline (highest priority) when all non-critical eligible', () => {
    setup({ online: false, updateAvailable: true, canInstall: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' })
    render(<App />)
    expect(screen.getByText(/you are offline/i)).toBeInTheDocument()
    expect(screen.queryByText(/a new version of esked/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/install esked for quick access/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/install esked on ios/i)).not.toBeInTheDocument()
  })

  it('shows update when offline not eligible', () => {
    setup({ online: true, updateAvailable: true, canInstall: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' })
    render(<App />)
    expect(screen.getByText(/a new version of esked/i)).toBeInTheDocument()
    expect(screen.queryByText(/install esked for quick access/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/install esked on ios/i)).not.toBeInTheDocument()
  })

  it('shows install when only install eligible', () => {
    setup({ online: true, canInstall: true })
    render(<App />)
    expect(screen.getByText(/install esked for quick access/i)).toBeInTheDocument()
  })

  it('shows iOS instructions when only iOS eligible', () => {
    setup({ online: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' })
    render(<App />)
    expect(screen.getByText(/install esked on ios/i)).toBeInTheDocument()
  })

  it('shows next eligible notice when higher priority becomes ineligible', () => {
    setup({ online: false, updateAvailable: true })
    const { rerender } = render(<App />)
    expect(screen.getByText(/you are offline/i)).toBeInTheDocument()
    // make offline no longer eligible
    setup({ online: true, updateAvailable: true })
    rerender(<App />)
    expect(screen.queryByText(/you are offline/i)).not.toBeInTheDocument()
    expect(screen.getByText(/a new version of esked/i)).toBeInTheDocument()
  })

  it('critical storage warning remains visible alongside non-critical notice', () => {
    setup({ online: false, storageMode: 'memory', storageWarning: 'Storage failed. Changes are kept in memory only.' })
    // override schedule with storageWarning via useSchedule return
    useSchedule.mockReturnValue({
      schedule: baseSchedule, dispatch: vi.fn(), loading: false, saving: false, error: null,
      storageMode: 'memory', storageWarning: 'Storage failed. Changes are kept in memory only.', isPersistent: false, flush: vi.fn(),
    })
    render(<App />)
    expect(screen.getByText(/storage failed/i)).toBeInTheDocument()
    expect(screen.getByText(/you are offline/i)).toBeInTheDocument()
  })
})