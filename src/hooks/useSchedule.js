import { useCallback, useEffect, useRef, useState, useReducer } from 'react'
import { scheduleReducer, SCHEDULE_ACTIONS } from '../lib/scheduleReducer.js'
import { createDefaultSchedule } from '../lib/model.js'
import { scheduleRepository } from '../storage/scheduleRepository.js'

const AUTOSAVE_DELAY = 400

function isStorageFailure(err) {
  const code = err && (err.code || (err.cause && err.cause.code))
  return code === 'IDB_UNAVAILABLE' || code === 'SAVE_FAILED' || code === 'GET_DEFAULT_FAILED'
}

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
  const [storageMode, setStorageMode] = useState('persistent')
  const [storageWarning, setStorageWarning] = useState(null)

  const latestScheduleRef = useRef(schedule)
  const mountedRef = useRef(true)
  const storageModeRef = useRef(storageMode)

  useEffect(() => {
    latestScheduleRef.current = schedule
  })
  useEffect(() => {
    storageModeRef.current = storageMode
  })

  const timerRef = useRef(null)
  const saveChainRef = useRef(Promise.resolve())
  const inFlightRef = useRef(0)
  const saveCounterRef = useRef(0)

  const performSave = useCallback(async (snapshot) => {
    if (!mountedRef.current) return
    if (storageModeRef.current !== 'persistent') return
    if (!dirtyRef.current) return

    const myId = ++saveCounterRef.current
    inFlightRef.current += 1
    setSaving(true)

    try {
      await scheduleRepository.saveSchedule(snapshot)
      // Clear dirty only if no newer change occurred during/after this save.
      if (mountedRef.current && storageModeRef.current === 'persistent' && latestScheduleRef.current === snapshot) {
        dirtyRef.current = false
      }
    } catch (err) {
      if (!mountedRef.current) return
      setError(err)
      if (isStorageFailure(err)) {
        storageModeRef.current = 'memory'
        setStorageMode('memory')
        setStorageWarning(
          'Storage failed. Changes are kept in memory only and may not persist.'
        )
      }
      // Leave dirty true so the change is not considered persisted.
      dirtyRef.current = true
    } finally {
      if (mountedRef.current) {
        inFlightRef.current = Math.max(0, inFlightRef.current - 1)
        if (inFlightRef.current === 0) setSaving(false)
      }
    }
    // Keep myId referenced to avoid lint; used for ordering clarity only.
    void myId
  }, [])

  const enqueueSave = useCallback(() => {
    // Serialize all saves through a single promise chain so an earlier save
    // can never complete after (and overwrite) a later one.
    saveChainRef.current = saveChainRef.current
      .then(() => performSave(latestScheduleRef.current))
      .catch(() => {})
  }, [performSave])

  const scheduleSave = useCallback(() => {
    if (storageModeRef.current !== 'persistent') return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      enqueueSave()
    }, AUTOSAVE_DELAY)
  }, [enqueueSave])

  const flushSave = useCallback(() => {
    if (storageModeRef.current !== 'persistent') return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    enqueueSave()
  }, [enqueueSave])

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
        storageModeRef.current = 'persistent'
        setStorageMode('persistent')
        setStorageWarning(null)
      } catch (err) {
        if (cancelled || !mountedRef.current) return
        storageModeRef.current = 'memory'
        setStorageMode('memory')
        setStorageWarning(
          'Storage is unavailable. Changes are kept in memory only and may not persist.'
        )
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

  // Debounced autosave on schedule change
  useEffect(() => {
    if (loading) return
    if (storageModeRef.current !== 'persistent') return
    if (!dirtyRef.current) return

    scheduleSave()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [schedule, loading, scheduleSave])

  // Flush when the document becomes hidden
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState !== 'hidden') return
      if (storageModeRef.current !== 'persistent') return
      if (!dirtyRef.current) return
      flushSave()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [flushSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (storageModeRef.current === 'persistent' && dirtyRef.current) {
        // Best-effort final persist; do not block unmount.
        scheduleRepository.saveSchedule(latestScheduleRef.current).catch(() => {})
      }
    }
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
    flush: flushSave,
  }
}