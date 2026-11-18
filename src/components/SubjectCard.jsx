export function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-slate-200"
            style={{ backgroundColor: subject.color }}
            aria-hidden="true"
          />
          <h3 className="font-semibold text-slate-900">{subject.name || 'Untitled subject'}</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[44px] rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-[44px] rounded-md border border-red-300 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      {subject.meetings && subject.meetings.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {subject.meetings.map((m) => (
            <li key={m.id}>
              {(m.days || []).join(', ') || 'No days'} · {m.start}–{m.end}
              {m.room ? ` · ${m.room}` : ''}
              {m.instructor ? ` · ${m.instructor}` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No meetings yet.</p>
      )}
      {subject.notes ? <p className="mt-2 text-sm text-slate-500">{subject.notes}</p> : null}
    </article>
  )
}
