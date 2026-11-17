import { openDB } from 'idb'

export const DB_NAME = 'esked-db'
export const DB_VERSION = 1
export const SCHEDULES_STORE = 'schedules'
export const META_STORE = 'meta'

let dbPromise = null

/**
 * Returns a singleton promise resolving to the IDBDatabase.
 * Rejects if IndexedDB is unavailable or initialization fails.
 */
export function getDb() {
  if (dbPromise) return dbPromise

  if (typeof indexedDB === 'undefined') {
    const err = new Error('IndexedDB is not available in this environment')
    err.code = 'IDB_UNAVAILABLE'
    dbPromise = Promise.reject(err)
    // Allow retry later by clearing the cached promise on failure.
    dbPromise.catch(() => {
      dbPromise = null
    })
    return dbPromise
  }

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SCHEDULES_STORE)) {
        db.createObjectStore(SCHEDULES_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' })
      }
    },
    blocked() {
      // Another tab holds an older version; resolve will wait.
    },
    blocking() {
      // This connection blocks an upgrade; close to allow.
    },
  })

  dbPromise.catch(() => {
    dbPromise = null
  })

  return dbPromise
}

/** For tests: reset the cached connection. */
export function resetDbCache() {
  dbPromise = null
}