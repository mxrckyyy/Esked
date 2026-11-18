// Backward-compatible facade over the new wallpaper engine.
export { renderWallpaper } from './wallpaperEngine.js'
export { WALLPAPER_PRESETS as NEW_PRESETS } from './wallpaperConstants.js'

// Legacy preset keys used by earlier phases.
export const WALLPAPER_PRESETS = {
  phone: { width: 1080, height: 1920, label: 'Phone (9:16)' },
  tablet: { width: 1200, height: 1600, label: 'Tablet (3:4)' },
  desktop: { width: 1920, height: 1080, label: 'Desktop (16:9)' },
}

// Re-export helpers/constants for compatibility.
export * from './wallpaperConstants.js'
export * from './wallpaperUtils.js'