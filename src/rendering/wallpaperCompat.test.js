import { describe, it, expect } from 'vitest'
import { LEGACY_TEMPLATE_MAP } from './wallpaper.js'

describe('wallpaper compat exports', () => {
  it('exports LEGACY_TEMPLATE_MAP with established mappings', () => {
    expect(LEGACY_TEMPLATE_MAP).toBeDefined()
    expect(LEGACY_TEMPLATE_MAP.classic).toBe('weeklyColumns')
    expect(LEGACY_TEMPLATE_MAP.compact).toBe('dailyList')
    expect(LEGACY_TEMPLATE_MAP.minimal).toBe('todayFocus')
  })
})