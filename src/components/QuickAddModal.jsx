import { useState } from 'react'
import { Modal } from './Modal.jsx'
import { WEEKDAYS, DEFAULT_SUBJECT_COLOR, validateSubject } from '../lib/model.js'
import { parseQuickAdd } from '../lib/quickAddParser.js'

export function QuickAddModal({ open, onClose, onSubmit, onSwitchToManual }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(false)
  const [name, setName] = useState('')
  const [days, setDays] = useState([])
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('09:00')
  const [room, setRoom] = useState('')
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])

  function reset() {
    setText('')
    setParsed(false)
    setName('')
    setDays([])
    setStart('08:00')
    setEnd('09:00')
    setRoom('')
    setErrors([])
    setWarnings([])
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleParse() {
    const r = parseQuickAdd(text)
    setErrors(r.errors)
    setWarnings(r.warnings)
    if (r.success && r.data) {
      setParsed(true)
      setName(r.data.name)
      const m = r.data.meetings[0]
      setDays(m.days)
      setStart(m.start)
      setEnd(m.end)
      setRoom(m.room)
    } else {
      setParsed(false)
    }
  }

  function toggleDay(day) {
    setDays((ds) =>
      ds.includes(day) ? ds.filter((d) => d !== day) : [...ds, day]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      color: DEFAULT_SUBJECT_COLOR,
      notes: '',
      meetings: [
        {
          days,
          start,
          end,
          room: room.trim(),
          instructor: '',
          notes: '',
        },
      ],
    }
    const v = validateSubject(payload)
    if (!v.valid) {
      setErrors(v.errors)
      return
    }
    setErrors([])
    const ok = onSubmit(payload)
    if (ok === false) return
    handleClose()
  }

  return (
    <Modal open={open} title="Quick add subject" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="quick-add-text">
            Schedule text
          </label>
          <textarea
            id="quick-add-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="e.g. Math 201 MWF 8-9:30 R204"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleParse}
              className="min-h-[44px] rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Parse
            </button>
            {onSwitchToManual ? (
              <button
                type="button"
                onClick={() => {
                  handleClose()
                  onSwitchToManual()
                }}
                className="min-h-[44px] rounded-md border border-slate-300 px-4 text-sm hover:bg-slate-50"
              >
                Use manual form
              </button>
            ) : null}
          </div>
        </div>

        {errors.length > 0 ? (
          <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            <ul className="list-disc pl-5">
              {errors.map((er, i) => (
                <li key={i}>{er}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {warnings.length > 0 ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <ul className="list-disc pl-5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {parsed ? (
          <div className="space-y-3 rounded-md border border-slate-200 p-3">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="qa-name">
                Subject name
              </label>
              <input
                id="qa-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700">Days</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {WEEKDAYS.map((d) => (
                  <label
                    key={d}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={days.includes(d)}
                      onChange={() => toggleDay(d)}
                      className="h-4 w-4"
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-600" htmlFor="qa-start">
                  Start
                </label>
                <input
                  id="qa-start"
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600" htmlFor="qa-end">
                  End
                </label>
                <input
                  id="qa-end"
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="qa-room">
                Room
              </label>
              <input
                id="qa-room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] rounded-md border border-slate-300 px-4 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add subject
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  )
}