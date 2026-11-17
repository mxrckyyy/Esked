import { describe, it, expect } from 'vitest'
import { scheduleReducer, SCHEDULE_ACTIONS } from './scheduleReducer.js'
import { createDefaultSchedule, createSubject, createMeeting } from './model.js'

describe('scheduleReducer', () => {
  it('returns default state when undefined', () => {
    const s = scheduleReducer(undefined, { type: 'unknown' })
    expect(s).toBeTruthy()
    expect(Array.isArray(s.subjects)).toBe(true)
  })

  it('handles invalid action predictably', () => {
    const s = createDefaultSchedule()
    expect(scheduleReducer(s, null)).toBe(s)
    expect(scheduleReducer(s, {})).toBe(s)
    expect(scheduleReducer(s, { type: 123 })).toBe(s)
  })

  it('updates title and semester', () => {
    const s = createDefaultSchedule()
    const a = scheduleReducer(s, { type: SCHEDULE_ACTIONS.UPDATE_TITLE, payload: 'Fall' })
    expect(a.title).toBe('Fall')
    const b = scheduleReducer(a, { type: SCHEDULE_ACTIONS.UPDATE_SEMESTER, payload: '2026' })
    expect(b.semester).toBe('2026')
    expect(b.title).toBe('Fall')
  })

  it('adds subject immutably', () => {
    const s = createDefaultSchedule()
    const subj = createSubject({ name: 'Math' })
    const next = scheduleReducer(s, { type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: subj })
    expect(next.subjects).toHaveLength(1)
    expect(next.subjects[0].name).toBe('Math')
    expect(s.subjects).toHaveLength(0)
  })

  it('updates subject', () => {
    const s = createDefaultSchedule()
    const subj = createSubject({ name: 'Math' })
    const withSubj = scheduleReducer(s, { type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: subj })
    const updated = scheduleReducer(withSubj, {
      type: SCHEDULE_ACTIONS.UPDATE_SUBJECT,
      payload: { id: subj.id, changes: { name: 'Mathematics' } },
    })
    expect(updated.subjects[0].name).toBe('Mathematics')
    // alternative form
    const alt = scheduleReducer(withSubj, {
      type: SCHEDULE_ACTIONS.UPDATE_SUBJECT,
      payload: { id: subj.id, name: 'Maths' },
    })
    expect(alt.subjects[0].name).toBe('Maths')
  })

  it('deletes subject', () => {
    const s = createDefaultSchedule()
    const subj = createSubject({ name: 'Math' })
    const withSubj = scheduleReducer(s, { type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: subj })
    const next = scheduleReducer(withSubj, { type: SCHEDULE_ACTIONS.DELETE_SUBJECT, payload: subj.id })
    expect(next.subjects).toHaveLength(0)
  })

  it('preserves unrelated properties on subject update', () => {
    const s = createDefaultSchedule()
    const subj = createSubject({ name: 'Math', color: '#ff0000' })
    const withSubj = scheduleReducer(s, { type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: subj })
    const updated = scheduleReducer(withSubj, {
      type: SCHEDULE_ACTIONS.UPDATE_SUBJECT,
      payload: { id: subj.id, changes: { name: 'Mathematics' } },
    })
    expect(updated.subjects[0].color).toBe('#ff0000')
  })

  it('adds/updates/deletes meeting', () => {
    const s = createDefaultSchedule()
    const subj = createSubject({ name: 'Math' })
    const withSubj = scheduleReducer(s, { type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: subj })
    const meeting = createMeeting({ days: ['Mon'], start: '08:00', end: '09:00' })
    const withMeeting = scheduleReducer(withSubj, {
      type: SCHEDULE_ACTIONS.ADD_MEETING,
      payload: { subjectId: subj.id, meeting },
    })
    expect(withMeeting.subjects[0].meetings).toHaveLength(1)

    const updatedMeeting = scheduleReducer(withMeeting, {
      type: SCHEDULE_ACTIONS.UPDATE_MEETING,
      payload: { subjectId: subj.id, meetingId: meeting.id, changes: { room: 'A1' } },
    })
    expect(updatedMeeting.subjects[0].meetings[0].room).toBe('A1')

    const deleted = scheduleReducer(updatedMeeting, {
      type: SCHEDULE_ACTIONS.DELETE_MEETING,
      payload: { subjectId: subj.id, meetingId: meeting.id },
    })
    expect(deleted.subjects[0].meetings).toHaveLength(0)
  })

  it('updates settings', () => {
    const s = createDefaultSchedule()
    const next = scheduleReducer(s, {
      type: SCHEDULE_ACTIONS.UPDATE_SETTINGS,
      payload: { theme: 'dark' },
    })
    expect(next.settings.theme).toBe('dark')
    expect(next.settings.template).toBe(s.settings.template)
  })

  it('replaces schedule when loading persisted data', () => {
    const s = createDefaultSchedule()
    const other = createDefaultSchedule({ title: 'Loaded' })
    const next = scheduleReducer(s, { type: SCHEDULE_ACTIONS.REPLACE, payload: other })
    expect(next.title).toBe('Loaded')
    expect(next).not.toBe(other)
  })

  it('resets to default', () => {
    const s = createDefaultSchedule({ title: 'X' })
    const next = scheduleReducer(s, { type: SCHEDULE_ACTIONS.RESET })
    expect(next.title).toBe('My Schedule')
  })
})