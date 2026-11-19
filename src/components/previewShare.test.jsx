import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('PreviewCanvas share feedback', () => {
  it('shows Shared after successful share', async () => {
    vi.doMock('../rendering/wallpaperEngine.js', () => ({
      renderWallpaper: () => ({ canvas: { toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' })) }, warnings: [] }),
    }))
    vi.doMock('../rendering/export.js', () => ({
      downloadCanvas: vi.fn(),
      shareCanvas: vi.fn().mockResolvedValue(undefined),
      isShareSupported: () => true,
      sanitizeFilename: (t) => t || 'esked',
    }))
    const { PreviewCanvas } = await import('./PreviewCanvas.jsx')
    const { createDefaultSchedule } = await import('../lib/model.js')
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    fireEvent.click(screen.getByRole('button', { name: /share/i }))
    await waitFor(() => expect(screen.getByText(/shared/i)).toBeInTheDocument())
    expect(screen.queryByText(/failed|error/i)).not.toBeInTheDocument()
  })

  it('shows no error on share cancellation (AbortError)', async () => {
    const abortErr = new Error('cancelled')
    abortErr.name = 'AbortError'
    vi.doMock('../rendering/wallpaperEngine.js', () => ({
      renderWallpaper: () => ({ canvas: { toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' })) }, warnings: [] }),
    }))
    vi.doMock('../rendering/export.js', () => ({
      downloadCanvas: vi.fn(),
      shareCanvas: vi.fn().mockRejectedValue(abortErr),
      isShareSupported: () => true,
      sanitizeFilename: (t) => t || 'esked',
    }))
    const { PreviewCanvas } = await import('./PreviewCanvas.jsx')
    const { createDefaultSchedule } = await import('../lib/model.js')
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    fireEvent.click(screen.getByRole('button', { name: /share/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share/i })).not.toBeDisabled()
    })
    expect(screen.queryByText(/failed|error/i)).not.toBeInTheDocument()
  })
})