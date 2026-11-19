import { useState } from 'react'
import { WALLPAPER_PRESETS, LEGACY_TEMPLATE_MAP } from '../rendering/wallpaper.js'

const TEMPLATE_OPTIONS = [
  { value: 'dailyList', label: 'Daily List' },
  { value: 'weeklyColumns', label: 'Weekly Columns' },
  { value: 'todayFocus', label: 'Today Focus' },
]

function normalizeTemplate(t) {
  return LEGACY_TEMPLATE_MAP[t] || t
}

const IconTemplate = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
)

const IconTheme = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
)

const IconSize = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

export function SettingsPanel({ settings, onChange, onSeePreview }) {
  const [custom, setCustom] = useState(settings.wallpaperPreset === 'custom')
  function set(key, value) {
    onChange({ [key]: value })
  }
  const templateValue = normalizeTemplate(settings.template)
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Customize your wallpaper</h2>
        <p className="mt-1 text-sm text-ink-3">Tailor your schedule to your style.</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink" htmlFor="template">
          {IconTemplate}
          Template
        </label>
        <select
          id="template"
          value={templateValue}
          onChange={(e) => set('template', e.target.value)}
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {TEMPLATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink" htmlFor="theme">
          {IconTheme}
          Wallpaper theme
        </label>
        <select
          id="theme"
          value={settings.theme}
          onChange={(e) => set('theme', e.target.value)}
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink" htmlFor="preset">
          {IconSize}
          Wallpaper size
        </label>
        <select
          id="preset"
          value={settings.wallpaperPreset}
          onChange={(e) => {
            const v = e.target.value
            setCustom(v === 'custom')
            set('wallpaperPreset', v)
          }}
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
        >
          {Object.entries(WALLPAPER_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
          <option value="custom">Custom dimensions</option>
        </select>
      </div>

      {(custom || settings.wallpaperPreset === 'custom') ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink-2" htmlFor="custom-w">
              Width
            </label>
            <input
              id="custom-w"
              type="number"
              value={settings.width || ''}
              onChange={(e) => set('width', Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-2" htmlFor="custom-h">
              Height
            </label>
            <input
              id="custom-h"
              type="number"
              value={settings.height || ''}
              onChange={(e) => set('height', Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Display options</p>
        <label className="flex min-h-[44px] items-center justify-between gap-3 rounded-md px-2 text-sm text-ink">
          <span>Show room</span>
          <input
            type="checkbox"
            checked={settings.showRoom}
            onChange={(e) => set('showRoom', e.target.checked)}
            className="h-4 w-4"
          />
        </label>
        <label className="flex min-h-[44px] items-center justify-between gap-3 rounded-md px-2 text-sm text-ink">
          <span>Show time</span>
          <input
            type="checkbox"
            checked={settings.showTime}
            onChange={(e) => set('showTime', e.target.checked)}
            className="h-4 w-4"
          />
        </label>
        <label className="flex min-h-[44px] items-center justify-between gap-3 rounded-md px-2 text-sm text-ink">
          <span>Show safe zones</span>
          <input
            type="checkbox"
            checked={settings.showSafeZones}
            onChange={(e) => set('showSafeZones', e.target.checked)}
            className="h-4 w-4"
          />
        </label>
      </div>

      <p className="text-xs text-ink-3">Changes update the preview instantly.</p>

      {onSeePreview ? (
        <button
          type="button"
          onClick={onSeePreview}
          className="min-h-[48px] w-full rounded-lg bg-accent px-4 text-sm font-bold text-accent-ink hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-focus"
        >
          See preview
        </button>
      ) : null}
    </section>
  )
}