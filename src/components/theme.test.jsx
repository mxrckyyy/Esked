import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { resetDbCache } from '../storage/db.js'
import App from '../App'

beforeEach(async () => {
  resetDbCache()
  try {
    const { getDb } = await import('../storage/db.js')
    const db = await getDb()
    await db.clear('schedules')
    await db.clear('meta')
  } catch {}
  vi.restoreAllMocks()
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = ''
  try {
    window.localStorage.clear()
  } catch {}
})

describe('Theme toggle', () => {
  it('renders an accessible toggle button', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    const toggle = screen.getAllByRole('button', { name: /switch to (light|dark) mode/i })[0]
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-pressed')
  })

  it('toggles the application theme class on click', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    const toggle = screen.getAllByRole('button', { name: /switch to (light|dark) mode/i })[0]
    const wasDark = document.documentElement.classList.contains('dark')
    fireEvent.click(toggle)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(!wasDark)
    })
  })

  it('does not change the wallpaper theme setting', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    // switch to customize tab
    fireEvent.click(screen.getByRole('button', { name: /customize/i }))
    await waitFor(() => expect(screen.getByLabelText(/theme/i)).toBeInTheDocument())
    const wallpaperTheme = screen.getByLabelText(/theme/i)
    const before = wallpaperTheme.value
    // toggle app theme
    // find toggle (still in header)
    const toggle = screen.getAllByRole('button', { name: /switch to (light|dark) mode/i })[0]
    fireEvent.click(toggle)
    expect(wallpaperTheme.value).toBe(before)
  })
})