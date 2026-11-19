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

describe('Quick Add', () => {
  it('opens Quick Add modal', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByLabelText(/schedule text/i)).toBeInTheDocument()
  })

  it('parses successful input and shows review fields', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    fireEvent.change(screen.getByLabelText(/schedule text/i), { target: { value: 'Math 201 MWF 8-9:30 R204' } })
    fireEvent.click(screen.getByRole('button', { name: /parse/i }))
    await waitFor(() => expect(screen.getByDisplayValue('Math 201')).toBeInTheDocument())
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument()
  })

  it('displays errors on invalid input', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    fireEvent.change(screen.getByLabelText(/schedule text/i), { target: { value: 'garbage' } })
    fireEvent.click(screen.getByRole('button', { name: /parse/i }))
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('alert')).toBeInTheDocument())
  })

  it('preserves original input on failure', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    fireEvent.change(screen.getByLabelText(/schedule text/i), { target: { value: 'garbage input' } })
    fireEvent.click(screen.getByRole('button', { name: /parse/i }))
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('alert')).toBeInTheDocument())
    expect(screen.getByLabelText(/schedule text/i).value).toBe('garbage input')
  })

  it('confirms and adds subject', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    fireEvent.change(screen.getByLabelText(/schedule text/i), { target: { value: 'Math 201 MWF 8-9:30 R204' } })
    fireEvent.click(screen.getByRole('button', { name: /parse/i }))
    await waitFor(() => expect(screen.getByDisplayValue('Math 201')).toBeInTheDocument())
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: /add subject/i }))
    await waitFor(() => expect(screen.getByText('Math 201')).toBeInTheDocument())
  })

  it('parsing alone does not add subject', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    fireEvent.change(screen.getByLabelText(/schedule text/i), { target: { value: 'Math 201 MWF 8-9:30 R204' } })
    fireEvent.click(screen.getByRole('button', { name: /parse/i }))
    await waitFor(() => expect(screen.getByDisplayValue('Math 201')).toBeInTheDocument())
    // close without confirming
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument()
  })

  it('switches to manual form', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText(/no subjects yet/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /quick add/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /use manual form/i }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })
})
