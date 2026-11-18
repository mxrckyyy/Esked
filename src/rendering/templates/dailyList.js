import { WEEKDAYS, DEFAULT_SUBJECT_COLOR } from '../wallpaperConstants.js'
import { scale, roundRect, truncateTextWarn, groupMeetingsByDay, meetingMinutes } from '../wallpaperUtils.js'

// Note: imports adjusted below
export function renderDailyList(ctx, width, height, schedule, settings, colors, sz, warnings) {
  const pad = Math.round(width * 0.06)
  const s = (v) => scale(v, width, height)
  let y = sz.top + s(16)

  // Title
  ctx.fillStyle = colors.text
  ctx.font = `bold ${s(48)}px system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  const title = schedule?.title || 'My Schedule'
  ctx.fillStyle = colors.text
  ctx.font = `bold ${s(48)}px system-ui, -apple-system, sans-serif`
  ctx.fillText(truncateTextWarn(ctx, title, width - pad * 2, warnings, 'Schedule title'), pad, y)
  y += s(56)
  if (schedule?.semester) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(24)}px system-ui, -apple-system, sans-serif`
    ctx.fillText(truncateTextWarn(ctx, schedule.semester, width - pad * 2, warnings, 'Semester'), pad, y)
    y += s(36)
  }
  y += s(8)

  const grouped = groupMeetingsByDay(schedule)
  const usableBottom = height - sz.bottom - s(16)
  const rowH = s(52)
  const dayHeaderH = s(40)

  for (const day of WEEKDAYS) {
    if (y + dayHeaderH > usableBottom) {
      warnings.push('Content exceeded available space; some days may be clipped.')
      break
    }
    // day header
    ctx.fillStyle = colors.accent
    ctx.font = `bold ${s(28)}px system-ui, -apple-system, sans-serif`
    ctx.fillText(day, pad, y)
    y += dayHeaderH

    const meetings = (grouped[day] || []).slice().sort((a, b) => meetingMinutes(a.meeting).start - meetingMinutes(b.meeting).start)
    if (meetings.length === 0) {
      ctx.fillStyle = colors.muted
      ctx.font = `${s(22)}px system-ui, -apple-system, sans-serif`
      ctx.fillText('No classes', pad + s(8), y)
      y += s(32)
      continue
    }
    for (const { subject, meeting } of meetings) {
      if (y + rowH > usableBottom) {
        warnings.push(`Meeting "${subject?.name || 'Subject'}" on ${day} could not be rendered (space).`)
        continue
      }
      const color = subject?.color || DEFAULT_SUBJECT_COLOR
      // color bar
      ctx.fillStyle = color
      roundRect(ctx, pad, y + s(6), s(6), rowH - s(12), s(3))
      ctx.fill()
      // subject name
      ctx.fillStyle = colors.text
      ctx.font = `bold ${s(24)}px system-ui, -apple-system, sans-serif`
      const nameMax = width - pad * 2 - s(16)
      const name = truncateTextWarn(ctx, subject?.name || 'Subject', nameMax, warnings, `Subject "${subject?.name || 'Subject'}"`)
      ctx.fillText(name, pad + s(16), y + s(4))
      // time + room line
      let detail = ''
      if (settings.showTime !== false) detail += `${meeting.start} - ${meeting.end}`
      if (settings.showRoom && meeting.room) detail += (detail ? '  \u00b7  ' : '') + meeting.room
      if (detail) {
        ctx.fillStyle = colors.muted
        ctx.font = `${s(18)}px system-ui, -apple-system, sans-serif`
        ctx.fillText(truncateTextWarn(ctx, detail, nameMax, warnings, `Meeting details for "${subject?.name || 'Subject'}"`), pad + s(16), y + s(30))
      }
      y += rowH
    }
    y += s(8)
  }
}

