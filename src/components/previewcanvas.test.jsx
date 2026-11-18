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
})