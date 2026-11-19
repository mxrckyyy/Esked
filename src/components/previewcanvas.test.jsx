import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PreviewCanvas } from './PreviewCanvas.jsx'
import { createDefaultSchedule } from '../lib/model.js'

describe('PreviewCanvas', () => {
  it('renders canvas and buttons without crashing', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
  })

  it('renders safe-zone toggle and zoom controls', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByLabelText(/safe zones/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('shows output dimensions', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByText(/output:/i)).toBeInTheDocument()
  })
})

describe('PreviewCanvas export feedback', () => {
  it('shows Downloaded after successful download', async () => {
    vi.resetModules()
    vi.doMock('../rendering/wallpaperEngine.js', () => ({
      renderWallpaper: () => ({ canvas: { toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' })) }, warnings: [] }),
    }))
    vi.doMock('../rendering/export.js', () => ({
      downloadCanvas: vi.fn().mockResolvedValue(undefined),
      shareCanvas: vi.fn(),
      isShareSupported: () => false,
      sanitizeFilename: (t) => t || 'esked',
    }))
    const { PreviewCanvas } = await import('./PreviewCanvas.jsx')
    const { createDefaultSchedule } = await import('../lib/model.js')
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    fireEvent.click(screen.getByRole('button', { name: /download png/i }))
    await waitFor(() => expect(screen.getByText(/downloaded/i)).toBeInTheDocument())
  })

  it('shows error on download failure', async () => {
    vi.resetModules()
    vi.doMock('../rendering/wallpaperEngine.js', () => ({
      renderWallpaper: () => ({ canvas: { toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' })) }, warnings: [] }),
    }))
    vi.doMock('../rendering/export.js', () => ({
      downloadCanvas: vi.fn().mockRejectedValue(new Error('disk full')),
      shareCanvas: vi.fn(),
      isShareSupported: () => false,
      sanitizeFilename: (t) => t || 'esked',
    }))
    const { PreviewCanvas } = await import('./PreviewCanvas.jsx')
    const { createDefaultSchedule } = await import('../lib/model.js')
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    fireEvent.click(screen.getByRole('button', { name: /download png/i }))
    await waitFor(() => expect(screen.getByText(/disk full/i)).toBeInTheDocument())
  })

  it('hides share button when sharing unsupported', async () => {
    vi.resetModules()
    vi.doMock('../rendering/wallpaperEngine.js', () => ({
      renderWallpaper: () => ({ canvas: { toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' })) }, warnings: [] }),
    }))
    vi.doMock('../rendering/export.js', () => ({
      downloadCanvas: vi.fn(),
      shareCanvas: vi.fn(),
      isShareSupported: () => false,
      sanitizeFilename: (t) => t || 'esked',
    }))
    const { PreviewCanvas } = await import('./PreviewCanvas.jsx')
    const { createDefaultSchedule } = await import('../lib/model.js')
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument()
  })
})