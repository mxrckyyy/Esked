import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PreviewCanvas } from './PreviewCanvas.jsx'
import { createDefaultSchedule } from '../lib/model.js'

describe('PreviewCanvas', () => {
  it('renders canvas and buttons without crashing', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument()
  })

  it('renders safe-zone toggle and zoom controls', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByLabelText(/safe zones/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('shows output dimensions', () => {
    const schedule = createDefaultSchedule()
    render(<PreviewCanvas schedule={schedule} />)
    expect(screen.getByText(/output:/i)).toBeInTheDocument()
  })
})