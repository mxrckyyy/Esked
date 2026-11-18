import { WEEKDAYS, DEFAULT_SUBJECT_COLOR } from '../wallpaperConstants.js'
import { scale, roundRect, truncateTextWarn, groupMeetingsByDay, meetingMinutes } from '../wallpaperUtils.js'
import { renderDailyList } from './dailyList.js'

export function renderWeeklyColumns(ctx, width, height, schedule, settings, colors, sz, warnings) {
  const pad = Math.round(width * 0.04)
  const s = (v) => scale(v, width, height)
  const minColWidth = s(70)
  const timeAxisWidth = s(70)
  const gridLeft = pad + timeAxisWidth
  const gridWidth = width - gridLeft - pad
  const colWidth = gridWidth / 7

  if (colWidth < minColWidth) {
    warnings.push('Weekly columns too narrow for seven days; falling back to daily list layout.')
    renderDailyList(ctx, width, height, schedule, settings, colors, sz, warnings)
    return
  }

  let y = sz.top + s(12)
  // Title
  ctx.fillStyle = colors.text
  ctx.font = `bold ${s(36)}px system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(truncateTextWarn(ctx, schedule?.title || 'My Schedule', width - pad * 2, warnings, 'Schedule title'), pad, y)
  y += s(44)
  if (schedule?.semester) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(20)}px system-ui, -apple-system, sans-serif`
    ctx.fillText(truncateTextWarn(ctx, schedule.semester, width - pad * 2, warnings, 'Semester'), pad, y)
    y += s(28)
  }
  const headerBottom = y + s(8)
  const gridTop = headerBottom + s(32)
  const gridBottom = height - sz.bottom - s(12)
  const gridH = gridBottom - gridTop

  // time range
  const meetings = []
  for (const subj of schedule?.subjects || []) {
    for (const m of subj.meetings || []) {
      meetings.push({ subject: subj, meeting: m })
    }
  }
  let minMin = 8 * 60
  let maxMin = 18 * 60
  if (meetings.length) {
    minMin = Math.min(...meetings.map((x) => meetingMinutes(x.meeting).start))
    maxMin = Math.max(...meetings.map((x) => meetingMinutes(x.meeting).end))
    if (maxMin - minMin < 60) { minMin -= 30; maxMin += 30 }
    // pad
    minMin = Math.max(0, minMin - 30)
    maxMin = Math.min(24 * 60, maxMin + 30)
  }
  const total = maxMin - minMin || 1

  // Day headers
  ctx.fillStyle = colors.text
  ctx.font = `bold ${s(22)}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  WEEKDAYS.forEach((d, i) => {
    const x = gridLeft + i * colWidth + colWidth / 2
    ctx.fillText(d, x, headerBottom + s(16))
  })
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // Grid lines (vertical)
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 1
  for (let i = 0; i <= 7; i++) {
    const x = gridLeft + i * colWidth
    ctx.beginPath()
    ctx.moveTo(x, gridTop)
    ctx.lineTo(x, gridBottom)
    ctx.stroke()
  }
  // Time axis labels + horizontal grid
  ctx.fillStyle = colors.muted
  ctx.font = `${s(16)}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  const step = total > 8 * 60 ? 120 : 60
  for (let t = minMin; t <= maxMin; t += step) {
    const yLine = gridTop + ((t - minMin) / total) * gridH
    ctx.fillText(formatTime(t), gridLeft - s(8), yLine)
    ctx.strokeStyle = colors.border
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.moveTo(gridLeft, yLine)
    ctx.lineTo(gridLeft + gridWidth, yLine)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // Group meetings by day and assign tracks
  const grouped = groupMeetingsByDay(schedule)
  for (let di = 0; di < 7; di++) {
    const day = WEEKDAYS[di]
    const dayMeetings = (grouped[day] || []).slice().sort((a, b) => meetingMinutes(a.meeting).start - meetingMinutes(b.meeting).start)
    if (!dayMeetings.length) continue
    // assign tracks
    const tracks = [] // array of end times per track
    const assigned = dayMeetings.map((item) => {
      const { start, end } = meetingMinutes(item.meeting)
      let track = 0
      while (tracks[track] !== undefined && tracks[track] > start) track++
      tracks[track] = end
      return { item, track, start, end }
    })
    const maxTrack = Math.max(0, ...assigned.map((a) => a.track))
    const trackCount = maxTrack + 1
    const blockW = (colWidth - s(4)) / trackCount
    for (const { item, track, start, end } of assigned) {
      const { subject, meeting } = item
      const x = gridLeft + di * colWidth + s(2) + track * blockW
      const w = blockW - s(2)
      const y1 = gridTop + ((start - minMin) / total) * gridH
      const y2 = gridTop + ((end - minMin) / total) * gridH
      const h = Math.max(s(12), y2 - y1)
      const color = subject?.color || DEFAULT_SUBJECT_COLOR
      ctx.fillStyle = color
      roundRect(ctx, x, y1, w, h, s(6))
      ctx.fill()

      // text
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${s(14)}px system-ui, -apple-system, sans-serif`
      ctx.textBaseline = 'top'
      const name = truncateTextWarn(ctx, subject?.name || 'Subject', w - s(6), warnings, `Subject "${subject?.name || 'Subject'}"`)
      ctx.fillText(name, x + s(4), y1 + s(4))
      if (h > s(30) && settings.showTime !== false) {
        ctx.font = `${s(12)}px system-ui, -apple-system, sans-serif`
        ctx.fillText(`${meeting.start}-${meeting.end}`, x + s(4), y1 + s(20))
      }
    }
  }

  // empty state
  if (meetings.length === 0) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(28)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('No classes scheduled', width / 2, height / 2)
    ctx.textAlign = 'left'
  }
}

function formatTime(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}