// Backward-compatible facade over the new wallpaper engine.
export { renderWallpaper } from './wallpaperEngine.js'

import { WALLPAPER_PRESETS as NEW_PRESETS } from './wallpaperConstants.js'

// Unified preset map: new presets plus legacy aliases.
export const WALLPAPER_PRESETS = {
  ...NEW_PRESETS,
  phone: { width: 1080, height: 1920, label: 'Phone (9:16)' },
  tablet: { width: 1200, height: 1600, label: 'Tablet (3:4)' },
  desktop: { width: 1920, height: 1080, label: 'Desktop (16:9)' },
}

// Legacy template name mapping for display/compatibility.
export const LEGACY_TEMPLATE_MAP = {
  classic: 'weeklyColumns',
  compact: 'dailyList',
  minimal: 'todayFocus',
}

// Re-export helpers/constants (excluding conflicting WALLPAPER_PRESETS).
export {
  THEME_COLORS,
  SUPPORTED_TEMPLATES,
  SUPPORTED_THEMES,
  LEGACY_TEMPLATE_MAP as _LTM,
} from './wallpaperConstants.js'
export * from './wallpaperUtils.js'