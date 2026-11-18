import { THEME_COLORS, DEFAULT_SAFE_ZONE, MIN_DIMENSION, MAX_DIMENSION, MAX_PIXELS, WEEKDAYS } from './wallpaperConstants.js'

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

export function scale(base, width, height) {
  // scale factor based on height relative to a reference 2400px
  return clamp((height / 2400) * base, base * 0.5, base * 2)
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  if (rr <= 0) {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.closePath()
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

export function truncateText(ctx, text, maxWidth) {
  if (maxWidth <= 0) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  const ellipsis = '\u2026'
  while (t.length > 0 && ctx.measureText(t + ellipsis).width > maxWidth) {
    t = t.slice(0, -1)
  }
  if (t.length === 0) return ellipsis
  return t + ellipsis
}

export function truncateTextWarn(ctx, text, maxWidth, warnings, label) {
  if (maxWidth <= 0) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  if (warnings) warnings.push(`${label || 'Text'} was truncated: "${text}"`)
  return truncateText(ctx, text, maxWidth)
}

export function wrapText(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? current + ' ' + word : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
      if (lines.length >= maxLines) break
    }
  }
  if (current && lines.length < maxLines) lines.push(current)
  // if leftover words, truncate last line
  if (lines.length === maxLines && ctx.measureText(lines[maxLines - 1]).width > maxWidth) {
    lines[maxLines - 1] = truncateText(ctx, lines[maxLines - 1], maxWidth)
  }
  return lines
}

export function safeZonePixels(height, settings) {
  const topPct = (settings && typeof settings.safeZoneTop === 'number') ? settings.safeZoneTop : DEFAULT_SAFE_ZONE.top
  const bottomPct = (settings && typeof settings.safeZoneBottom === 'number') ? settings.safeZoneBottom : DEFAULT_SAFE_ZONE.bottom
  const top = Math.round(height * clamp(topPct, 0, 0.5))
  const bottom = Math.round(height * clamp(bottomPct, 0, 0.5))
  return { top, bottom, usableHeight: height - top - bottom }
}

export function validateDimensions(width, height) {
  const errors = []
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    errors.push('Dimensions must be finite numbers.')
    return { valid: false, errors }
  }
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    errors.push('Dimensions must be integers.')
  }
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    errors.push(`Dimensions must be at least ${MIN_DIMENSION}px.`)
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    errors.push(`Dimensions must not exceed ${MAX_DIMENSION}px.`)
  }
  if (width * height > MAX_PIXELS) {
    errors.push('Canvas pixel count exceeds safe limit.')
  }
  return { valid: errors.length === 0, errors }
}

export function colorsFor(theme) {
  return THEME_COLORS[theme] || THEME_COLORS.dark
}

export function meetingMinutes(m) {
  const toMin = (t) => {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return 0
    const [h, mm] = t.split(':').map(Number)
    return h * 60 + mm
  }
  return { start: toMin(m.start), end: toMin(m.end) }
}

export function groupMeetingsByDay(schedule) {
  const result = {}
  for (const d of WEEKDAYS) result[d] = []
  const subjects = schedule?.subjects || []
  for (const subject of subjects) {
    for (const meeting of subject.meetings || []) {
      for (const day of meeting.days || []) {
        if (!result[day]) result[day] = []
        result[day].push({ subject, meeting })
      }
    }
  }
  return result
}