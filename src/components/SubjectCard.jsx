import { Button } from './ui/Button.jsx'

const EditIcon = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

export function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <article className="rounded-[var(--radius-container)] border border-line bg-surface p-4 transition-colors duration-[var(--dur-micro)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-line"
            style={{ backgroundColor: subject.color }}
            aria-hidden="true"
          />
          <h3 className="min-w-0 break-words font-semibold text-ink">{subject.name || 'Untitled subject'}</h3>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            aria-label="Edit"
            className="min-h-[44px] min-w-[44px] px-2.5 lg:px-3"
          >
            {EditIcon}
            <span className="hidden lg:inline">Edit</span>
          </Button>
          <Button
            variant="danger-outline"
            size="sm"
            onClick={onDelete}
            aria-label="Delete"
            className="min-h-[44px] min-w-[44px] px-2.5 lg:px-3"
          >
            {TrashIcon}
            <span className="hidden lg:inline">Delete</span>
          </Button>
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
