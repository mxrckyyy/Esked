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

  it('transitions to memory mode on save failure', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'saveSchedule').mockRejectedValue(new Error('quota'))
    // make error look like storage failure
    spy.mockImplementation(() => { const e = new Error('quota'); e.code = 'SAVE_FAILED'; return Promise.reject(e) })
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Fail Title' }) })
    // flush debounce
    await act(async () => { await new Promise((r) => setTimeout(r, 500)) })
    await waitFor(() => expect(result.current.storageMode).toBe('memory'))
    expect(result.current.storageWarning).toBeTruthy()
    expect(result.current.error).toBeTruthy()
    // further changes do not attempt saves
    const callsBefore = spy.mock.calls.length
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Another' }) })
    await new Promise((r) => setTimeout(r, 500))
    expect(spy.mock.calls.length).toBe(callsBefore)
    spy.mockRestore()
  }, 10000)

  it('does not overwrite newer persisted data with older save (serialization)', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Controlled saves: first save resolves only after we trigger second update+save.
    let resolveFirst
    const firstPromise = new Promise((res) => { resolveFirst = res })
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'saveSchedule')
    let callCount = 0
    spy.mockImplementation(() => {
      callCount++
      if (callCount === 1) return firstPromise
      return Promise.resolve()
    })

    // First update
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'First' }) })
    await act(async () => { await new Promise((r) => setTimeout(r, 500)) })
    // At this point first save is in flight (pending firstPromise).
    // Second update while first save pending
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Second' }) })
    await act(async () => { await new Promise((r) => setTimeout(r, 500)) })
    // Resolve first save
    await act(async () => { resolveFirst(); await new Promise((r) => setTimeout(r, 50)) })

    // The saveSchedule calls: first 'First', second should be 'Second' (not 'First').
    const titles = spy.mock.calls.map((c) => c[0].title)
    // Ensure at least 2 calls and last persisted title is 'Second'
    expect(titles.length).toBeGreaterThanOrEqual(2)
    expect(titles[titles.length - 1]).toBe('Second')
    spy.mockRestore()
  }, 15000)

  it('visibilitychange flushes pending save', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'saveSchedule')
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Vis Title' }) })
    // do not wait full debounce; trigger visibility hidden
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    await act(async () => { await new Promise((r) => setTimeout(r, 100)) })
    expect(spy).toHaveBeenCalled()
    const last = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(last.title).toBe('Vis Title')
    spy.mockRestore()
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  }, 10000)

  it('cleanup flushes pending save on unmount', async () => {
    const { result, unmount } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const repoMod = await import('../storage/scheduleRepository.js')
    const spy = vi.spyOn(repoMod.scheduleRepository, 'saveSchedule')
    act(() => { result.current.dispatch({ type: 'schedule/updateTitle', payload: 'Cleanup Title' }) })
    unmount()
    await new Promise((r) => setTimeout(r, 100))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  }, 10000)
})