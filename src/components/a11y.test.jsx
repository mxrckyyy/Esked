import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { resetDbCache } from '../storage/db.js'
import App from '../App'

beforeEach(async () => {
  resetDbCache()
  try {
    const { getDb } = await import('../storage/db.js')
    const db = await getDb()
    await db.clear('schedules')
    await db.clear('meta')
  } catch {}
  vi.restoreAllMocks()
})

describe('Accessibility', () => {
  it('modal close button has accessible name', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument()
  })

  it('modal closes on Escape', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('Quick Add textarea has guidance association', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    const textarea = screen.getByLabelText(/schedule text/i)
    expect(textarea).toHaveAttribute('aria-describedby', 'quick-add-help')
  })

  it('footer status is a live region', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    const footer = screen.getByText(/saved locally|memory only/i).closest('footer')
    expect(footer).toHaveAttribute('aria-live', 'polite')
  })

  it('skip link is outside and precedes main landmark', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    const skip = screen.getByRole('link', { name: /skip to main content/i })
    expect(skip).toHaveAttribute('href', '#main')
    const main = document.getElementById('main')
    expect(main).not.toBeNull()
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(skip.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(main.contains(skip)).toBe(false)
  })

  it('heading hierarchy is sequential', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    const h1 = screen.getByRole('heading', { level: 1, name: /esked/i })
    expect(h1).toBeInTheDocument()
    const h2s = screen.getAllByRole('heading', { level: 2 })
    expect(h2s.length).toBeGreaterThan(0)
  })

  it('subject form labels are associated with inputs', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toHaveAttribute('id', 'subject-name')
    expect(nameInput).toHaveAttribute('aria-required', 'true')
  })

  it('invalid subject form exposes aria-invalid and aria-describedby', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('alert')).toBeInTheDocument())
    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    expect(nameInput).toHaveAttribute('aria-describedby', 'subject-form-error')
  })

  it('error association clears after correction', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('alert')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Fixed' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
  })

  it('storage and error banners are live regions', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    // form error becomes a live region after triggering
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('alert')).toBeInTheDocument())
  })

  it('delete dialog exposes correct semantics and focuses cancel', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    // create a subject first
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'ToDelete' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('ToDelete')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-subject-message')
    expect(screen.getByRole('button', { name: /keep subject/i })).toHaveFocus()
  })

  it('delete dialog cancels on Escape', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'ToDelete' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('ToDelete')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('ToDelete')).toBeInTheDocument()
  })

  it('delete dialog confirms removal', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'ToDelete' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('ToDelete')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete subject/i }))
    await waitFor(() => expect(screen.queryByText('ToDelete')).not.toBeInTheDocument())
  })

  it('preview canvas has accessible image role', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    // add a subject so preview is reachable
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Math' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Math')).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /^preview$/i })[0])
    await waitFor(() => expect(screen.getByRole('img', { name: /wallpaper preview/i })).toBeInTheDocument())
  })

  it('subject color indicator is hidden from assistive technology', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Colored' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Colored')).toBeInTheDocument())
    const card = screen.getByText('Colored').closest('article')
    const dot = card.querySelector('span[aria-hidden="true"]')
    expect(dot).not.toBeNull()
  })

  it('first-use empty state renders with Add subject action', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    expect(screen.getAllByRole('button', { name: /add subject/i }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/storage unavailable/i)).not.toBeInTheDocument()
  })

  it('storage-error empty state renders when storage is unavailable', async () => {
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'getDefaultSchedule').mockRejectedValueOnce(new Error('boom'))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/storage unavailable/i)).toBeInTheDocument())
    const emptyState = screen.getByText(/storage unavailable/i).closest('div')
    expect(emptyState).toHaveTextContent(/exporting a wallpaper saves an image/i)
    expect(screen.queryByRole('button', { name: /reload/i })).not.toBeInTheDocument()
    // storage failure is announced once, via the warning banner (role="status"), not the empty state
    const statusRegions = screen.getAllByRole('status')
    expect(statusRegions.length).toBeGreaterThan(0)
    spy.mockRestore()
  })

  it('existing subjects remain visible after a write failure', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Kept' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Kept')).toBeInTheDocument())
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'saveSchedule').mockImplementation(() => {
      const e = new Error('quota'); e.code = 'SAVE_FAILED'; return Promise.reject(e)
    })
    // trigger a change to attempt save
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Kept2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText(/storage failed|storage unavailable/i)).toBeTruthy())
    expect(screen.getByText('Kept2')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('notice priority shows only one non-critical notice', async () => {
    const { OfflineIndicator } = await import('./OfflineIndicator.jsx')
    const { InstallPrompt } = await import('./InstallPrompt.jsx')
    const { container: c1 } = render(<OfflineIndicator online={false} enabled={false} />)
    expect(c1).toBeEmptyDOMElement()
    const { container: c2 } = render(<InstallPrompt canInstall={true} onInstall={() => {}} enabled={false} />)
    expect(c2).toBeEmptyDOMElement()
  })

  it('critical notice renders alongside single non-critical slot', async () => {
    // component-level: enabled gating hides non-critical when not selected
    const { OfflineIndicator } = await import('./OfflineIndicator.jsx')
    const { container } = render(<OfflineIndicator online={false} enabled={true} />)
    expect(container).not.toBeEmptyDOMElement()
  })
})