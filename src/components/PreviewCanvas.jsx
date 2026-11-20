import { useRef, useState, useCallback, useMemo } from 'react'
import { renderWallpaper } from '../rendering/wallpaperEngine.js'
import { downloadCanvas, shareCanvas, isShareSupported, sanitizeFilename } from '../rendering/export.js'
import { WeekPreview } from './WeekPreview.jsx'
import { presetDims } from '../lib/previewUtils.js'
import { Button } from './ui/Button.jsx'
import { Card } from './ui/Card.jsx'

export function PreviewCanvas({ schedule, embedded = false }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  const [zoom, setZoom] = useState(1)
  const [overlay, setOverlay] = useState(!!schedule?.settings?.showSafeZones)
  const [exporting, setExporting] = useState(false)

  const settings = useMemo(() => schedule?.settings || {}, [schedule])
  const [fullW, fullH] = presetDims(settings)

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

  // Shared controls elements
  const controlsElement = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-ink select-none">
        <input
          type="checkbox"
          checked={overlay}
          onChange={(e) => setOverlay(e.target.checked)}
          className="h-4 w-4 rounded border-line-strong accent-accent"
        />
        Safe zones
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="flex min-h-[44px] min-w-[36px] items-center justify-center rounded-md border border-line-strong px-2.5 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          -
        </button>
        <span className="min-w-12 text-center text-sm tabular-nums text-ink">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="flex min-h-[44px] min-w-[36px] items-center justify-center rounded-md border border-line-strong px-2.5 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="flex min-h-[44px] items-center justify-center rounded-md border border-line-strong px-3 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Reset
        </button>
      </div>
    </div>
  )

  const actionButtons = (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        variant="primary"
        size="lg"
        onClick={handleDownload}
        disabled={exporting}
        className="w-full sm:w-auto"
      >
        {exporting ? 'Generating…' : 'Download PNG'}
      </Button>
      {isShareSupported() ? (
        <Button
          variant="outline"
          size="lg"
          onClick={handleShare}
          disabled={exporting}
          className="w-full sm:w-auto"
        >
          Share
        </Button>
      ) : null}
    </div>
  )

  // ── Embedded mode (used inside Schedule & Customize desktop panels) ──
  if (embedded) {
    return (
      <section className="space-y-4">
        {controlsElement}

        <WeekPreview
          schedule={schedule}
          zoom={zoom}
          showSafeZones={overlay}
          canvasRef={canvasRef}
          onWarnings={setWarnings}
          onError={setError}
        />

        {warnings.length > 0 ? (
          <div className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            <ul className="list-disc pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {actionButtons}

        <p aria-live="polite" className="text-center text-sm text-ink-2">{status}</p>
        {error ? <p role="alert" className="text-center text-sm text-danger">{error}</p> : null}
      </section>
    )
  }

  // ── Standalone Preview Tab (Mobile & Desktop) ──
  return (
    <section className="space-y-6">
      {/* Mobile Heading (<1024px) */}
      <div className="lg:hidden">
        <h2 className="text-xl font-bold text-ink">Preview</h2>
        <p className="mt-1 text-sm text-ink-3">Your wallpaper is ready.</p>
      </div>

      {/* Desktop Grid Layout (≥1024px) / Stacked on Mobile */}
      <div className="lg:grid lg:grid-cols-[1fr_1.3fr] lg:gap-8 lg:items-start">
        {/* Left Column (Desktop) / Top Controls (Mobile) */}
        <div className="space-y-6">
          {/* Big Desktop Heading (≥1024px) */}
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight text-ink lg:text-3xl">Preview</h2>
            <p className="mt-1 text-sm text-ink-3">Your wallpaper is ready.</p>
          </div>

          {/* Controls Card */}
          <Card className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
              Preview controls
            </h3>

            {controlsElement}

            <p className="text-center text-xs text-ink-3">
              Output: {fullW} × {fullH}px
            </p>

            <div className="border-t border-line pt-4">
              {actionButtons}
            </div>

            <p aria-live="polite" className="text-center text-sm text-ink-2">{status}</p>
            {error ? <p role="alert" className="text-center text-sm text-danger">{error}</p> : null}

            {warnings.length > 0 ? (
              <div className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
                <ul className="list-disc pl-5">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </div>

        {/* Right Column (Desktop) / Center Mockup (Mobile) */}
        <div className="flex justify-center pt-2 lg:pt-0">
          <div className="w-full max-h-[85dvh]">
            <WeekPreview
              schedule={schedule}
              zoom={zoom}
              showSafeZones={overlay}
              canvasRef={canvasRef}
              onWarnings={setWarnings}
              onError={setError}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
