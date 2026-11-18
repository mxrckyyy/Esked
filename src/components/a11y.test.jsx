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
})