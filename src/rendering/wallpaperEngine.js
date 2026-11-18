import {
  WALLPAPER_PRESETS,
  LEGACY_PRESET_MAP,
  SUPPORTED_TEMPLATES,
  SUPPORTED_THEMES,
  LEGACY_TEMPLATE_MAP,
} from './wallpaperConstants.js'
import { colorsFor, validateDimensions, safeZonePixels } from './wallpaperUtils.js'
import { renderDailyList } from './templates/dailyList.js'
import { renderWeeklyColumns } from './templates/weeklyColumns.js'
import { renderTodayFocus } from './templates/todayFocus.js'

function resolvePreset(preset) {
  if (!preset) return null
  if (WALLPAPER_PRESETS[preset]) return WALLPAPER_PRESETS[preset]
  const mapped = LEGACY_PRESET_MAP[preset]
  if (mapped && WALLPAPER_PRESETS[mapped]) return WALLPAPER_PRESETS[mapped]
  return null
}

function resolveTemplate(t) {
  if (SUPPORTED_TEMPLATES.includes(t)) return t
  if (LEGACY_TEMPLATE_MAP[t]) return LEGACY_TEMPLATE_MAP[t]
  return null
}

function isCanvas(v) {
  return !!v && typeof v.getContext === 'function' && typeof v.width === 'number'
}

export function renderWallpaper(...args) {
  // Legacy call: renderWallpaper(canvas, schedule, settingsOverride)
  if (args.length >= 2 && isCanvas(args[0])) {
    const [canvas, schedule, settingsOverride] = args
    const settings = { ...(schedule?.settings || {}), ...(settingsOverride || {}) }
    const presetKey = settings.wallpaperPreset || settings.preset || 'phone'
    const preset = resolvePreset(presetKey) || WALLPAPER_PRESETS['android-common']
    const width = settings.width || preset.width
    const height = settings.height || preset.height
    const template = resolveTemplate(settings.template) || 'dailyList'
    const theme = SUPPORTED_THEMES.includes(settings.theme) ? settings.theme : 'dark'
    const result = renderEngine({ schedule, width, height, template, theme, settings, canvas })
    return result
  }

  const options = args[0] || {}
  return renderEngine(options)
}

function renderEngine(options) {
  const warnings = []
  const schedule = options.schedule || {}
  // dimensions
  let width = options.width
  let height = options.height
  if (width == null || height == null) {
    const presetKey = options.preset || options.wallpaperPreset || schedule?.settings?.wallpaperPreset || 'phone'
    const preset = resolvePreset(presetKey) || resolvePreset('android-common')
    if (preset) {
      width = width == null ? preset.width : width
      height = height == null ? preset.height : height
    }
  }
  width = Number(width)
  height = Number(height)

  const v = validateDimensions(width, height)
  if (!v.valid) {
    throw new Error(v.errors.join(' '))
  }

  const templateInput = options.template || schedule?.settings?.template || 'dailyList'
  const template = resolveTemplate(templateInput)
  if (!template) {
    throw new Error(`Unsupported template: ${templateInput}`)
  }
  const themeInput = options.theme || schedule?.settings?.theme || 'dark'
  const theme = SUPPORTED_THEMES.includes(themeInput) ? themeInput : null
  if (!theme) {
    throw new Error(`Unsupported theme: ${themeInput}`)
  }

  const settings = { ...(schedule?.settings || {}), ...(options.settings || {}) }
  // merge selectedDay etc from options
  if (options.selectedDay != null) settings.selectedDay = options.selectedDay
  if (options.currentTimeMinutes != null) settings.currentTimeMinutes = options.currentTimeMinutes

  // safe zones
  const sz = safeZonePixels(height, settings)

  // canvas
  let canvas = options.canvas
  if (!canvas) {
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      canvas = document.createElement('canvas')
    } else {
      // node/test fallback
      canvas = { width: 0, height: 0, getContext: () => null }
    }
  }
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.')
  }

  // background
  const colors = colorsFor(theme)
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, width, height)

  // dispatch
  if (template === 'dailyList') renderDailyList(ctx, width, height, schedule, settings, colors, sz, warnings)
  else if (template === 'weeklyColumns') renderWeeklyColumns(ctx, width, height, schedule, settings, colors, sz, warnings)
  else if (template === 'todayFocus') renderTodayFocus(ctx, width, height, schedule, settings, colors, sz, warnings)

  // safe zone visualization if requested
  if (settings.showSafeZones) {
    ctx.save()
    ctx.strokeStyle = colors.muted
    ctx.lineWidth = Math.max(1, Math.round(width * 0.002))
    ctx.setLineDash([Math.round(width * 0.012), Math.round(width * 0.008)])
    ctx.strokeRect(0, sz.top, width, height - sz.top - sz.bottom)
    ctx.setLineDash([])
    ctx.restore()
  }

  // warnings for empty schedule
  const subjects = schedule?.subjects || []
  const hasMeetings = subjects.some((s) => (s.meetings || []).some((m) => (m.days || []).length))
  if (!hasMeetings) warnings.push('Schedule has no meetings to render.')

  // long title warning
  if (schedule?.title && schedule.title.length > 40) warnings.push('Schedule title is long and may be truncated.')

  return { canvas, width, height, template, theme, warnings }
}

// re-export validateDimensions from utils for tests
export { validateDimensions, safeZonePixels } from './wallpaperUtils.js'