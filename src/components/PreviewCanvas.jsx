import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { renderWallpaper } from '../rendering/wallpaperEngine.js'
import { downloadCanvas, shareCanvas, isShareSupported, sanitizeFilename } from '../rendering/export.js'

function presetDims(settings) {
  const p = settings?.wallpaperPreset
  const map = {
    'iphone-15': [1179, 2556],
    'iphone-15-pro-max': [1290, 2796],
    'android-common': [1080, 2400],
    'android-tall': [1440, 3200],
    phone: [1080, 1920],
    tablet: [1200, 1600],
    desktop: [1920, 1080],
  }
  if (p === 'custom') {
    const w = Number(settings?.width)
    const h = Number(settings?.height)
    if (w > 0 && h > 0) return [w, h]
  }
  return map[p] || [1080, 2400]
}

export function PreviewCanvas({ schedule }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  const [zoom, setZoom] = useState(1)
  const [overlay, setOverlay] = useState(!!schedule?.settings?.showSafeZones)
  const [exporting, setExporting] = useState(false)

  const settings = useMemo(() => schedule?.settings || {}, [schedule])
  const [fullW, fullH] = presetDims(settings)
  const aspect = fullH / fullW

  // preview render
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas) return
    const containerWidth = container ? container.clientWidth : 320
    const baseWidth = Math.max(120, Math.min(containerWidth, 480))
    const previewW = Math.round(baseWidth)
    const previewH = Math.round(baseWidth * aspect)
    const previewSettings = { ...settings, showSafeZones: overlay }
    try {
      const res = renderWallpaper({
        schedule,
        width: previewW,
        height: previewH,
        template: settings.template,
        theme: settings.theme,
        settings: previewSettings,
      })
      // draw rendered canvas into our canvas if different instance
      if (res.canvas !== canvas) {
        canvas.width = previewW
        canvas.height = previewH
        const c2 = canvas.getContext('2d')
        if (c2 && res.canvas) c2.drawImage(res.canvas, 0, 0)
      }
      setWarnings(res.warnings || [])
      setError('')
    } catch (e) {
      setError(e.message || 'Render failed')
    }
  }, [schedule, settings, overlay, aspect])

  const handleDownload = useCallback(async () => {
    if (exporting) return
    setExporting(true)
    setStatus('Generating…')
    setError('')
    try {
      const [w, h] = presetDims(settings)
      const res = renderWallpaper({
        schedule,
        width: w,
        height: h,
        template: settings.template,
        theme: settings.theme,
        settings: { ...settings, showSafeZones: false },
      })
      const filename = sanitizeFilename(schedule?.title) + '.png'
      await downloadCanvas(res.canvas, filename)
      setStatus('Downloaded')
    } catch (e) {
      setError(e.message || 'Export failed')
      setStatus('')
    } finally {
      setExporting(false)
    }
  }, [schedule, settings, exporting])

  const handleShare = useCallback(async () => {
    if (exporting) return
    setExporting(true)
    setStatus('Sharing…')
    setError('')
    try {
      const [w, h] = presetDims(settings)
      const res = renderWallpaper({
        schedule,
        width: w,
        height: h,
        template: settings.template,
        theme: settings.theme,
        settings: { ...settings, showSafeZones: false },
      })
      const filename = sanitizeFilename(schedule?.title) + '.png'
      await shareCanvas(res.canvas, filename)
      setStatus('Shared')
    } catch (e) {
      if (e && e.name === 'AbortError') {
        setStatus('')
      } else {
        setError(e.message || 'Share failed')
        setStatus('')
      }
    } finally {
      setExporting(false)
    }
  }, [schedule, settings, exporting])

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
          Safe zones
        </label>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="min-h-[44px] rounded-md border border-slate-300 px-3 text-sm">-</button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="min-h-[44px] rounded-md border border-slate-300 px-3 text-sm">+</button>
          <button type="button" onClick={() => setZoom(1)} className="min-h-[44px] rounded-md border border-slate-300 px-3 text-sm">Reset</button>
        </div>
      </div>
      <div ref={containerRef} className="flex justify-center overflow-hidden">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <canvas
            ref={canvasRef}
            className="h-auto max-w-full rounded-lg border border-slate-200 shadow-sm"
            aria-label="Wallpaper preview"
          />
        </div>
      </div>
      {warnings.length > 0 ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <ul className="list-disc pl-5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={exporting}
          className="min-h-[44px] rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {exporting ? 'Generating…' : 'Download PNG'}
        </button>
        {isShareSupported() ? (
          <button
            type="button"
            onClick={handleShare}
            disabled={exporting}
            className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Share
          </button>
        ) : null}
      </div>
      {status ? <p className="text-center text-sm text-slate-600">{status}</p> : null}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      <p className="text-center text-xs text-slate-500">
        Output: {fullW} × {fullH}px
      </p>
    </section>
  )
}