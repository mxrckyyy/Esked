import { useState } from 'react'
import { WEEKDAYS, DEFAULT_SUBJECT_COLOR, validateSubject } from '../lib/model.js'
import { Modal } from './Modal.jsx'

const COLOR_PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1']

function emptyMeeting() {
  return { id: null, days: [], start: '08:00', end: '09:00', room: '', instructor: '', notes: '' }
}

export function SubjectForm({ open, subject, onClose, onSubmit }) {
  const [name, setName] = useState(subject?.name || '')
  const [color, setColor] = useState(subject?.color || DEFAULT_SUBJECT_COLOR)
  const [notes, setNotes] = useState(subject?.notes || '')
  const [meetings, setMeetings] = useState(
    subject?.meetings?.length ? subject.meetings.map((m) => ({ ...m })) : []
  )
  const [error, setError] = useState('')

  function addMeeting() {
    setMeetings((ms) => [...ms, emptyMeeting()])
  }
  function removeMeeting(i) {
    setMeetings((ms) => ms.filter((_, idx) => idx !== i))
  }
  function updateMeeting(i, changes) {
    setMeetings((ms) => ms.map((m, idx) => (idx === i ? { ...m, ...changes } : m)))
  }
  function toggleDay(i, day) {
    setMeetings((ms) =>
      ms.map((m, idx) => {
        if (idx !== i) return m
        const days = m.days.includes(day) ? m.days.filter((d) => d !== day) : [...m.days, day]
        return { ...m, days }
      })
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      id: subject?.id,
      name: name.trim(),
      color,
      notes: notes.trim(),
      meetings: meetings.map((m) => ({
        id: m.id || undefined,
        days: m.days,
        start: m.start,
        end: m.end,
        room: m.room || '',
        instructor: m.instructor || '',
        notes: m.notes || '',
      })),
    }
    const v = validateSubject(payload)
    if (!v.valid) {
      setError(v.errors.join('; '))
      return
    }
    setError('')
    const ok = onSubmit(payload)
    if (ok === false) return
    onClose()
  }

  return (
    <Modal open={open} title={subject ? 'Edit subject' : 'Add subject'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-2" htmlFor="subject-name">
            Name
          </label>
          <input
            id="subject-name"
            type="text"
            aria-required="true"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink"

          />
        </div>

        <div>
          <span className="block text-sm font-medium text-ink-2">Color</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                aria-pressed={color === c}
                className={`h-11 w-11 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-focus ${color === c ? 'border-accent' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}

          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-2" htmlFor="subject-notes">
            Notes
          </label>
          <textarea
            id="subject-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-2">Meetings</span>
            <button
              type="button"
              onClick={addMeeting}
              className="min-h-[44px] rounded-md border border-line-strong px-3 text-sm hover:bg-surface-raised"
            >
              Add meeting
            </button>
          </div>
          <div className="mt-2 space-y-3">
            {meetings.map((m, i) => (
              <div key={i} className="rounded-md border border-line p-3">
                <div className="flex flex-wrap gap-1">
                  {WEEKDAYS.map((d) => (
                    <label
                      key={d}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-md border border-line px-2 text-xs font-medium hover:bg-surface-raised"
                    >
                      <input
                        type="checkbox"
                        checked={m.days.includes(d)}
                        onChange={() => toggleDay(i, d)}
                        className="h-4 w-4"
                      />
                      {d}
                    </label>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-ink-3">Start</label>
                    <input
                      type="time"
                      value={m.start}
                      onChange={(e) => updateMeeting(i, { start: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-3">End</label>
                    <input
                      type="time"
                      value={m.end}
                      onChange={(e) => updateMeeting(i, { end: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
                    />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-ink-3">Room</label>
                    <input
                      type="text"
                      value={m.room}
                      onChange={(e) => updateMeeting(i, { room: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-3">Instructor</label>
                    <input
                      type="text"
                      value={m.instructor}
                      onChange={(e) => updateMeeting(i, { instructor: e.target.value })}
                      className="mt-1 w-full rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-xs text-ink-3">Notes</label>
                  <input
                    type="text"
                    value={m.notes}
                    onChange={(e) => updateMeeting(i, { notes: e.target.value })}
                    className="mt-1 w-full rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMeeting(i)}
                  className="mt-2 text-xs text-danger hover:underline"
                >
                  Remove meeting
                </button>
              </div>
            ))}
          </div>
        </div>

        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-md border border-line-strong px-4 text-sm hover:bg-surface-raised"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-[44px] rounded-md bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent/90"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
