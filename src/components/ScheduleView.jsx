import { SubjectCard } from './SubjectCard.jsx'
import { EmptyState } from './Modal.jsx'

export function ScheduleView({
  schedule,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onUpdateTitle,
  onUpdateSemester,
  onLoadSample,
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500" htmlFor="schedule-title">
            Schedule title
          </label>
          <input
            id="schedule-title"
            type="text"
            value={schedule.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-lg font-semibold"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500" htmlFor="schedule-semester">
            Semester
          </label>
          <input
            id="schedule-semester"
            type="text"
            value={schedule.semester}
            onChange={(e) => onUpdateSemester(e.target.value)}
            className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. Fall 2026"
          />
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-slate-500">
            {schedule.subjects.length} subject{schedule.subjects.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={onLoadSample}
            className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Load sample
          </button>
          <button
            type="button"
            onClick={onAddSubject}
            className="min-h-[44px] rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Add subject
          </button>
        </div>
      </div>

      {schedule.subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Add your first subject and meeting to start building your wallpaper."
          action={
            <button
              type="button"
              onClick={onAddSubject}
              className="min-h-[44px] rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add subject
            </button>
          }
        />
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
