import { getDb, SCHEDULES_STORE, META_STORE } from './db.js'
import { createDefaultSchedule } from '../lib/model.js'

export class StorageError extends Error {
  constructor(message, code, cause) {
    super(message)
    this.name = 'StorageError'
    this.code = code || 'STORAGE_ERROR'
    if (cause) this.cause = cause
  }
}

const DEFAULT_META_KEY = 'defaultScheduleId'

function wrap(err, code) {
  if (err instanceof StorageError) return err
  return new StorageError(err && err.message ? err.message : 'Storage operation failed', code, err)
}

export const scheduleRepository = {
  /**
   * Ensure a default schedule exists and return it.
   */
  async getDefaultSchedule() {
    try {
      const db = await getDb()
      const meta = await db.get(META_STORE, DEFAULT_META_KEY)
      if (meta && meta.value) {
        const existing = await db.get(SCHEDULES_STORE, meta.value)
        if (existing) return existing
      }
      const created = createDefaultSchedule()
      await db.put(SCHEDULES_STORE, created)
      await db.put(META_STORE, { key: DEFAULT_META_KEY, value: created.id })
      return created
    } catch (err) {
      throw wrap(err, 'GET_DEFAULT_FAILED')
    }
  },

  async getSchedule(id) {
    try {
      const db = await getDb()
      return await db.get(SCHEDULES_STORE, id)
    } catch (err) {
      throw wrap(err, 'GET_FAILED')
    }
  },

  async saveSchedule(schedule) {
    if (!schedule || typeof schedule.id !== 'string') {
      throw new StorageError('Schedule must have a string id', 'INVALID_SCHEDULE')
    }
    try {
      const db = await getDb()
      await db.put(SCHEDULES_STORE, schedule)
    } catch (err) {
      throw wrap(err, 'SAVE_FAILED')
    }
  },

  async deleteSchedule(id) {
    try {
      const db = await getDb()
      await db.delete(SCHEDULES_STORE, id)
      const meta = await db.get(META_STORE, DEFAULT_META_KEY)
      if (meta && meta.value === id) {
        await db.delete(META_STORE, DEFAULT_META_KEY)
      }
    } catch (err) {
      throw wrap(err, 'DELETE_FAILED')
    }
  },

  async init() {
    return this.getDefaultSchedule()
  },
}