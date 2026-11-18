import { describe, it, expect } from 'vitest'
import { downloadCanvas, shareCanvas, isShareSupported } from './export.js'

function makeCanvas(blob = new Blob(['x'], { type: 'image/png' })) {
  return {
    toBlob(cb) {
      cb(blob)
    },
  }
}

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
    // navigator.share likely undefined in jsdom
    await expect(shareCanvas(canvas)).rejects.toThrow()
  })
})