export const WALLPAPER_PRESETS = {
  'iphone-15': { width: 1179, height: 2556, label: 'iPhone 15 / 14 Pro' },
  'iphone-15-pro-max': { width: 1290, height: 2796, label: 'iPhone 15 Pro Max' },
  'android-common': { width: 1080, height: 2400, label: 'Android Common' },
  'android-tall': { width: 1440, height: 3200, label: 'Android Tall' },
}

// Back-compat aliases for existing preset keys
export const LEGACY_PRESET_MAP = {
  phone: 'android-common',
  tablet: 'android-common',
  desktop: 'android-common',
}

export const THEME_COLORS = {
  dark: {
    bg: '#020617',
    surface: '#0f172a',
    border: '#1e293b',
    text: '#f1f5f9',
    muted: '#94a3b8',
    accent: '#6366f1',
  },
  light: {
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#6366f1',
  },
}

export const DEFAULT_SAFE_ZONE = { top: 0.16, bottom: 0.14 }

export const MIN_DIMENSION = 200
export const MAX_DIMENSION = 4096
export const MAX_PIXELS = 16_000_000

export const SUPPORTED_TEMPLATES = ['dailyList', 'weeklyColumns', 'todayFocus']
export const SUPPORTED_THEMES = ['dark', 'light']

// Legacy template name mapping
export const LEGACY_TEMPLATE_MAP = {
  classic: 'weeklyColumns',
  compact: 'dailyList',
  minimal: 'todayFocus',
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const DEFAULT_SUBJECT_COLOR = '#3b82f6'