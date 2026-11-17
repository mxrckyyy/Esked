import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { resetDbCache } from './db.js'
import { scheduleRepository } from './scheduleRepository.js'


beforeEach(async () => {
  resetDbCache()
  try {
    const db = await getDb()
    await db.clear('schedules')
    await db.clear('meta')
  } catch {
    // ignore
  }
})

describe('scheduleRepository', () => {
  it('initializes default schedule', async () => {
    const s = await scheduleRepository.getDefaultSchedule()
    expect(s).toBeTruthy()
    expect(s.title).toBe('My Schedule')
    const again = await scheduleRepository.getDefaultSchedule()
    expect(again.id).toBe(s.id)
  })

  it('saves and loads schedule', async () => {
    const s = await scheduleRepository.getDefaultSchedule()
    s.title = 'Updated Title'
    await scheduleRepository.saveSchedule(s)
    const loaded = await scheduleRepository.getSchedule(s.id)
    expect(loaded.title).toBe('Updated Title')
  })

  it('deletes schedule', async () => {
    const s = await scheduleRepository.getDefaultSchedule()
    await scheduleRepository.deleteSchedule(s.id)
    const loaded = await scheduleRepository.getSchedule(s.id)
    expect(loaded).toBeUndefined()
  })

  it('throws on invalid schedule save', async () => {
    await expect(scheduleRepository.saveSchedule({})).rejects.toThrow()
  })

  it('creates new default after delete', async () => {
    const s = await scheduleRepository.getDefaultSchedule()
    await scheduleRepository.deleteSchedule(s.id)
    const s2 = await scheduleRepository.getDefaultSchedule()
    expect(s2).toBeTruthy()
    expect(s2.id).not.toBe(s.id)
  })
})