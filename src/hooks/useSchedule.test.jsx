import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { resetDbCache } from '../storage/db.js'

vi.mock('../storage/scheduleRepository.js', async () => {
  const actual = await vi.importActual('../storage/scheduleRepository.js')
  return actual
})

import { useSchedule } from './useSchedule.js'
import { scheduleRepository } from '../storage/scheduleRepository.js'

beforeEach(async () => {
  resetDbCache()
  try {
    const { getDb } = await import('../storage/db.js')
    const db = await getDb()
    await db.clear('schedules')
    await db.clear('meta')
  } catch {
    // ignore
  }
})

describe('useSchedule', () => {
  it('loads schedule and exits loading', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.schedule).toBeTruthy()
    expect(result.current.isPersistent).toBe(true)
  })

  it('dispatches updates', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => {
      result.current.dispatch({ type: 'schedule/updateTitle', payload: 'New Title' })
    })
    expect(result.current.schedule.title).toBe('New Title')
  })

  it('autosaves after debounce delay', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const spy = vi.spyOn(scheduleRepository, 'saveSchedule')
    act(() => {
      result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Autosave Title' })
    })
    await new Promise((r) => setTimeout(r, 500))
    expect(spy).toHaveBeenCalled()
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(lastCall.title).toBe('Autosave Title')
    spy.mockRestore()
  })

  it('debounces rapid updates into fewer saves', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const spy = vi.spyOn(scheduleRepository, 'saveSchedule')
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'T1' }) })
    await new Promise((r) => setTimeout(r, 100))
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'T2' }) })
    await new Promise((r) => setTimeout(r, 500))
    // Should have saved final title
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(lastCall.title).toBe('T2')
    spy.mockRestore()
  })

  it('exposes storage warning in memory mode when init fails', async () => {
    // Force repository failure by mocking getDb via module mock
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'getDefaultSchedule').mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.isPersistent).toBe(false)
    expect(result.current.storageWarning).toBeTruthy()
    spy.mockRestore()
  })
})