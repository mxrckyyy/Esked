import { SubjectCard } from './SubjectCard.jsx'
import { EmptyState } from './Modal.jsx'
import { Button } from './ui/Button.jsx'

function computeStats(subjects) {
  let meetingCount = 0
  let totalMinutes = 0
  for (const s of subjects || []) {
    for (const m of s.meetings || []) {
      meetingCount += 1
      const days = Array.isArray(m.days) && m.days.length > 0 ? m.days.length : 1
      const startParts = String(m.start || '').split(':')
      const endParts = String(m.end || '').split(':')
      const sh = Number(startParts[0])
      const sm = Number(startParts[1])
      const eh = Number(endParts[0])
      const em = Number(endParts[1])
      if (Number.isFinite(sh) && Number.isFinite(eh)) {
        const dur = eh * 60 + (Number.isFinite(em) ? em : 0) - (sh * 60 + (Number.isFinite(sm) ? sm : 0))
        if (dur > 0) totalMinutes += dur * days
      }
    }
  }
  return { meetingCount, totalMinutes }
}

function formatDuration(minutes) {
  if (minutes <= 0) return '0m'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

const CalendarIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export function ScheduleView({
  schedule,
  storageMode,
  onAddSubject,
  onQuickAdd,
  onEditSubject,
  onDeleteSubject,
  onUpdateTitle,
  onUpdateSemester,
  onLoadSample,
}) {
  const stats = computeStats(schedule?.subjects || [])
  const hasSubjects = (schedule?.subjects || []).length > 0

  return (
    <section className="space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
            {CalendarIcon}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-ink">My Schedule</h2>
            <p className="text-sm text-ink-3">Manage subjects and meetings</p>
          </div>
        </div>
        {schedule?.semester ? (
          <span className="shrink-0 rounded-full bg-chip px-3 py-1 text-xs font-medium text-ink-2">
            {schedule.semester}
          </span>
        ) : null}
      </div>

      {/* Schedule identity (quiet) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-xs font-medium text-ink-3" htmlFor="schedule-title">
            Schedule title
          </label>
          <input
            id="schedule-title"
            type="text"
            value={schedule?.title || ''}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="mt-1 w-full max-w-md rounded-md border border-line-strong bg-surface px-3 py-2 text-lg font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-focus"
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium text-ink-3" htmlFor="schedule-semester">
            Semester
          </label>
          <input
            id="schedule-semester"
            type="text"
            value={schedule?.semester || ''}
            onChange={(e) => onUpdateSemester(e.target.value)}
            className="mt-1 w-full max-w-md rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            placeholder="e.g. Fall 2026"
          />
        </div>
      </div>

      {/* Main actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="order-2 flex gap-2 sm:order-1">
          {onQuickAdd ? (
            <Button
              variant="outline"
              size="md"
              onClick={onQuickAdd}
            >
              Quick add
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="md"
            onClick={onLoadSample}
          >
            Load sample
          </Button>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onAddSubject}
          className="order-1 w-full sm:order-2 sm:ml-auto sm:w-auto"
        >
          Add subject
        </Button>
      </div>

      {/* Subject statistics */}
      {hasSubjects ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-3">
          <span>{schedule.subjects.length} subject{schedule.subjects.length === 1 ? '' : 's'}</span>
          <span>{stats.meetingCount} meeting{stats.meetingCount === 1 ? '' : 's'}</span>
          <span>{formatDuration(stats.totalMinutes)} / week</span>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">Subjects</h3>
        </div>

        {/* Desktop column headers (≥1024px) */}
        {hasSubjects ? (
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto] lg:items-center px-4 py-1 text-xs font-semibold uppercase tracking-wider text-ink-3 border-b border-line">
            <span>Subject &amp; Meetings</span>
            <span>Actions</span>
          </div>
        ) : null}

        {schedule.subjects.length === 0 ? (
          storageMode === 'memory' ? (
            <EmptyState
              variant="storage-error"
              title="Storage unavailable"
              description="Your schedule is kept in memory only and may be lost if you reload or close this page. Exporting a wallpaper saves an image, not an editable schedule backup."
              icon={
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
            />
          ) : (
            <EmptyState
              title="No subjects yet"
              description="Add your first subject and meeting to start building your wallpaper. Schedules are stored locally on this device."
              icon={
                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={onAddSubject}
                >
                  Add subject
                </Button>
              }
            />
          )
        ) : (
          <>
            <ul className="space-y-3">
              {schedule.subjects.map((s) => (
                <li key={s.id}>
                  <SubjectCard
                    subject={s}
                    onEdit={() => onEditSubject(s)}
                    onDelete={() => onDeleteSubject(s.id)}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onAddSubject}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-container)] border border-dashed border-line-strong bg-surface px-4 py-3 text-sm font-medium text-ink-2 transition-colors duration-[var(--dur-micro)] hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add another subject
            </button>
          </>
        )}
      </div>
    </section>
  )
}
