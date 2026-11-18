import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('subject modal', () => {
  it('opens form without crashing', async () => {
    render(<App />)
    await new Promise((r) => setTimeout(r, 50))
    const btns = screen.getAllByRole('button', { name: /add subject/i })
    fireEvent.click(btns[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })
})