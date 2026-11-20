import { useState, useCallback } from 'react'
import { useSchedule } from './hooks/useSchedule.js'
import { useOnlineStatus } from './hooks/useOnlineStatus.js'
import { useTheme } from './hooks/useTheme.js'
import { usePwaInstall } from './hooks/usePwaInstall.js'
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate.js'
import { SCHEDULE_ACTIONS } from './lib/scheduleReducer.js'
import { validateSubject, validateSchedule } from './lib/model.js'
import { SAMPLE_SUBJECTS } from './lib/sampleSchedule.js'
import { AppShell } from './components/AppShell.jsx'
import { Card } from './components/ui/Card.jsx'
import { ScheduleView } from './components/ScheduleView.jsx'
import { SubjectForm } from './components/SubjectForm.jsx'
import { Modal } from './components/Modal.jsx'
import { QuickAddModal } from './components/QuickAddModal.jsx'
import { SettingsPanel } from './components/SettingsPanel.jsx'
import { PreviewCanvas } from './components/PreviewCanvas.jsx'
import { OfflineIndicator } from './components/OfflineIndicator.jsx'
import { InstallPrompt } from './components/InstallPrompt.jsx'
import { UpdatePrompt } from './components/UpdatePrompt.jsx'
import { IosInstallInstructions } from './components/IosInstallInstructions.jsx'

export default function App() {
  const { schedule, dispatch, loading, saving, error, storageMode, storageWarning } = useSchedule()
  const online = useOnlineStatus()
  const { theme, toggle: toggleTheme } = useTheme()
  const { canInstall, promptInstall } = usePwaInstall()
  const { updateAvailable, reloadNeeded, update, reload } = useServiceWorkerUpdate()

  // Non-critical notice priority: at most one non-critical notice at a time.
  // Critical notices (storage warning, error, form error) are never suppressed.
  let activeNotice = null
  if (!online) activeNotice = 'offline'
  else if (updateAvailable || reloadNeeded) activeNotice = 'update'
  else if (canInstall) activeNotice = 'install'
  else if (typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '') && /WebKit/.test(navigator.userAgent || '') && window.navigator.standalone !== true) activeNotice = 'ios'
  const [tab, setTab] = useState('schedule')
  const [subjectModal, setSubjectModal] = useState({ open: false, subject: null })
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loadSampleConfirm, setLoadSampleConfirm] = useState(false)

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
    const subject = (schedule?.subjects || []).find((s) => s.id === id) || null
    setDeleteTarget(subject ? { id: subject.id, name: subject.name, meetingCount: (subject.meetings || []).length } : { id, name: '', meetingCount: 0 })
  }

  function confirmDeleteSubject() {
    if (deleteTarget?.id) {
      dispatch({ type: SCHEDULE_ACTIONS.DELETE_SUBJECT, payload: deleteTarget.id })
    }
    setDeleteTarget(null)
  }

  function cancelDeleteSubject() {
    setDeleteTarget(null)
  }

  function handleLoadSample() {
    if (schedule.subjects.length > 0) {
      setLoadSampleConfirm(true)
      return
    }
    loadSampleSubjects()
  }

  function loadSampleSubjects() {
    if (schedule.subjects.length > 0) {
      dispatch({ type: SCHEDULE_ACTIONS.RESET })
    }
    for (const s of SAMPLE_SUBJECTS) {
      dispatch({ type: SCHEDULE_ACTIONS.ADD_SUBJECT, payload: s })
    }
    setLoadSampleConfirm(false)
  }

  function cancelLoadSample() {
    setLoadSampleConfirm(false)
  }

  function handleSettingsChange(changes) {
    dispatch({ type: SCHEDULE_ACTIONS.UPDATE_SETTINGS, payload: changes })
  }

  if (loading) {
    return (
      <>
        <a href="#main" className="skip-link">Skip to main content</a>
        <main id="main" tabIndex="-1" className="flex min-h-dvh items-center justify-center bg-canvas text-ink">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Esked</h1>
          <p className="mt-2 text-ink-2">Loading…</p>
        </div>
      </main>
    </>
    )
  }

  const scheduleValid = validateSchedule(schedule).valid

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      theme={theme}
      onToggleTheme={toggleTheme}
      saving={saving}
      storageMode={storageMode}
    >
      {/* ── Critical notices (never suppressed) ── */}
      {storageWarning ? (
        <div className="pt-4">
          <div role="status" aria-live="polite" className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
            {storageWarning}
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="pt-4">
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {String(error.message || error)}
          </div>
        </div>
      ) : null}
      {formError ? (
        <div className="pt-4">
          <div role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </div>
        </div>
      ) : null}

      {/* ── Non-critical notices (single slot) ── */}
      <OfflineIndicator online={online} enabled={activeNotice === 'offline'} />
      <InstallPrompt canInstall={canInstall} onInstall={promptInstall} enabled={activeNotice === 'install'} />
      <UpdatePrompt available={updateAvailable} reloadNeeded={reloadNeeded} onUpdate={update} onReload={reload} enabled={activeNotice === 'update'} />
      <IosInstallInstructions enabled={activeNotice === 'ios'} />

      {/* ── Tab content ── */}
      {tab === 'schedule' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.9fr_1fr]">
          <ScheduleView
            schedule={schedule}
            storageMode={storageMode}
            onAddSubject={openAdd}
            onQuickAdd={openQuickAdd}
            onEditSubject={openEdit}
            onDeleteSubject={handleDeleteSubject}
            onLoadSample={handleLoadSample}
            onUpdateTitle={(v) => dispatch({ type: SCHEDULE_ACTIONS.UPDATE_TITLE, payload: v })}
            onUpdateSemester={(v) => dispatch({ type: SCHEDULE_ACTIONS.UPDATE_SEMESTER, payload: v })}
          />
          <div className="hidden space-y-6 lg:block">
            <Card className="space-y-6">
              <SettingsPanel settings={schedule.settings} onChange={handleSettingsChange} />
              <div className="border-t border-line pt-6">
                {scheduleValid ? <PreviewCanvas schedule={schedule} embedded /> : <p className="text-sm text-danger">Fix schedule validation errors before preview.</p>}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
      {tab === 'customize' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.9fr_1fr]">
          <SettingsPanel settings={schedule.settings} onChange={handleSettingsChange} onSeePreview={() => setTab('preview')} />
          <div className="hidden space-y-6 lg:block">
            <Card>
              {scheduleValid ? <PreviewCanvas schedule={schedule} embedded /> : <p className="text-sm text-danger">Fix schedule validation errors before preview.</p>}
            </Card>
          </div>
        </div>
      ) : null}
      {tab === 'preview' ? (
        scheduleValid ? (
          <PreviewCanvas schedule={schedule} />
        ) : (
          <p className="text-sm text-danger">Fix schedule validation errors before preview.</p>
        )
      ) : null}

      {/* ── Modals (rendered outside content flow) ── */}
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

      <Modal
        open={!!deleteTarget}
        title="Delete subject?"
        onClose={cancelDeleteSubject}
        describedBy="delete-subject-message"
        initialFocus="#delete-keep-subject"
      >
        <p id="delete-subject-message" className="text-sm text-ink-2">
          {deleteTarget?.name
            ? `"${deleteTarget.name}" and its ${deleteTarget.meetingCount} meeting${deleteTarget.meetingCount === 1 ? '' : 's'} will be removed. This cannot be undone.`
            : 'This subject and its meetings will be removed. This cannot be undone.'}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            id="delete-keep-subject"
            onClick={cancelDeleteSubject}
            className="min-h-[44px] rounded-md border border-line-strong bg-surface px-4 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Keep subject
          </button>
          <button
            type="button"
            onClick={confirmDeleteSubject}
            className="min-h-[44px] rounded-md bg-danger px-4 text-sm font-medium text-white hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Delete subject
          </button>
        </div>
      </Modal>
      <Modal
        open={loadSampleConfirm}
        title="Load sample schedule?"
        onClose={cancelLoadSample}
        describedBy="load-sample-message"
        initialFocus="#load-sample-cancel"
      >
        <p id="load-sample-message" className="text-sm text-ink-2">
          This will replace your current {schedule?.subjects?.length || 0} subject{(schedule?.subjects?.length || 0) === 1 ? '' : 's'} with the sample schedule. This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            id="load-sample-cancel"
            onClick={cancelLoadSample}
            className="min-h-[44px] rounded-md border border-line-strong bg-surface px-4 text-sm text-ink-2 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Keep current
          </button>
          <button
            type="button"
            onClick={loadSampleSubjects}
            className="min-h-[44px] rounded-md bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Load sample
          </button>
        </div>
      </Modal>
    </AppShell>
  )
}
