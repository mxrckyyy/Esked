import '@testing-library/jest-dom'

// Minimal Canvas 2D context polyfill for jsdom, which does not implement
// canvas rendering. This keeps PreviewCanvas rendering exercised in tests
// without suppressing real "Canvas 2D context is unavailable" errors in
// production code.
if (typeof HTMLCanvasElement !== 'undefined') {
  const noop = () => {}
  const handler = {
    get(_target, prop) {
      if (prop === 'measureText') return () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 })
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0 })
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => ({ addColorStop: noop })
      return noop
    },
    set() { return true },
  }
  HTMLCanvasElement.prototype.getContext = function (type) {
    if (type === '2d') return new Proxy({}, handler)
    return null
  }
}