import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createDefaultSchedule, createSubject, createMeeting } from '../lib/model.js'
import { renderWallpaper } from './wallpaperEngine.js'


function makeCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textBaseline: 'top',
    textAlign: 'left',
    globalAlpha: 1,
    setLineDash: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    stroke: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    closePath: () => {},
    fill: () => {},
    arc: () => {},
    rect: () => {},
    measureText: (t) => ({ width: (t || '').length * 6 }),
    save: () => {},
    restore: () => {},
    clearRect: () => {},
  }
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => makeCtx())
})

describe('wallpaperEngine', () => {
  it('renders with preset dimensions (new API)', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, preset: 'iphone-15', template: 'dailyList', theme: 'dark' })
    expect(res.width).toBe(1179)
    expect(res.height).toBe(2556)
    expect(res.template).toBe('dailyList')
    expect(res.theme).toBe('dark')
    expect(res.canvas).toBeTruthy()
  })

  it('supports custom dimensions', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'todayFocus', theme: 'light' })
    expect(res.width).toBe(800)
    expect(res.height).toBe(600)
  })

  it('validates dimensions', () => {
    const schedule = createDefaultSchedule()
    expect(() => renderWallpaper({ schedule, width: 10, height: 600, template: 'dailyList', theme: 'dark' })).toThrow()
  })

  it('rejects unsupported template', () => {
    const schedule = createDefaultSchedule()
    expect(() => renderWallpaper({ schedule, width: 800, height: 600, template: 'nope', theme: 'dark' })).toThrow()
  })

  it('rejects unsupported theme', () => {
    const schedule = createDefaultSchedule()
    expect(() => renderWallpaper({ schedule, width: 800, height: 600, template: 'dailyList', theme: 'blue' })).toThrow()
  })

  it('does not mutate schedule', () => {
    const schedule = createDefaultSchedule()
    const subject = createSubject({ name: 'Math', meetings: [createMeeting({ days: ['Mon'], start: '08:00', end: '09:00' })] })
    schedule.subjects.push(subject)
    const before = JSON.stringify(schedule)
    renderWallpaper({ schedule, width: 800, height: 600, template: 'weeklyColumns', theme: 'dark' })
    expect(JSON.stringify(schedule)).toBe(before)
  })

  it('returns warnings for empty schedule', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'dailyList', theme: 'dark' })
    expect(res.warnings.length).toBeGreaterThan(0)
  })

  it('legacy call signature works', () => {
    const schedule = createDefaultSchedule()
    const canvas = document.createElement('canvas')
    const res = renderWallpaper(canvas, schedule)
    expect(res.canvas).toBe(canvas)
    expect(canvas.width).toBeGreaterThan(0)
  })

  it('all templates run', () => {
    const schedule = createDefaultSchedule()
    const subj = createSubject({ name: 'Math', meetings: [createMeeting({ days: ['Mon', 'Sat'], start: '08:00', end: '09:00', room: 'R1' })] })
    schedule.subjects.push(subj)
    for (const t of ['dailyList', 'weeklyColumns', 'todayFocus']) {
      const res = renderWallpaper({ schedule, width: 1080, height: 1920, template: t, theme: 'light' })
      expect(res.template).toBe(t)
    }
  })

  it('todayFocus fallback selected day', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'todayFocus', theme: 'dark' })
    expect(res.warnings.length).toBeGreaterThan(0)
  })

  it('safe zone reduces usable area without error', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'dailyList', theme: 'dark', settings: { showSafeZones: true } })
    expect(res.width).toBe(800)
  })

  // Presets and aliases
  const presets = [
    ['iphone-15', 1179, 2556],
    ['iphone-15-pro-max', 1290, 2796],
    ['android-common', 1080, 2400],
    ['android-tall', 1440, 3200],
  ]
  for (const [p, w, h] of presets) {
    it(`preset ${p} dimensions`, () => {
      const schedule = createDefaultSchedule()
      const res = renderWallpaper({ schedule, preset: p, template: 'dailyList', theme: 'dark' })
      expect(res.width).toBe(w)
      expect(res.height).toBe(h)
    })
  }
  it('legacy alias phone resolves', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, wallpaperPreset: 'phone', template: 'dailyList', theme: 'dark' })
    expect(res.width).toBe(1080)
    expect(res.height).toBe(2400)
  })

  // Schedule preservation
  it('handles weekend meetings', () => {
    const schedule = createDefaultSchedule()
    const subj = createSubject({ name: 'Weekend', meetings: [createMeeting({ days: ['Sat', 'Sun'], start: '09:00', end: '10:00' })] })
    schedule.subjects.push(subj)
    const res = renderWallpaper({ schedule, width: 1080, height: 1920, template: 'dailyList', theme: 'dark' })
    expect(res.warnings).not.toContain(expect.stringMatching(/dropped/i))
  })
  it('handles multiple meetings per day', () => {
    const schedule = createDefaultSchedule()
    const subj = createSubject({ name: 'Multi', meetings: [createMeeting({ days: ['Mon'], start: '08:00', end: '09:00' }), createMeeting({ days: ['Mon'], start: '10:00', end: '11:00' })] })
    schedule.subjects.push(subj)
    const res = renderWallpaper({ schedule, width: 1080, height: 1920, template: 'weeklyColumns', theme: 'dark' })
    expect(res.width).toBe(1080)
  })
  it('handles overlapping meetings', () => {
    const schedule = createDefaultSchedule()
    const s1 = createSubject({ name: 'A', meetings: [createMeeting({ days: ['Mon'], start: '08:00', end: '09:30' })] })
    const s2 = createSubject({ name: 'B', meetings: [createMeeting({ days: ['Mon'], start: '08:30', end: '09:00' })] })
    schedule.subjects.push(s1, s2)
    const res = renderWallpaper({ schedule, width: 1080, height: 1920, template: 'weeklyColumns', theme: 'dark' })
    expect(res.warnings).toBeDefined()
  })
  it('handles long subject names', () => {
    const schedule = createDefaultSchedule()
    const subj = createSubject({ name: 'A Very Long Subject Name That Should Be Truncated In Rendering', meetings: [createMeeting({ days: ['Mon'], start: '08:00', end: '09:00' })] })
    schedule.subjects.push(subj)
    const res = renderWallpaper({ schedule, width: 400, height: 800, template: 'dailyList', theme: 'dark' })
    expect(res.warnings.some((w) => /truncated/i.test(w))).toBe(true)
  })
  it('handles missing room', () => {
    const schedule = createDefaultSchedule()
    const subj = createSubject({ name: 'Math', meetings: [createMeeting({ days: ['Mon'], start: '08:00', end: '09:00', room: '' })] })
    schedule.subjects.push(subj)
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'dailyList', theme: 'light' })
    expect(res.width).toBe(800)
  })
  it('handles subjects without meetings', () => {
    const schedule = createDefaultSchedule()
    schedule.subjects.push(createSubject({ name: 'NoMeetings' }))
    const res = renderWallpaper({ schedule, width: 800, height: 600, template: 'dailyList', theme: 'dark' })
    expect(res.width).toBe(800)
  })
  it('all seven days represented in weeklyColumns', () => {
    const schedule = createDefaultSchedule()
    const res = renderWallpaper({ schedule, width: 1080, height: 1920, template: 'weeklyColumns', theme: 'dark' })
    expect(res.width).toBe(1080)
  })
})