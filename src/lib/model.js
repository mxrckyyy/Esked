import { createId } from './ids.js'

// --- Constants ---------------------------------------------------------------

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const DEFAULT_SETTINGS = Object.freeze({
  template: 'classic',
  theme: 'light',
  wallpaperPreset: 'phone',
  showRoom: true,
  showTime: true,
  showSafeZones: false,
})

export const DEFAULT_SUBJECT_COLOR = '#3b82f6'

// --- Primitive validators ----------------------------------------------------

export function isWeekday(value) {
  return WEEKDAYS.includes(value)
}

export function isValidTime(value) {
  return typeof value === 'string' && TIME_REGEX.test(value)
}

export function isValidColor(value) {
  return typeof value === 'string' && HEX_COLOR_REGEX.test(value)
}

// --- Factory functions -------------------------------------------------------

export function createMeeting(overrides = {}) {
  const base = {
    id: createId(),
    days: [],
    start: '08:00',
    end: '09:00',
    room: '',
    instructor: '',
    notes: '',
  }
  return { ...base, ...overrides, id: overrides.id || base.id }
}

export function createSubject(overrides = {}) {
  const base = {
    id: createId(),
    name: '',
    color: DEFAULT_SUBJECT_COLOR,
    notes: '',
    meetings: [],
  }
  const meetings = Array.isArray(overrides.meetings)
    ? overrides.meetings.map((m) => createMeeting(m))
    : base.meetings
  return {
    ...base,
    ...overrides,
    id: overrides.id || base.id,
    meetings,
  }
}

export function createDefaultSchedule(overrides = {}) {
  const base = {
    id: createId(),
    title: 'My Schedule',
    semester: '',
    subjects: [],
    settings: { ...DEFAULT_SETTINGS },
  }
  const settings = overrides.settings
    ? { ...DEFAULT_SETTINGS, ...overrides.settings }
    : base.settings
  const subjects = Array.isArray(overrides.subjects)
    ? overrides.subjects.map((s) => createSubject(s))
    : base.subjects
  return {
    ...base,
    ...overrides,
    id: overrides.id || base.id,
    subjects,
    settings,
  }
}

// --- Validation --------------------------------------------------------------

export function validateMeeting(meeting) {
  const errors = []
  if (!meeting || typeof meeting !== 'object' || Array.isArray(meeting)) {
    return { valid: false, errors: ['Meeting must be an object'] }
  }
  if (!Array.isArray(meeting.days)) {
    errors.push('days must be an array')
  } else {
    meeting.days.forEach((d) => {
      if (!isWeekday(d)) errors.push(`Invalid weekday: ${String(d)}`)
    })
  }
  if (!isValidTime(meeting.start)) errors.push('start must be a valid HH:mm time')
  if (!isValidTime(meeting.end)) errors.push('end must be a valid HH:mm time')
  if (isValidTime(meeting.start) && isValidTime(meeting.end) && meeting.end <= meeting.start) {
    errors.push('end must be after start')
  }
  if (meeting.room != null && typeof meeting.room !== 'string') errors.push('room must be a string')
  if (meeting.instructor != null && typeof meeting.instructor !== 'string') errors.push('instructor must be a string')
  if (meeting.notes != null && typeof meeting.notes !== 'string') errors.push('notes must be a string')
  if (meeting.id != null && typeof meeting.id !== 'string') errors.push('id must be a string')
  return { valid: errors.length === 0, errors }
}

export function validateSubject(subject) {
  const errors = []
  if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
    return { valid: false, errors: ['Subject must be an object'] }
  }
  if (typeof subject.name !== 'string' || subject.name.trim() === '') {
    errors.push('name is required')
  }
  if (!isValidColor(subject.color)) errors.push('color must be a valid hex color')
  if (subject.notes != null && typeof subject.notes !== 'string') errors.push('notes must be a string')
  if (!Array.isArray(subject.meetings)) {
    errors.push('meetings must be an array')
  } else {
    subject.meetings.forEach((m, i) => {
      const r = validateMeeting(m)
      r.errors.forEach((e) => errors.push(`meeting ${i}: ${e}`))
    })
  }
  if (subject.id != null && typeof subject.id !== 'string') errors.push('id must be a string')
  return { valid: errors.length === 0, errors }
}

export function validateSettings(settings) {
  const errors = []
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return { valid: false, errors: ['Settings must be an object'] }
  }
  if (typeof settings.template !== 'string' || settings.template.trim() === '') errors.push('template is required')
  if (typeof settings.theme !== 'string' || settings.theme.trim() === '') errors.push('theme is required')
  if (typeof settings.wallpaperPreset !== 'string' || settings.wallpaperPreset.trim() === '') errors.push('wallpaperPreset is required')
  if (typeof settings.showRoom !== 'boolean') errors.push('showRoom must be boolean')
  if (typeof settings.showTime !== 'boolean') errors.push('showTime must be boolean')
  if (typeof settings.showSafeZones !== 'boolean') errors.push('showSafeZones must be boolean')
  return { valid: errors.length === 0, errors }
}

export function validateSchedule(schedule) {
  const errors = []
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    return { valid: false, errors: ['Schedule must be an object'] }
  }
  if (typeof schedule.id !== 'string' || schedule.id.trim() === '') errors.push('id is required')
  if (typeof schedule.title !== 'string') errors.push('title must be a string')
  if (typeof schedule.semester !== 'string') errors.push('semester must be a string')
  if (!Array.isArray(schedule.subjects)) {
    errors.push('subjects must be an array')
  } else {
    schedule.subjects.forEach((s, i) => {
      const r = validateSubject(s)
      r.errors.forEach((e) => errors.push(`subject ${i}: ${e}`))
    })
  }
  const sr = validateSettings(schedule.settings)
  sr.errors.forEach((e) => errors.push(`settings: ${e}`))
  return { valid: errors.length === 0, errors }
}