import { SubjectCard } from './SubjectCard.jsx'
import { EmptyState } from './Modal.jsx'

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
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-xs font-medium text-ink-3" htmlFor="schedule-title">
            Schedule title
          </label>
          <input
            id="schedule-title"
            type="text"
            value={schedule.title}
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
            value={schedule.semester}
            onChange={(e) => onUpdateSemester(e.target.value)}
            className="mt-1 w-full max-w-md rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            placeholder="e.g. Fall 2026"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-full text-sm text-ink-3 sm:w-auto">
          {schedule.subjects.length} subject{schedule.subjects.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={onLoadSample}
          className="min-h-[44px] rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink-2 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
        >
          Load sample
        </button>
        {onQuickAdd ? (
          <button
            type="button"
            onClick={onQuickAdd}
            className="min-h-[44px] rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink-2 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Quick add
          </button>
        ) : null}
        <button
          type="button"
          onClick={onAddSubject}
          className="min-h-[44px] w-full rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-focus sm:ml-auto sm:w-auto"
        >
          Add subject
        </button>
      </div>

      <h2 className="text-base font-semibold text-ink">Subjects</h2>
      {schedule.subjects.length === 0 ? (
        storageMode === 'memory' ? (
          <EmptyState
            variant="storage-error"
            title="Storage unavailable"
            description="Your schedule is kept in memory only and may be lost if you reload or close this page. Exporting a wallpaper saves an image, not an editable schedule backup."
          />
        ) : (
          <EmptyState
            title="No subjects yet"
            description="Add your first subject and meeting to start building your wallpaper. Schedules are stored locally on this device."
            action={
              <button
                type="button"
                onClick={onAddSubject}
                className="min-h-[44px] rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent/90"
              >
                Add subject
              </button>
            }
          />
        )
      ) : (
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
      )}
    </section>
  )
}
