import { useCallback, useEffect, useRef, useState, useReducer } from 'react'
import { scheduleReducer, SCHEDULE_ACTIONS } from '../lib/scheduleReducer.js'
import { createDefaultSchedule } from '../lib/model.js'
import { scheduleRepository } from '../storage/scheduleRepository.js'

const AUTOSAVE_DELAY = 400

export function useSchedule() {
  const [schedule, rawDispatch] = useReducer(scheduleReducer, undefined, () =>
    createDefaultSchedule()
  )

  const dirtyRef = useRef(false)
  const dispatch = useCallback((action) => {
    if (!action || action.type !== SCHEDULE_ACTIONS.REPLACE) {
      dirtyRef.current = true
    }
    rawDispatch(action)
  }, [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [storageMode, setStorageMode] = useState('persistent') // 'persistent' | 'memory'
  const [storageWarning, setStorageWarning] = useState(null)

  const latestScheduleRef = useRef(schedule)
  latestScheduleRef.current = schedule

  const saveTimerRef = useRef(null)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  // Initial load
  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    async function load() {
      try {
        const loaded = await scheduleRepository.getDefaultSchedule()
        if (cancelled || !mountedRef.current) return
        if (!dirtyRef.current) {
          rawDispatch({ type: SCHEDULE_ACTIONS.REPLACE, payload: loaded })
        }
        setStorageMode('persistent')
        setStorageWarning(null)
      } catch (err) {
        if (cancelled || !mountedRef.current) return
        setStorageMode('memory')
        setStorageWarning('Storage is unavailable. Changes are kept in memory only and may not persist.')
        setError(err)
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [])

  // Debounced autosave
  useEffect(() => {
    if (loading) return
    if (storageMode !== 'persistent') return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    const requestId = ++requestIdRef.current
    const snapshot = schedule

    saveTimerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await scheduleRepository.saveSchedule(snapshot)
        if (requestId !== requestIdRef.current) return
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setError(err)
        // If storage becomes unusable, fall back to memory mode.
        if (err && (err.code === 'IDB_UNAVAILABLE' || err.code === 'SAVE_FAILED')) {
          setStorageMode('memory')
          setStorageWarning('Storage failed. Changes are kept in memory only and may not persist.')
        }
      } finally {
        if (requestId === requestIdRef.current) setSaving(false)
      }
    }, AUTOSAVE_DELAY)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [schedule, loading, storageMode])

  // Flush pending write when document becomes hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState !== 'hidden') return
      if (storageMode !== 'persistent') return
      if (!saveTimerRef.current) return
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
      const snapshot = latestScheduleRef.current
      scheduleRepository.saveSchedule(snapshot).catch((err) => {
        if (mountedRef.current) setError(err)
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [storageMode])

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      if (storageMode === 'persistent') {
        scheduleRepository.saveSchedule(latestScheduleRef.current).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    schedule,
    dispatch,
    loading,
    saving,
    error,
    storageMode,
    storageWarning,
    isPersistent: storageMode === 'persistent',
  }
}