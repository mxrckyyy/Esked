/**
 * PhoneMockup — shared phone frame wrapper for wallpaper previews.
 *
 * Props:
 *   zoom      – scale factor (default 1)
 *   children  – content inside the screen (canvas, overlays)
 *   className – extra classes on the outer wrapper
 */
export function PhoneMockup({ zoom = 1, children, className = '' }) {
  return (
    <div className={`flex justify-center overflow-hidden ${className}`}>
      <div className="w-full max-w-xs rounded-[2rem] border border-line bg-surface-raised p-2 shadow-overlay sm:max-w-sm md:max-w-md">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-line bg-canvas">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
