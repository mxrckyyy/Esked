export function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-line"
            style={{ backgroundColor: subject.color }}
            aria-hidden="true"
          />
          <h3 className="min-w-0 break-words font-semibold text-ink">{subject.name || 'Untitled subject'}</h3>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="min-h-[44px] rounded-md border border-line-strong px-3 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-[44px] rounded-md border border-danger/40 px-3 text-sm text-danger hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Delete
          </button>
        </div>
      </div>
      {subject.meetings && subject.meetings.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm tabular-nums text-ink-2">
          {subject.meetings.map((m) => (
            <li key={m.id}>
              {(m.days || []).join(', ') || 'No days'} · {m.start}–{m.end}
              {m.room ? ` · ${m.room}` : ''}
              {m.instructor ? ` · ${m.instructor}` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-3">No meetings yet.</p>
      )}
      {subject.notes ? <p className="mt-2 text-sm text-ink-3">{subject.notes}</p> : null}
    </article>
  )
}