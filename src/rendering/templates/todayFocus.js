import { WEEKDAYS, DEFAULT_SUBJECT_COLOR } from '../wallpaperConstants.js'
import { scale, roundRect, truncateTextWarn, groupMeetingsByDay, meetingMinutes } from '../wallpaperUtils.js'

export function renderTodayFocus(ctx, width, height, schedule, settings, colors, sz, warnings) {
  const pad = Math.round(width * 0.06)
  const s = (v) => scale(v, width, height)
  let y = sz.top + s(16)

  const grouped = groupMeetingsByDay(schedule)
  const selectedDay = resolveSelectedDay(settings, grouped)
  const meetings = (grouped[selectedDay] || []).slice().sort((a, b) => meetingMinutes(a.meeting).start - meetingMinutes(b.meeting).start)

  // Day heading
  ctx.fillStyle = colors.accent
  ctx.font = `bold ${s(72)}px system-ui, -apple-system, sans-serif`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(selectedDay, pad, y)
  y += s(84)

  ctx.fillStyle = colors.text
  ctx.font = `bold ${s(32)}px system-ui, -apple-system, sans-serif`
  ctx.fillText(truncateTextWarn(ctx, schedule?.title || 'My Schedule', width - pad * 2, warnings, 'Schedule title'), pad, y)
  y += s(44)
  if (schedule?.semester) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(22)}px system-ui, -apple-system, sans-serif`
    ctx.fillText(truncateTextWarn(ctx, schedule.semester, width - pad * 2, warnings, 'Semester'), pad, y)
    y += s(32)
  }
  y += s(8)

  const usableBottom = height - sz.bottom - s(16)
  const rowH = s(72)

  if (meetings.length === 0) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(32)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('No classes today', width / 2, height / 2)
    ctx.textAlign = 'left'
    return
  }

  // Next class logic (only if currentTimeMinutes provided)
  const now = (typeof settings.currentTimeMinutes === 'number') ? settings.currentTimeMinutes : null
  let nextIndex = -1
  if (now !== null) {
    nextIndex = meetings.findIndex(({ meeting }) => meetingMinutes(meeting).start > now)
  }

  for (let i = 0; i < meetings.length; i++) {
    const { subject, meeting } = meetings[i]
    if (y + rowH > usableBottom) {
      warnings.push(`Meeting "${subject?.name || 'Subject'}" could not be rendered (space).`)
      continue
    }
    const color = subject?.color || DEFAULT_SUBJECT_COLOR
    // card surface
    ctx.fillStyle = colors.surface
    roundRect(ctx, pad, y, width - pad * 2, rowH - s(8), s(12))
    ctx.fill()
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 1
    ctx.stroke()
    // color accent bar
    ctx.fillStyle = color
    roundRect(ctx, pad, y, s(8), rowH - s(8), s(4))
    ctx.fill()

    ctx.fillStyle = colors.text
    ctx.font = `bold ${s(26)}px system-ui, -apple-system, sans-serif`
    ctx.textBaseline = 'top'
    const isNext = i === nextIndex
    const name = truncateTextWarn(ctx, subject?.name || 'Subject', width - pad * 2 - s(24), warnings, `Subject "${subject?.name || 'Subject'}"`)
    ctx.fillText((isNext ? '\u25b6 ' : '') + name, pad + s(20), y + s(10))

    let detail = ''
    if (settings.showTime !== false) detail += `${meeting.start} - ${meeting.end}`
    if (settings.showRoom && meeting.room) detail += (detail ? '  \u00b7  ' : '') + meeting.room
    if (detail) {
      ctx.fillStyle = colors.muted
      ctx.font = `${s(20)}px system-ui, -apple-system, sans-serif`
      ctx.fillText(truncateTextWarn(ctx, detail, width - pad * 2 - s(24), warnings, `Meeting details for "${subject?.name || 'Subject'}"`), pad + s(20), y + s(42))
    }
    y += rowH
  }

  if (nextIndex === -1 && now !== null && meetings.length > 0 && meetingMinutes(meetings[meetings.length - 1].meeting).end <= now) {
    ctx.fillStyle = colors.muted
    ctx.font = `${s(22)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('No more classes today', width / 2, usableBottom - s(20))
    ctx.textAlign = 'left'
  }
}

function resolveSelectedDay(settings, grouped) {
  if (settings && typeof settings.selectedDay === 'string' && settings.selectedDay) {
    return settings.selectedDay
  }
  // deterministic fallback: first day with meetings, else Mon
  for (const d of WEEKDAYS) {
    if ((grouped[d] || []).length > 0) return d
  }
  return 'Mon'
}