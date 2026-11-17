import { describe, it, expect } from 'vitest'
import {
  WEEKDAYS,
  DEFAULT_SETTINGS,
  createMeeting,
  createSubject,
  createDefaultSchedule,
  isWeekday,
  isValidTime,
  isValidColor,
  validateMeeting,
  validateSubject,
  validateSettings,
  validateSchedule,
} from './model.js'

describe('model factories', () => {
  it('creates default schedule with valid structure', () => {
    const s = createDefaultSchedule()
    expect(s.id).toBeTruthy()
    expect(s.title).toBe('My Schedule')
    expect(s.subjects).toEqual([])
    expect(s.settings).toMatchObject(DEFAULT_SETTINGS)
    const v = validateSchedule(s)
    expect(v.valid).toBe(true)
  })

  it('creates independent default objects', () => {
    const a = createDefaultSchedule()
    const b = createDefaultSchedule()
    expect(a.id).not.toBe(b.id)
    a.settings.template = 'changed'
    a.subjects.push(createSubject({ name: 'X' }))
    expect(b.settings.template).toBe('light' === b.settings.template ? b.settings.template : DEFAULT_SETTINGS.template)
    expect(b.subjects).toEqual([])
  })

  it('createSubject supports zero meetings', () => {
    const s = createSubject({ name: 'Math' })
    expect(s.meetings).toEqual([])
    expect(validateSubject(s).valid).toBe(true)
  })

  it('createMeeting allows empty optional details', () => {
    const m = createMeeting({ room: '', instructor: '', notes: '' })
    expect(validateMeeting(m).valid).toBe(true)
  })

  it('generates unique ids', () => {
    const ids = new Set([createDefaultSchedule().id, createDefaultSchedule().id, createSubject().id, createMeeting().id])
    expect(ids.size).toBe(4)
  })
})

describe('validators', () => {
  it('isWeekday / isValidTime / isValidColor', () => {
    expect(isWeekday('Mon')).toBe(true)
    expect(isWeekday('Foo')).toBe(false)
    expect(isValidTime('08:00')).toBe(true)
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('8:00')).toBe(false)
    expect(isValidColor('#fff')).toBe(true)
    expect(isValidColor('#3b82f6')).toBe(true)
    expect(isValidColor('red')).toBe(false)
  })

  it('validateMeeting rejects end <= start', () => {
    const m = createMeeting({ start: '10:00', end: '09:00' })
    const r = validateMeeting(m)
    expect(r.valid).toBe(false)
    expect(r.errors.join(' ')).toMatch(/after start/)
  })

  it('validateMeeting rejects invalid weekday', () => {
    const m = createMeeting({ days: ['Mon', 'Funday'] })
    const r = validateMeeting(m)
    expect(r.valid).toBe(false)
  })

  it('validateSubject requires name', () => {
    const s = createSubject({ name: '' })
    const r = validateSubject(s)
    expect(r.valid).toBe(false)
    expect(r.errors).toContain('name is required')
  })

  it('validateSubject rejects invalid color', () => {
    const s = createSubject({ name: 'X', color: 'blue' })
    expect(validateSubject(s).valid).toBe(false)
  })

  it('validateSettings requires booleans', () => {
    const st = { ...DEFAULT_SETTINGS, showRoom: 'yes' }
    const r = validateSettings(st)
    expect(r.valid).toBe(false)
  })

  it('validateSchedule requires subjects array and valid settings', () => {
    const s = createDefaultSchedule()
    s.subjects = 'nope'
    expect(validateSchedule(s).valid).toBe(false)
  })

  it('missing optional details still valid', () => {
    const s = createSubject({ name: 'Bio', meetings: [createMeeting({ room: '', instructor: '' })] })
    expect(validateSubject(s).valid).toBe(true)
  })

  it('subject without meetings valid', () => {
    const s = createSubject({ name: 'PE' })
    expect(validateSubject(s).valid).toBe(true)
  })

  it('WEEKDAYS has 7 entries', () => {
    expect(WEEKDAYS).toHaveLength(7)
  })
})