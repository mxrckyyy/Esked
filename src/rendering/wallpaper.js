import { WEEKDAYS } from '../lib/model.js'

export const WALLPAPER_PRESETS = {
  phone: { width: 1080, height: 1920, label: 'Phone (9:16)' },
  tablet: { width: 1200, height: 1600, label: 'Tablet (3:4)' },
  desktop: { width: 1920, height: 1080, label: 'Desktop (16:9)' },
}

function themeColors(theme) {
  if (theme === 'dark') {
    return { bg: '#0f172a', fg: '#f1f5f9', muted: '#94a3b8', grid: '#1e293b' }
  }
  return { bg: '#ffffff', fg: '#0f172a', muted: '#64748b', grid: '#e2e8f0' }
}

function toMinutes(t) {
  if (!t || !/^\d{2}:\d{2}$/.test(t)) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function allMeetings(schedule) {
  const out = []
  for (const s of schedule.subjects || []) {
    for (const m of s.meetings || []) {
      out.push({ subject: s, meeting: m })
    }
  }
  return out
}

function daysWithMeetings(schedule) {
  const set = new Set()
  for (const { meeting } of allMeetings(schedule)) {
    for (const d of meeting.days || []) set.add(d)
  }
  const sorted = WEEKDAYS.filter((d) => set.has(d))
  return sorted.length ? sorted : WEEKDAYS.slice(0, 5)
}

function timeRange(schedule) {
  const ms = allMeetings(schedule)
  if (!ms.length) return { min: 8 * 60, max: 18 * 60 }
  let min = Infinity
  let max = -Infinity
  for (const { meeting } of ms) {
    min = Math.min(min, toMinutes(meeting.start))
    max = Math.max(max, toMinutes(meeting.end))
  }
  if (max - min < 60) {
    min -= 30
    max += 30
  }
  return { min, max }
}

function drawHeader(ctx, schedule, colors) {
  ctx.fillStyle = colors.fg
  ctx.font = 'bold 56px system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(schedule.title || 'My Schedule', 48, 48)
  if (schedule.semester) {
    ctx.font = '28px system-ui, sans-serif'
    ctx.fillStyle = colors.muted
    ctx.fillText(schedule.semester, 48, 112)
  }
}

function drawClassic(ctx, W, H, schedule, settings) {
  const colors = themeColors(settings.theme)
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, W, H)
  drawHeader(ctx, schedule, colors)

  const meetings = allMeetings(schedule)
  if (!meetings.length) {
    ctx.fillStyle = colors.muted
    ctx.font = '36px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('No classes scheduled', W / 2, H / 2)
    ctx.textAlign = 'left'
    return
  }

  const days = daysWithMeetings(schedule)
  const { min, max } = timeRange(schedule)
  const total = max - min
  const gridTop = 180
  const gridBottom = H - 60
  const gridH = gridBottom - gridTop
  const left = 48
  const right = W - 48
  const colW = (right - left) / days.length

  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillStyle = colors.fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  days.forEach((d, i) => {
    ctx.fillText(d, left + i * colW + colW / 2, gridTop - 30)
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  for (let i = 0; i <= days.length; i++) {
    const x = left + i * colW
    ctx.beginPath()
    ctx.moveTo(x, gridTop)
    ctx.lineTo(x, gridBottom)
    ctx.stroke()
  }

  for (const { subject, meeting } of meetings) {
    for (const day of meeting.days || []) {
      const ci = days.indexOf(day)
      if (ci < 0) continue
      const s = toMinutes(meeting.start)
      const e = toMinutes(meeting.end)
      const y1 = gridTop + ((s - min) / total) * gridH
      const y2 = gridTop + ((e - min) / total) * gridH
      const h = Math.max(4, y2 - y1)
      const x = left + ci * colW + 6
      const w = colW - 12
      ctx.fillStyle = subject.color || '#3b82f6'
      roundRect(ctx, x, y1, w, h, 10)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px system-ui, sans-serif'
      ctx.textBaseline = 'top'
      const name = subject.name || 'Subject'
      ctx.fillText(truncate(ctx, name, w - 12), x + 8, y1 + 6)
      let ty = y1 + 30
      if (settings.showTime) {
        ctx.font = '16px system-ui, sans-serif'
        ctx.fillText(`${meeting.start}-${meeting.end}`, x + 8, ty)
        ty += 20
      }
      if (settings.showRoom && meeting.room) {
        ctx.font = '16px system-ui, sans-serif'
        ctx.fillText(truncate(ctx, meeting.room, w - 12), x + 8, ty)
      }
    }
  }
}

function drawCompact(ctx, W, H, schedule, settings) {
  const colors = themeColors(settings.theme)
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, W, H)
  drawHeader(ctx, schedule, colors)

  const meetings = allMeetings(schedule)
  const days = daysWithMeetings(schedule)
  let y = 180
  ctx.textBaseline = 'top'

  if (!meetings.length) {
    ctx.fillStyle = colors.muted
    ctx.font = '36px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('No classes scheduled', W / 2, H / 2)
    ctx.textAlign = 'left'
    return
  }

  for (const day of days) {
    ctx.fillStyle = colors.fg
    ctx.font = 'bold 32px system-ui, sans-serif'
    ctx.fillText(day, 48, y)
    y += 44
    const dayMeetings = meetings
      .filter(({ meeting }) => (meeting.days || []).includes(day))
      .sort((a, b) => toMinutes(a.meeting.start) - toMinutes(b.meeting.start))
    for (const { subject, meeting } of dayMeetings) {
      ctx.fillStyle = subject.color || '#3b82f6'
      ctx.fillRect(48, y + 4, 6, 60)
      ctx.fillStyle = colors.fg
      ctx.font = 'bold 26px system-ui, sans-serif'
      ctx.fillText(truncate(ctx, subject.name || 'Subject', W - 120), 68, y)
      let line = ''
      if (settings.showTime) line += `${meeting.start} - ${meeting.end}`
      if (settings.showRoom && meeting.room) line += (line ? '  ·  ' : '') + meeting.room
      ctx.font = '20px system-ui, sans-serif'
      ctx.fillStyle = colors.muted
      ctx.fillText(truncate(ctx, line, W - 120), 68, y + 32)
      y += 76
      if (y > H - 60) return
    }
    y += 16
  }
}

function drawMinimal(ctx, W, H, schedule, settings) {
  const colors = themeColors(settings.theme)
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = colors.fg
  ctx.font = 'bold 72px system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(schedule.title || 'Schedule', 48, 48)
  if (schedule.semester) {
    ctx.font = '32px system-ui, sans-serif'
    ctx.fillStyle = colors.muted
    ctx.fillText(schedule.semester, 48, 128)
  }

  const meetings = allMeetings(schedule)
  const days = daysWithMeetings(schedule)
  let y = 200
  if (!meetings.length) {
    ctx.fillStyle = colors.muted
    ctx.font = '36px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('No classes', W / 2, H / 2)
    ctx.textAlign = 'left'
    return
  }
  for (const day of days) {
    ctx.fillStyle = colors.fg
    ctx.font = 'bold 40px system-ui, sans-serif'
    ctx.fillText(day, 48, y)
    y += 52
    const dayMeetings = meetings
      .filter(({ meeting }) => (meeting.days || []).includes(day))
      .sort((a, b) => toMinutes(a.meeting.start) - toMinutes(b.meeting.start))
    for (const { subject, meeting } of dayMeetings) {
      ctx.fillStyle = subject.color || '#3b82f6'
      ctx.beginPath()
      ctx.arc(60, y + 14, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = colors.fg
      ctx.font = '28px system-ui, sans-serif'
      let text = subject.name || 'Subject'
      if (settings.showTime) text += `  ${meeting.start}-${meeting.end}`
      if (settings.showRoom && meeting.room) text += `  ${meeting.room}`
      ctx.fillText(truncate(ctx, text, W - 120), 80, y)
      y += 44
      if (y > H - 60) return
    }
    y += 24
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
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

function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1)
  }
  return t + '…'
}

// eslint-disable-next-line no-unused-vars
function drawSafeZones(ctx, W, H, theme) {
  const colors = themeColors(theme)
  ctx.save()
  ctx.strokeStyle = colors.muted
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  const margin = Math.round(W * 0.06)
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2)
  // Top/bottom safe bands (common notch/home-indicator areas).
  ctx.fillStyle = colors.muted
  ctx.globalAlpha = 0.08
  ctx.fillRect(0, 0, W, margin)
  ctx.fillRect(0, H - margin, W, margin)
  ctx.globalAlpha = 1
  ctx.setLineDash([])
  ctx.restore()
}

export function renderWallpaper(canvas, schedule, settingsOverride) {
  if (!canvas) return
  const settings = { ...(schedule.settings || {}), ...(settingsOverride || {}) }
  const preset = WALLPAPER_PRESETS[settings.wallpaperPreset] || WALLPAPER_PRESETS.phone
  const width = settings.width || preset.width
  const height = settings.height || preset.height
  canvas.width = width
  canvas.height = height
  canvas.style.width = Math.min(width, 360) + 'px'
  canvas.style.height = 'auto'
  canvas.style.maxWidth = '100%'
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const template = settings.template || 'classic'
  if (template === 'compact') drawCompact(ctx, width, height, schedule, settings)
  else if (template === 'minimal') drawMinimal(ctx, width, height, schedule, settings)
  else drawClassic(ctx, width, height, schedule, settings)

  if (settings.showSafeZones) {
    drawSafeZones(ctx, width, height, settings.theme)
  }
}
