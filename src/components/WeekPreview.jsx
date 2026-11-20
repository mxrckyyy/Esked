import { useEffect, useRef, useMemo } from 'react'
import { renderWallpaper } from '../rendering/wallpaperEngine.js'
import { MIN_DIMENSION } from '../rendering/wallpaperConstants.js'
import { PhoneMockup } from './PhoneMockup.jsx'
import { presetDims } from '../lib/previewUtils.js'

/**
 * WeekPreview — ONE shared live wallpaper preview component.
 *
 * Uses renderWallpaper() engine as the single source of truth so
 * preview and export never disagree.
 *
 * Props:
 *   schedule      – schedule state object
 *   settings      – optional settings override
 *   zoom          – zoom scale (default 1)
 *   showSafeZones – whether to display dashed safe-zone overlay bands
 *   canvasRef     – optional forwarded canvas ref
 *   onWarnings    – callback receiving warnings array
 *   onError       – callback receiving error string
 *   className     – optional classes
 */
export function WeekPreview({
  schedule,
  settings: customSettings,
  zoom = 1,
  showSafeZones = false,
  canvasRef: forwardedCanvasRef,
  onWarnings,
  onError,
  className = '',
}) {
  const localCanvasRef = useRef(null)
  const containerRef = useRef(null)
  const canvasRef = forwardedCanvasRef || localCanvasRef

  const settings = useMemo(
    () => customSettings || schedule?.settings || {},
    [customSettings, schedule?.settings],
  )
  const [fullW, fullH] = presetDims(settings)
  const aspect = fullH / fullW

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas) return

    const containerWidth = container ? container.clientWidth : 320
    const baseWidth = Math.max(MIN_DIMENSION, Math.min(containerWidth || MIN_DIMENSION, 640))
    const previewW = Math.round(baseWidth)
    const previewH = Math.round(baseWidth * aspect)
    const previewSettings = { ...settings, showSafeZones: false }

    try {
      const res = renderWallpaper({
        schedule,
        width: previewW,
        height: previewH,
        template: settings.template,
        theme: settings.theme,
        settings: previewSettings,
      })

      if (res.canvas !== canvas) {
        canvas.width = previewW
        canvas.height = previewH
        const c2 = canvas.getContext('2d')
        if (c2 && res.canvas) c2.drawImage(res.canvas, 0, 0)
      }

      onWarnings?.(res.warnings || [])
      onError?.('')
    } catch (e) {
      onError?.(e.message || 'Render failed')
    }
  }, [schedule, settings, aspect, canvasRef, onWarnings, onError])

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <PhoneMockup zoom={zoom}>
        {/* Rendered canvas (Single source of truth) */}
        <canvas
          ref={canvasRef}
          className="block h-auto max-w-full"
          role="img"
          aria-label="Wallpaper preview"
        />

        {/* Preview-only safe zone bands with label "Safe zone" */}
        {showSafeZones ? (
          <>
            <div
              className="pointer-events-none absolute top-0 left-0 right-0 flex h-[16%] select-none items-center justify-center border-b border-dashed border-[var(--safe-stroke)] bg-[var(--safe-fill)]/30 text-xs font-semibold tracking-wider text-[var(--safe-text)]"
              aria-hidden="true"
            >
              Safe zone
            </div>
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-[14%] select-none items-center justify-center border-t border-dashed border-[var(--safe-stroke)] bg-[var(--safe-fill)]/30 text-xs font-semibold tracking-wider text-[var(--safe-text)]"
              aria-hidden="true"
            >
              Safe zone
            </div>
          </>
        ) : null}
      </PhoneMockup>
    </div>
  )
}
