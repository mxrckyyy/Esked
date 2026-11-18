// Pure JavaScript Quick Add parser for Esked.
// No React, no storage, no IDs. Returns a predictable result object.

import { WEEKDAYS } from './model.js'

const DAY_MAP = {
  monday: 'Mon',
  mon: 'Mon',
  m: 'Mon',
  tuesday: 'Tue',
  tues: 'Tue',
  tue: 'Tue',
  t: 'Tue',
  wednesday: 'Wed',
  wed: 'Wed',
  w: 'Wed',
  thursday: 'Thu',
  thurs: 'Thu',
  thur: 'Thu',
  thu: 'Thu',
  th: 'Thu',
  friday: 'Fri',
  fri: 'Fri',
  f: 'Fri',
  saturday: 'Sat',
  sat: 'Sat',
  sunday: 'Sun',
  sun: 'Sun',
}

// Sort day-name keys by length descending for greedy matching.
const DAY_KEYS_SORTED = Object.keys(DAY_MAP).sort((a, b) => b.length - a.length)

export function parseDayToken(token) {
  if (typeof token !== 'string' || token.trim() === '') return null
  const t = token.trim()
  if (/\d/.test(t)) return null
  const lower = t.toLowerCase()
  const days = []
  let i = 0
  while (i < lower.length) {
    let matched = false
    for (const key of DAY_KEYS_SORTED) {
      if (lower.startsWith(key, i)) {
        days.push(DAY_MAP[key])
        i += key.length
        matched = true
        break
      }
    }
    if (!matched) return null
  }
  if (days.length === 0) return null
  // dedupe preserving first occurrence
  const seen = new Set()
  const unique = []
  for (const d of days) {
    if (!seen.has(d)) {
      seen.add(d)
      unique.push(d)
    }
  }
  return unique
}

function sortDays(days) {
  return [...days].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b))
}

function parseTimeToken(str) {
  const m = String(str).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!m) return null
  const hour = parseInt(m[1], 10)
  const minute = m[2] ? parseInt(m[2], 10) : 0
  const meridiem = m[3] ? m[3].toLowerCase() : null
  if (minute > 59) return null
  if (meridiem) {
    if (hour < 1 || hour > 12) return null
    let h = hour
    if (meridiem === 'pm' && h !== 12) h += 12
    if (meridiem === 'am' && h === 12) h = 0
    return { minutes: h * 60 + minute, meridiem }
  }
  if (hour > 23) return null
  return { minutes: hour * 60 + minute, meridiem: null }
}

function toHHmm(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseTimeRange(startStr, endStr) {
  const s = parseTimeToken(startStr)
  const e = parseTimeToken(endStr)
  if (!s || !e) {
    return { error: 'Invalid time value. Use HH:mm (24-hour) or 12-hour with am/pm.' }
  }

  let startMin = s.minutes
  let endMin = e.minutes
  const warnings = []

  const sMer = s.meridiem
  const eMer = e.meridiem

  if (sMer && !eMer) {
    // Recompute end raw minutes (hour as given)
    const endRaw = parseTimeToken(endStr.replace(/\s*(am|pm)\s*/i, ''))
    const endBase = endRaw ? endRaw.minutes : e.minutes
    // try same meridiem
    let candEnd = applyMeridiem(endBase, sMer)
    if (candEnd > startMin) {
      endMin = candEnd
      warnings.push('End time meridiem was inferred from the start time.')
    } else {
      const opposite = sMer === 'am' ? 'pm' : 'am'
      candEnd = applyMeridiem(endBase, opposite)
      if (candEnd > startMin) {
        endMin = candEnd
        warnings.push('End time meridiem was inferred; please verify.')
      } else {
        return { error: 'Ambiguous AM/PM: could not determine a valid time range.' }
      }
    }
  } else if (!sMer && eMer) {
    const startRaw = parseTimeToken(startStr.replace(/\s*(am|pm)\s*/i, ''))
    const startBase = startRaw ? startRaw.minutes : s.minutes
    let candStart = applyMeridiem(startBase, eMer)
    if (candStart < endMin) {
      startMin = candStart
      warnings.push('Start time meridiem was inferred from the end time.')
    } else {
      const opposite = eMer === 'am' ? 'pm' : 'am'
      candStart = applyMeridiem(startBase, opposite)
      if (candStart < endMin) {
        startMin = candStart
        warnings.push('Start time meridiem was inferred; please verify.')
      } else {
        return { error: 'Ambiguous AM/PM: could not determine a valid time range.' }
      }
    }
  }

  if (endMin <= startMin) {
    return { error: 'End time must be later than start time.' }
  }

  return { start: toHHmm(startMin), end: toHHmm(endMin), warnings }
}

function applyMeridiem(baseMinutes, mer) {
  const h = Math.floor(baseMinutes / 60)
  const m = baseMinutes % 60
  let hour = h
  if (mer === 'pm' && hour !== 12) hour += 12
  if (mer === 'am' && hour === 12) hour = 0
  // handle 24-hour base >12 with meridiem: if hour >12 and mer provided, keep? We'll mod
  return hour * 60 + m
}

const TIME_RANGE_REGEX = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:[-\u2013\u2014]|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i

// Room value must contain at least one digit to avoid consuming subject words.
const ROOM_REGEX = /\b(room|laboratory|lab)\s+([A-Za-z0-9-]*\d[A-Za-z0-9-]*)/i
const ROOM_R_REGEX = /\bR(\d+[A-Za-z]?)\b/i

export function parseQuickAdd(input) {
  const errors = []
  const warnings = []

  if (typeof input !== 'string' || input.trim() === '') {
    return { success: false, data: null, errors: ['Input is required.'], warnings: [] }
  }

  let text = input.trim().replace(/\s+/g, ' ')

  // Room extraction
  let room = ''
  let roomMatch = text.match(ROOM_REGEX)
  if (roomMatch) {
    const kind = roomMatch[1].toLowerCase()
    const label = kind === 'room' ? 'Room' : 'Lab'
    room = `${label} ${roomMatch[2]}`
    text = text.replace(roomMatch[0], ' ').replace(/\s+/g, ' ').trim()
  } else {
    const rMatch = text.match(ROOM_R_REGEX)
    if (rMatch) {
      room = `Room ${rMatch[1]}`
      text = text.replace(rMatch[0], ' ').replace(/\s+/g, ' ').trim()
    }
  }

  // Time extraction
  let start = ''
  let end = ''
  const timeMatch = text.match(TIME_RANGE_REGEX)
  if (timeMatch) {
    const tr = parseTimeRange(timeMatch[1], timeMatch[2])
    if (tr.error) {
      errors.push(tr.error)
    } else {
      start = tr.start
      end = tr.end
      if (tr.warnings) warnings.push(...tr.warnings)
    }
    text = text.replace(timeMatch[0], ' ').replace(/\s+/g, ' ').trim()
  } else {
    errors.push('A valid time range is required.')
  }

  // Day extraction with subject/day boundary detection.
  // Days are taken as the trailing run of day tokens. Tokens before that run
  // form the subject name, so weekday-like words inside a subject name (e.g.
  // "Wednesday Club") are preserved instead of being consumed as days.
  const tokens = text.split(' ').filter((t) => t !== '')
  const dayTokens = []
  const subjectTokens = []
  const trailingTokens = []

  let i = tokens.length
  // Strip trailing non-day tokens first (reported as unrecognized).
  while (i > 0 && !parseDayToken(tokens[i - 1])) {
    trailingTokens.unshift(tokens[i - 1])
    i--
  }
  // Collect the trailing run of day tokens.
  const dayRun = []
  while (i > 0 && parseDayToken(tokens[i - 1])) {
    dayRun.unshift(tokens[i - 1])
    i--
  }
  for (const t of dayRun) {
    dayTokens.push(...parseDayToken(t))
  }
  subjectTokens.push(...tokens.slice(0, i))

  if (trailingTokens.length > 0) {
    warnings.push(`Unrecognized text: ${trailingTokens.join(' ')}`)
  }

  if (subjectTokens.length === 0 && dayTokens.length > 0) {
    warnings.push('Could not distinguish the subject name from day tokens; please review.')
  }

  // dedupe days and sort
  const seenDays = new Set()
  const uniqueDays = []
  for (const d of dayTokens) {
    if (!seenDays.has(d)) {
      seenDays.add(d)
      uniqueDays.push(d)
    }
  }
  const days = sortDays(uniqueDays)

  if (days.length === 0) {
    errors.push('At least one valid day is required.')
  }

  const name = subjectTokens.join(' ').trim()
  if (name === '') {
    errors.push('Subject name could not be determined.')
  }

  if (errors.length > 0) {
    return { success: false, data: null, errors, warnings }
  }

  return {
    success: true,
    data: {
      name,
      meetings: [
        {
          days,
          start,
          end,
          room,
        },
      ],
    },
    errors: [],
    warnings,
  }
}