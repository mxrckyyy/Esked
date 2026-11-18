import { describe, it, expect, vi } from 'vitest'
import { downloadCanvas, shareCanvas, isShareSupported, sanitizeFilename } from './export.js'

function makeCanvas(blob = new Blob(['x'], { type: 'image/png' })) {
  return {
    toBlob(cb) {
      cb(blob)
    },
  }
}

describe('sanitizeFilename', () => {
  it('sanitizes titles', () => {
    expect(sanitizeFilename('My Schedule!')).toBe('my-schedule')
    expect(sanitizeFilename('')).toBe('esked-wallpaper')
    expect(sanitizeFilename('***')).toBe('esked-wallpaper')
  })
})

describe('export', () => {
  it('isShareSupported reflects navigator', () => {
    const result = isShareSupported()
    expect(typeof result).toBe('boolean')
  })

  it('downloadCanvas resolves with blob', async () => {
    const canvas = makeCanvas()
    const blob = await downloadCanvas(canvas)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('downloadCanvas rejects when toBlob yields null', async () => {
    const canvas = { toBlob(cb) { cb(null) } }
    await expect(downloadCanvas(canvas)).rejects.toThrow(/Failed to generate PNG/)
  })

  it('downloadCanvas rejects without toBlob', async () => {
    await expect(downloadCanvas({})).rejects.toThrow(/not supported/)
  })

  it('shareCanvas throws when share unsupported', async () => {
    const canvas = makeCanvas()
    await expect(shareCanvas(canvas)).rejects.toThrow()
  })

  it('shareCanvas constructs File and calls navigator.share', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)
    const origShare = navigator.share
    const origCanShare = navigator.canShare
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })
    try {
      const canvas = makeCanvas()
      await shareCanvas(canvas, 'test.png')
      expect(share).toHaveBeenCalled()
      const arg = share.mock.calls[0][0]
      expect(arg.files[0]).toBeInstanceOf(File)
      expect(arg.files[0].name).toBe('test.png')
    } finally {
      Object.defineProperty(navigator, 'share', { value: origShare, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: origCanShare, configurable: true })
    }
  })

  it('shareCanvas rejects when canShare returns false', async () => {
    const share = vi.fn()
    const canShare = vi.fn().mockReturnValue(false)
    const origShare = navigator.share
    const origCanShare = navigator.canShare
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })
    try {
      const canvas = makeCanvas()
      await expect(shareCanvas(canvas)).rejects.toThrow(/not supported/i)
    } finally {
      Object.defineProperty(navigator, 'share', { value: origShare, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: origCanShare, configurable: true })
    }
  })

  it('shareCanvas handles null blob', async () => {
    const canvas = { toBlob(cb) { cb(null) } }
    const share = vi.fn()
    const canShare = vi.fn().mockReturnValue(true)
    const origShare = navigator.share
    const origCanShare = navigator.canShare
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: canShare, configurable: true })
    try {
      await expect(shareCanvas(canvas)).rejects.toThrow(/Failed to generate PNG/)
    } finally {
      Object.defineProperty(navigator, 'share', { value: origShare, configurable: true })
      Object.defineProperty(navigator, 'canShare', { value: origCanShare, configurable: true })
    }
  })
})