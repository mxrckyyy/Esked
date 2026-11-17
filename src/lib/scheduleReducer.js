import { createDefaultSchedule, createSubject, createMeeting } from './model.js'
import { createId } from './ids.js'

export const SCHEDULE_ACTIONS = {
  UPDATE_TITLE: 'schedule/updateTitle',
  UPDATE_SEMESTER: 'schedule/updateSemester',
  ADD_SUBJECT: 'schedule/addSubject',
  UPDATE_SUBJECT: 'schedule/updateSubject',
  DELETE_SUBJECT: 'schedule/deleteSubject',
  ADD_MEETING: 'schedule/addMeeting',
  UPDATE_MEETING: 'schedule/updateMeeting',
  DELETE_MEETING: 'schedule/deleteMeeting',
  UPDATE_SETTINGS: 'schedule/updateSettings',
  REPLACE: 'schedule/replace',
  RESET: 'schedule/reset',
}

function cloneSchedule(schedule) {
  return {
    ...schedule,
    subjects: (schedule.subjects || []).map((s) => ({
      ...s,
      meetings: (s.meetings || []).map((m) => ({ ...m })),
    })),
    settings: { ...schedule.settings },
  }
}

export function scheduleReducer(state, action) {
  if (state === undefined) return createDefaultSchedule()

  if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
    return state
  }

  const { type, payload } = action

  switch (type) {
    case SCHEDULE_ACTIONS.UPDATE_TITLE:
      return { ...state, title: payload }

    case SCHEDULE_ACTIONS.UPDATE_SEMESTER:
      return { ...state, semester: payload }

    case SCHEDULE_ACTIONS.ADD_SUBJECT: {
      const subject = payload && payload.id ? { ...payload } : createSubject(payload || {})
      if (!subject.id) subject.id = createId()
      if (!Array.isArray(subject.meetings)) subject.meetings = []
      return { ...state, subjects: [...state.subjects, subject] }
    }

    case SCHEDULE_ACTIONS.UPDATE_SUBJECT: {
      const { id, changes } = normalizeSubjectUpdate(payload)
      if (!id) return state
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === id ? { ...s, ...changes, meetings: changes && changes.meetings ? changes.meetings.map((m) => ({ ...m })) : s.meetings } : s
        ),
      }
    }

    case SCHEDULE_ACTIONS.DELETE_SUBJECT:
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== payload),
      }

    case SCHEDULE_ACTIONS.ADD_MEETING: {
      const { subjectId, meeting } = payload || {}
      if (!subjectId) return state
      const m = meeting && meeting.id ? { ...meeting } : createMeeting(meeting || {})
      if (!m.id) m.id = createId()
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === subjectId ? { ...s, meetings: [...s.meetings, m] } : s
        ),
      }
    }

    case SCHEDULE_ACTIONS.UPDATE_MEETING: {
      const { subjectId, meetingId, changes } = normalizeMeetingUpdate(payload)
      if (!subjectId || !meetingId) return state
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            meetings: s.meetings.map((m) =>
              m.id === meetingId ? { ...m, ...changes } : m
            ),
          }
        }),
      }
    }

    case SCHEDULE_ACTIONS.DELETE_MEETING: {
      const { subjectId, meetingId } = payload || {}
      if (!subjectId || !meetingId) return state
      return {
        ...state,
        subjects: state.subjects.map((s) => {
          if (s.id !== subjectId) return s
          return { ...s, meetings: s.meetings.filter((m) => m.id !== meetingId) }
        }),
      }
    }

    case SCHEDULE_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...(payload || {}) },
      }

    case SCHEDULE_ACTIONS.REPLACE:
      if (!payload || typeof payload !== 'object') return state
      return cloneSchedule(payload)

    case SCHEDULE_ACTIONS.RESET:
      return createDefaultSchedule()

    default:
      return state
  }
}

function normalizeSubjectUpdate(payload) {
  if (!payload) return { id: null, changes: {} }
  if (payload.id && payload.changes) {
    return { id: payload.id, changes: payload.changes }
  }
  if (payload.id) {
    const { id, ...rest } = payload
    return { id, changes: rest }
  }
  return { id: null, changes: {} }
}

function normalizeMeetingUpdate(payload) {
  if (!payload) return { subjectId: null, meetingId: null, changes: {} }
  if (payload.subjectId && payload.meetingId) {
    let changes = payload.changes
    if (!changes) {
      const rest = { ...payload }
      delete rest.subjectId
      delete rest.meetingId
      delete rest.changes
      changes = rest
    }
    return { subjectId: payload.subjectId, meetingId: payload.meetingId, changes }
  }
  return { subjectId: null, meetingId: null, changes: {} }
}