import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OfflineIndicator } from './OfflineIndicator.jsx'
import { InstallPrompt } from './InstallPrompt.jsx'
import { UpdatePrompt } from './UpdatePrompt.jsx'

describe('PWA components', () => {
  it('OfflineIndicator shows when offline', () => {
    render(<OfflineIndicator online={false} />)
    expect(screen.getByText(/you are offline/i)).toBeInTheDocument()
  })
  it('OfflineIndicator hides when online', () => {
    const { container } = render(<OfflineIndicator online={true} />)
    expect(container).toBeEmptyDOMElement()
  })
  it('InstallPrompt shows when canInstall', () => {
    render(<InstallPrompt canInstall={true} onInstall={() => {}} />)
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument()
  })
  it('UpdatePrompt shows when available', () => {
    render(<UpdatePrompt available={true} onUpdate={() => {}} />)
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument()
  })
  it('UpdatePrompt shows reload when reloadNeeded', () => {
    render(<UpdatePrompt available={false} reloadNeeded={true} onUpdate={() => {}} onReload={() => {}} />)
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })
})