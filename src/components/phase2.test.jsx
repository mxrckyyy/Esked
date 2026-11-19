import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

describe('Phase 2 schedule management', () => {
  it('renders empty state initially', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
  })

  it('creates a subject via modal', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'Math' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Math')).toBeInTheDocument())
  })

  it('shows validation error on empty name', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('deletes a subject after confirmation', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'ToDelete' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('ToDelete')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /delete subject/i }))
    await waitFor(() => expect(screen.queryByText('ToDelete')).not.toBeInTheDocument())
  })

  it('loads sample schedule', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    await waitFor(() => expect(screen.getByText('Mathematics')).toBeInTheDocument())
    expect(screen.getByText('Physics')).toBeInTheDocument()
  })

  it('creates subject with multiple meetings and weekdays', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Multi' } })
    fireEvent.click(screen.getByRole('button', { name: /add meeting/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText('Multi')).toBeInTheDocument())
  })

  it('closes modal on Escape', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getAllByRole('button', { name: /add subject/i })[0])
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows storage warning in memory mode', async () => {
    const repoMod = await import('../storage/scheduleRepository.js')
    vi.spyOn(repoMod.scheduleRepository, 'getDefaultSchedule').mockRejectedValueOnce(new Error('boom'))
    render(<App />)
    await waitFor(() => expect(screen.getByText(/storage is unavailable/i)).toBeInTheDocument())
  })
})