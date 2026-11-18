import { useEffect, useRef, useState } from 'react'
import { renderWallpaper } from '../rendering/wallpaper.js'
import { downloadCanvas, shareCanvas, isShareSupported } from '../rendering/export.js'

export function PreviewCanvas({ schedule }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      renderWallpaper(canvas, schedule)
      // eslint-disable-next-line react/set-state-in-effect
      setError('')
    } catch (e) {
      // eslint-disable-next-line react/set-state-in-effect
      setError(e.message || 'Render failed')
    }
  }, [schedule])

  async function handleDownload() {
    setStatus('Preparing…')
    setError('')
    try {
      await downloadCanvas(canvasRef.current)
      setStatus('Downloaded')
    } catch (e) {
      setError(e.message || 'Download failed')
      setStatus('')
    }
  }

  async function handleShare() {
    setStatus('Sharing…')
    setError('')
    try {
      await shareCanvas(canvasRef.current)
      setStatus('Shared')
    } catch (e) {
      setError(e.message || 'Share failed')
      setStatus('')
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="h-auto max-w-full rounded-lg border border-slate-200 shadow-sm"
          aria-label="Wallpaper preview"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          Download PNG
        </button>
        {isShareSupported() ? (
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50"
          >
            Share
          </button>
        ) : null}
      </div>
      {status ? <p className="text-center text-sm text-slate-600">{status}</p> : null}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </section>
  )
}
