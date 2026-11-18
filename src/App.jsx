import { useState, useCallback } from 'react'
import { useSchedule } from './hooks/useSchedule.js'
import { useOnlineStatus } from './hooks/useOnlineStatus.js'
import { usePwaInstall } from './hooks/usePwaInstall.js'
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate.js'
import { SCHEDULE_ACTIONS } from './lib/scheduleReducer.js'
import { validateSubject, validateSchedule } from './lib/model.js'
import { SAMPLE_SUBJECTS } from './lib/sampleSchedule.js'
import { ScheduleView } from './components/ScheduleView.jsx'
import { SubjectForm } from './components/SubjectForm.jsx'
import { QuickAddModal } from './components/QuickAddModal.jsx'
import { SettingsPanel } from './components/SettingsPanel.jsx'
import { PreviewCanvas } from './components/PreviewCanvas.jsx'
import { OfflineIndicator } from './components/OfflineIndicator.jsx'
import { InstallPrompt } from './components/InstallPrompt.jsx'
import { UpdatePrompt } from './components/UpdatePrompt.jsx'
import { IosInstallInstructions } from './components/IosInstallInstructions.jsx'

const TABS = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'customize', label: 'Customize' },
  { id: 'preview', label: 'Preview' },
]

export default function App() {
  const { schedule, dispatch, loading, saving, error, storageMode, storageWarning } = useSchedule()
  const online = useOnlineStatus()
  const { canInstall, promptInstall } = usePwaInstall()
  const { updateAvailable, reloadNeeded, update, reload } = useServiceWorkerUpdate()
  const [tab, setTab] = useState('schedule')
  const [subjectModal, setSubjectModal] = useState({ open: false, subject: null })
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const openAdd = useCallback(() => {
    setFormError('')
    setSubjectModal({ open: true, subject: null })
  }, [])
  const openQuickAdd = useCallback(() => {
    setFormError('')
    setQuickAddOpen(true)
  }, [])
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), [])
  const openEdit = useCallback((s) => {
    setFormError('')
    setSubjectModal({ open: true, subject: s })
  }, [])
  const closeSubject = useCallback(() => {
    setSubjectModal({ open: false, subject: null })
  }, [])

  function handleSubjectSubmit(payload) {
    const candidate = {
      id: payload.id,
      name: payload.name,
      color: payload.color,
      notes: payload.notes,
      meetings: payload.meetings,
    }
    const v = validateSubject(candidate)
    if (!v.valid) {
      setFormError(v.errors.join('; '))
      return false
    }
    setFormError('')
    if (payload.id) {
      dispatch({
        type: SCHEDULE_ACTIONS.UPDATE_SUBJECT,
        payload: { id: payload.id, changes: candidate },
      })
    } else {
      dispatch({ type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: candidate })
    }
    return true
  }

  function handleDeleteSubject(id) {
    if (window.confirm('Delete this subject?')) {
      dispatch({ type: SCHEDULE_ACTIONS.DELETE_SUBJECT, payload: id })
    }
  }

  function handleLoadSample() {
    if (schedule.subjects.length > 0) {
      if (!window.confirm('Replace the current schedule with sample data?')) return
      dispatch({ type: SCHEDULE_ACTIONS.RESET })
    }
    for (const s of SAMPLE_SUBJECTS) {
      dispatch({ type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: s })
    }
  }

  function handleSettingsChange(changes) {
    dispatch({ type: SCHEDULE_ACTIONS.UPDATE_SETTINGS, payload: changes })
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Esked</h1>
          <p className="mt-2 text-slate-600">Loading…</p>
        </div>
      </main>
    )
  }

  const scheduleValid = validateSchedule(schedule).valid

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Esked</h1>
            <span className="text-sm text-slate-500">Offline-first schedule wallpapers</span>
          </div>
          <nav className="flex gap-2" aria-label="Primary">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`min-h-[44px] rounded-md px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  tab === t.id
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {storageWarning ? (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {storageWarning}
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {String(error.message || error)}
          </div>
        </div>
      ) : null}
      {formError ? (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {formError}
          </div>
        </div>
      ) : null}

      <OfflineIndicator online={online} />
      <InstallPrompt canInstall={canInstall} onInstall={promptInstall} />
      <UpdatePrompt available={updateAvailable} reloadNeeded={reloadNeeded} onUpdate={update} onReload={reload} />
      <IosInstallInstructions />

      <section className="mx-auto max-w-4xl px-4 py-6">
        {tab === 'schedule' ? (
          <ScheduleView
            schedule={schedule}
            onAddSubject={openAdd}
            onQuickAdd={openQuickAdd}
            onEditSubject={openEdit}
            onDeleteSubject={handleDeleteSubject}
            onLoadSample={handleLoadSample}
            onUpdateTitle={(v) => dispatch({ type: SCHEDULE_ACTIONS.UPDATE_TITLE, payload: v })}
            onUpdateSemester={(v) => dispatch({ type: SCHEDULE_ACTIONS.UPDATE_SEMESTER, payload: v })}
          />
        ) : null}
        {tab === 'customize' ? (
          <SettingsPanel settings={schedule.settings} onChange={handleSettingsChange} />
        ) : null}
        {tab === 'preview' ? (
          scheduleValid ? (
            <PreviewCanvas schedule={schedule} />
          ) : (
            <p className="text-sm text-red-600">Fix schedule validation errors before preview.</p>
          )
        ) : null}
      </section>

      <footer className="mx-auto max-w-4xl px-4 pb-6 text-xs text-slate-500">
        {saving ? 'Saving…' : storageMode === 'persistent' ? 'Saved locally' : 'Memory only'}
      </footer>

      <SubjectForm
        key={`${subjectModal.open}-${subjectModal.subject?.id ?? 'new'}`}
        open={subjectModal.open}
        subject={subjectModal.subject}
        onClose={closeSubject}
        onSubmit={handleSubjectSubmit}
      />
      <QuickAddModal
        open={quickAddOpen}
        onClose={closeQuickAdd}
        onSubmit={handleSubjectSubmit}
        onSwitchToManual={() => {
          closeQuickAdd()
          openAdd()
        }}
      />
    </main>
  )
}
